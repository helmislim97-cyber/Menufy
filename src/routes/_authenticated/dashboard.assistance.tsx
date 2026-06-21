import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { DashboardPage } from "@/components/dashboard-page";
import { BellRing, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/assistance")({
  component: AssistancePage,
});

interface AssistanceRequest {
  id: string;
  table_number: number | null;
  customer_name: string;
  message: string | null;
  status: string;
  created_at: string;
  handled_at: string | null;
}

type Filter = "pending" | "handled" | "all";

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `il y a ${hours}h`;
}

function formatResponseTime(createdAt: string, handledAt: string) {
  const mins = Math.round((new Date(handledAt).getTime() - new Date(createdAt).getTime()) / 60000);
  if (mins < 1) return "< 1 min";
  return `${mins} min`;
}

function AssistancePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");

  const loadRequests = async (rid: string) => {
    const { data } = await supabase
      .from("assistance_requests")
      .select("id, table_number, customer_name, message, status, created_at, handled_at")
      .eq("restaurant_id", rid)
      .order("created_at", { ascending: false })
      .limit(100);
    setRequests(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setLoading(false);
          return;
        }
        setRestaurantId(data.id);
        loadRequests(data.id);
      });
  }, [user]);

  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel(`assistance-page-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assistance_requests", filter: `restaurant_id=eq.${restaurantId}` },
        () => loadRequests(restaurantId),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const markHandled = async (id: string) => {
    const { error } = await supabase
      .from("assistance_requests")
      .update({ status: "handled", handled_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const handledRequests = requests.filter((r) => r.status === "handled");

  const isToday = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };
  const todayRequests = requests.filter((r) => isToday(r.created_at));
  const todayHandledWithTime = todayRequests.filter((r) => r.status === "handled" && r.handled_at);
  const avgResponseMins =
    todayHandledWithTime.length > 0
      ? Math.round(
          todayHandledWithTime.reduce((sum, r) => sum + (new Date(r.handled_at!).getTime() - new Date(r.created_at).getTime()) / 60000, 0) /
            todayHandledWithTime.length,
        )
      : null;

  const visibleRequests = filter === "pending" ? pendingRequests : filter === "handled" ? handledRequests : requests;

  return (
    <DashboardPage>
      <h1 className="text-2xl font-extrabold">{t("sidebar.assistance")}</h1>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
      ) : !restaurantId ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.noRestaurant")}</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aujourd'hui</p>
              <p className="mt-1 text-2xl font-extrabold">{todayRequests.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temps de réponse moyen</p>
              <p className="mt-1 text-2xl font-extrabold">{avgResponseMins !== null ? `${avgResponseMins} min` : "—"}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setFilter("pending")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === "pending" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground border border-border"
              }`}
            >
              En attente {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </button>
            <button
              onClick={() => setFilter("handled")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === "handled" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground border border-border"
              }`}
            >
              Traitées
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground border border-border"
              }`}
            >
              Toutes
            </button>
          </div>

          {visibleRequests.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 py-10">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-surface text-muted-foreground">
                <BellRing className="h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground">Aucune demande pour le moment</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {visibleRequests.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{r.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Table {r.table_number ?? "—"} · {timeAgo(r.created_at)}
                      </p>
                    </div>
                    {r.status === "pending" ? (
                      <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive">
                        <Clock className="h-3 w-3" />
                        En attente
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        {r.handled_at ? formatResponseTime(r.created_at, r.handled_at) : "Traitée"}
                      </span>
                    )}
                  </div>
                  {r.message && <p className="mt-2 text-sm text-muted-foreground">{r.message}</p>}
                  {r.status === "pending" && (
                    <button
                      onClick={() => markHandled(r.id)}
                      className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground sm:w-auto"
                    >
                      Marquer comme traité
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardPage>
  );
}