import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

import { useI18n } from "@/lib/i18n";
import { LogOut, UtensilsCrossed, ShoppingBag, TrendingUp, Clock, ArrowRight, AlertTriangle, BellRing, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DashboardPage } from "@/components/dashboard-page";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

interface Restaurant {
  id: string;
  name: string;
}

interface RecentOrder {
  id: string;
  table_number: number | null;
  status: string;
  total: number;
  created_at: string;
}

interface StuckOrder {
  id: string;
  table_number: number | null;
  created_at: string;
}

interface PendingAssistance {
  id: string;
  table_number: number | null;
  customer_name: string;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [yesterdayRevenue, setYesterdayRevenue] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stuckOrders, setStuckOrders] = useState<StuckOrder[]>([]);
  const [pendingAssistance, setPendingAssistance] = useState<PendingAssistance[]>([]);

  const loadDashboardData = async (restaurantId: string) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .then(({ count }) => setProductCount(count ?? 0));

    supabase
      .from("orders")
      .select("id, total, status", { count: "exact" })
      .eq("restaurant_id", restaurantId)
      .gte("created_at", todayStart.toISOString())
      .then(({ data: orders, count }) => {
        setOrderCount(count ?? 0);
        const pending = (orders ?? []).filter((o) => o.status === "pending" || o.status === "preparing").length;
        setPendingCount(pending);
        const total = (orders ?? [])
          .filter((o) => o.status === "paid")
          .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
        setRevenue(total);
      });

    supabase
      .from("orders")
      .select("total, status")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", yesterdayStart.toISOString())
      .lt("created_at", todayStart.toISOString())
      .then(({ data: yOrders }) => {
        const total = (yOrders ?? [])
          .filter((o) => o.status === "paid")
          .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
        setYesterdayRevenue(total);
      });

    supabase
      .from("orders")
      .select("id, table_number, status, total, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data: recent }) => setRecentOrders(recent ?? []));

    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    supabase
      .from("orders")
      .select("id, table_number, created_at")
      .eq("restaurant_id", restaurantId)
      .in("status", ["pending", "preparing"])
      .lt("created_at", fifteenMinAgo.toISOString())
      .then(({ data: stuck }) => setStuckOrders(stuck ?? []));

    supabase
      .from("assistance_requests")
      .select("id, table_number, customer_name")
      .eq("restaurant_id", restaurantId)
      .eq("status", "pending")
      .then(({ data: assist }) => setPendingAssistance(assist ?? []));
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRestaurant(data);
        if (!data) return;
        loadDashboardData(data.id);
      });
  }, [user]);

  useEffect(() => {
    if (!restaurant) return;
    const interval = setInterval(() => loadDashboardData(restaurant.id), 30000);
    return () => clearInterval(interval);
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) return;
    const channel = supabase
      .channel(`home-${restaurant.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurant.id}` }, () =>
        loadDashboardData(restaurant.id),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assistance_requests", filter: `restaurant_id=eq.${restaurant.id}` },
        () => loadDashboardData(restaurant.id),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant]);

  const onLogout = async () => {
    await signOut();
    toast.success("À bientôt !");
    navigate({ to: "/" });
  };

  return (
    <DashboardPage
      headerExtra={
        <button onClick={onLogout} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </button>
      }
    >
        <div className="rounded-3xl border border-border bg-gradient-brand p-6 text-primary-foreground shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Restaurant</p>
          <h1 className="mt-1 text-2xl font-extrabold">{restaurant?.name ?? "…"}</h1>
          <p className="mt-2 text-sm opacity-90">Bienvenue sur votre tableau de bord.</p>
        </div>

        {(stuckOrders.length > 0 || pendingAssistance.length > 0) && (
          <div className="mt-5 space-y-2">
            {stuckOrders.length > 0 && (
              <Link
                to="/dashboard/orders"
                className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 transition-colors hover:bg-destructive/10"
              >
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {stuckOrders.length} {stuckOrders.length > 1 ? "commandes en attente depuis plus de 15 min" : "commande en attente depuis plus de 15 min"}
                  </p>
                  <p className="text-xs text-muted-foreground">Table {stuckOrders.map((o) => o.table_number ?? "—").join(", ")}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            )}
            {pendingAssistance.length > 0 && (
              <Link
                to="/dashboard/assistance"
                className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
              >
                <BellRing className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {pendingAssistance.length} {pendingAssistance.length > 1 ? "demandes d'assistance en attente" : "demande d'assistance en attente"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pendingAssistance.map((a) => `${a.customer_name} (Table ${a.table_number ?? "—"})`).join(", ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi
            icon={TrendingUp}
            label="Revenu du jour"
            value={revenue !== null ? `${revenue.toFixed(2)} DT` : "…"}
            comparison={revenue !== null && yesterdayRevenue !== null ? computeComparison(revenue, yesterdayRevenue) : null}
          />
          <Kpi icon={ShoppingBag} label="Commandes" value={orderCount !== null ? String(orderCount) : "…"} />
          <Kpi icon={Clock} label="En cours" value={pendingCount !== null ? String(pendingCount) : "…"} />
          <Kpi icon={UtensilsCrossed} label="Produits" value={productCount !== null ? String(productCount) : "…"} />
        </div>

        {recentOrders.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Commandes récentes</h2>
              <Link to="/dashboard/orders" className="text-xs font-semibold text-primary hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-background text-sm font-bold">
                      {o.table_number ?? "—"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Table {o.table_number ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(o.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold text-gold">{Number(o.total).toFixed(2)} DT</p>
                    <p className="text-xs text-muted-foreground">{statusLabel(o.status)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {productCount === 0 && (
          <Link
            to="/dashboard/menu"
            className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-sm transition-colors hover:bg-primary/10"
          >
            <div>
              <p className="font-semibold text-foreground">{t("menu.title")}</p>
              <p className="mt-1 text-muted-foreground">{t("menu.noCategoriesHint")}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          </Link>
        )}
    </DashboardPage>
  );
}

function computeComparison(today: number, yesterday: number): { percent: number; up: boolean } | null {
  if (yesterday === 0) return null;
  const percent = Math.round(((today - yesterday) / yesterday) * 100);
  return { percent: Math.abs(percent), up: percent >= 0 };
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `il y a ${hours}h`;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Reçue",
    preparing: "En préparation",
    ready: "Prête",
    paid: "Payée",
    cancelled: "Annulée",
  };
  return map[status] ?? status;
}

function Kpi({
  icon: Icon,
  label,
  value,
  comparison,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  comparison?: { percent: number; up: boolean } | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-2xl font-extrabold">{value}</p>
        {comparison && (
          <span className={`mb-0.5 text-xs font-bold ${comparison.up ? "text-primary" : "text-destructive"}`}>
            {comparison.up ? "+" : "-"}{comparison.percent}%
          </span>
        )}
      </div>
    </div>
  );
}