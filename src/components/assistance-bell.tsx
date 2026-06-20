import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface AssistanceRequest {
  id: string;
  table_number: number | null;
  customer_name: string;
  message: string | null;
  status: string;
  created_at: string;
}

export function AssistanceBell() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRestaurantId(data.id);
      });
  }, [user]);

  useEffect(() => {
    if (!restaurantId) return;

    supabase
      .from("assistance_requests")
      .select("id, table_number, customer_name, message, status, created_at")
      .eq("restaurant_id", restaurantId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRequests(data ?? []));

    const channel = supabase
      .channel(`assistance-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "assistance_requests", filter: `restaurant_id=eq.${restaurantId}` },
        (payload) => {
          const newReq = payload.new as AssistanceRequest;
          setRequests((prev) => [newReq, ...prev]);
          toast(t("dashboard.assistance.newRequest"), {
            description: newReq.customer_name + (newReq.table_number ? ` · ${t("client.table")} ${newReq.table_number}` : ""),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, t]);

  const markHandled = async (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("assistance_requests").update({ status: "handled" }).eq("id", id);
  };

  if (!restaurantId) return null;

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
        aria-label={t("dashboard.assistance.button")}
      >
        <BellRing className={`h-5 w-5 ${requests.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
        {requests.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {requests.length}
          </span>
        )}
      </button>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 p-4" onClick={() => setPanelOpen(false)}>
          <div
            className="mt-16 w-full max-w-sm rounded-2xl bg-background p-4 shadow-xl max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">{t("dashboard.assistance.title")}</h2>
              <button onClick={() => setPanelOpen(false)} className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            {requests.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("dashboard.assistance.empty")}</p>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{r.customer_name}</p>
                      {r.table_number != null && (
                        <span className="text-xs font-medium text-muted-foreground">{t("client.table")} {r.table_number}</span>
                      )}
                    </div>
                    {r.message && <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>}
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      {new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <button
                      onClick={() => markHandled(r.id)}
                      className="mt-2 w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      {t("dashboard.assistance.markHandled")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}