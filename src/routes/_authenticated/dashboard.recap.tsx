import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { TrendingUp, TrendingDown, ShoppingBag, Star, BellRing, Clock, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard/recap")({
  component: RecapPage,
});

function KpiCard({ title, value, sub, icon: Icon, trend }: { title: string; value: string; sub?: string; icon: any; trend?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-h-[3rem] flex items-center mt-2 mb-2">
        <p className="text-2xl font-extrabold leading-none whitespace-nowrap">{value}</p>
      </div>
      <div className="mt-auto">
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-green-600" : "text-destructive"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}% vs hier
          </div>
        )}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = { pending: "En attente", preparing: "En préparation", ready: "Prêt", paid: "Payé", cancelled: "Annulé" };
const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-400", preparing: "bg-blue-400", ready: "bg-green-500", paid: "bg-primary", cancelled: "bg-destructive" };
const ACTIVE_STATUSES = ["pending", "preparing", "ready"];

function RecapPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [avgOrder, setAvgOrder] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [cancelRate, setCancelRate] = useState(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);
  const [yesterdayOrders, setYesterdayOrders] = useState(0);
  const [lastWeekRevenue, setLastWeekRevenue] = useState(0);
  const [peakHour, setPeakHour] = useState<string | null>(null);
  const [hourlyData, setHourlyData] = useState<{ hour: string; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [topCategory, setTopCategory] = useState<string | null>(null);
  const [activeStatusSummary, setActiveStatusSummary] = useState<Record<string, number>>({});
  const [doneStatusSummary, setDoneStatusSummary] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [assistanceCount, setAssistanceCount] = useState(0);
  const restaurantIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setRestaurantId(data.id); restaurantIdRef.current = data.id; }
    });
  }, [user]);

  const loadData = async (rid: string) => {
    const now = new Date();
    const todayStart = startOfDay(now).toISOString();
    const todayEnd = endOfDay(now).toISOString();
    const yStart = startOfDay(subDays(now, 1)).toISOString();
    const yEnd = endOfDay(subDays(now, 1)).toISOString();
    const wStart = startOfDay(subDays(now, 7)).toISOString();
    const wEnd = endOfDay(subDays(now, 7)).toISOString();

    const [{ data: todayData }, { data: yData }, { data: wData }, { data: reviews }, { data: assistance }, { data: cats }] = await Promise.all([
      supabase.from("orders").select("id, total, status, created_at, customer_name, table_number").eq("restaurant_id", rid).gte("created_at", todayStart).lte("created_at", todayEnd).order("created_at", { ascending: false }),
      supabase.from("orders").select("total, status").eq("restaurant_id", rid).gte("created_at", yStart).lte("created_at", yEnd),
      supabase.from("orders").select("total, status").eq("restaurant_id", rid).gte("created_at", wStart).lte("created_at", wEnd),
      supabase.from("reviews").select("rating").eq("restaurant_id", rid).gte("created_at", todayStart),
      supabase.from("assistance_requests").select("id").eq("restaurant_id", rid).gte("created_at", todayStart),
      supabase.from("categories").select("id, name").eq("restaurant_id", rid),
    ]);

    const todayIds = (todayData ?? []).map((o: any) => o.id);
    const { data: items } = todayIds.length > 0
      ? await supabase.from("order_items").select("product_name, product_price, quantity, order_id").in("order_id", todayIds)
      : { data: [] };

    const { data: prodRows } = todayIds.length > 0
      ? await supabase.from("products").select("id, name, category_id").eq("restaurant_id", rid)
      : { data: [] };

    const completed = (todayData ?? []).filter((o: any) => o.status !== "cancelled");
    const cancelled = (todayData ?? []).filter((o: any) => o.status === "cancelled");
    const rev = completed.reduce((s: number, o: any) => s + Number(o.total), 0);
    const yRev = (yData ?? []).filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total), 0);
    const wRev = (wData ?? []).filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total), 0);

    setTodayRevenue(rev);
    setTodayOrders(completed.length);
    setAvgOrder(completed.length > 0 ? rev / completed.length : 0);
    setYesterdayRevenue(yRev);
    setYesterdayOrders((yData ?? []).filter((o: any) => o.status !== "cancelled").length);
    setLastWeekRevenue(wRev);
    setCancelRate((todayData ?? []).length > 0 ? (cancelled.length / (todayData ?? []).length) * 100 : 0);
    setAssistanceCount((assistance ?? []).length);
    setRecentOrders((todayData ?? []).slice(0, 5));
    const hourCount: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourCount[i] = 0;
    completed.forEach((o: any) => { hourCount[new Date(o.created_at).getHours()] += 1; });
    const peak = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];
    setPeakHour(peak && peak[1] > 0 ? `${peak[0]}h (${peak[1]} commandes)` : null);

    const ratings = (reviews ?? []).map((r: any) => r.rating);
    setAvgRating(ratings.length > 0 ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length : 0);

    // Active vs done status
    const active: Record<string, number> = {};
    const done: Record<string, number> = {};
    (todayData ?? []).forEach((o: any) => {
      if (ACTIVE_STATUSES.includes(o.status)) active[o.status] = (active[o.status] ?? 0) + 1;
      else done[o.status] = (done[o.status] ?? 0) + 1;
    });
    setActiveStatusSummary(active);
    setDoneStatusSummary(done);

    // Hourly — show all 24 hours
    const hourly: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourly[i] = 0;
    completed.forEach((o: any) => { hourly[new Date(o.created_at).getHours()] += Number(o.total); });
    setHourlyData(Object.entries(hourly).map(([h, v]) => ({ hour: `${h}h`, revenue: v })));

    // Top products
    const prodMap: Record<string, { qty: number; revenue: number }> = {};
    (items ?? []).forEach((item: any) => {
      const key = item.product_name.split(" +")[0].split(" (")[0];
      if (!prodMap[key]) prodMap[key] = { qty: 0, revenue: 0 };
      prodMap[key].qty += item.quantity;
      prodMap[key].revenue += item.quantity * Number(item.product_price);
    });
    setTopProducts(Object.entries(prodMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 5));

    // Top category
    const catRevMap: Record<string, number> = {};
    (items ?? []).forEach((item: any) => {
      const cleanName = item.product_name.split(" +")[0].split(" (")[0];
      const prod = (prodRows ?? []).find((p: any) => p.name === cleanName);
      if (prod?.category_id) {
        const cat = (cats ?? []).find((c: any) => c.id === prod.category_id);
        if (cat) {
          catRevMap[cat.name] = (catRevMap[cat.name] ?? 0) + item.quantity * Number(item.product_price);
        }
      }
    });
    const topCat = Object.entries(catRevMap).sort((a, b) => b[1] - a[1])[0];
    setTopCategory(topCat ? `${topCat[0]} (${topCat[1].toFixed(2)} DT)` : null);

    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (!restaurantId) return;
    loadData(restaurantId);

    const interval = setInterval(() => {
      if (restaurantIdRef.current) loadData(restaurantIdRef.current);
    }, 30000);

    const channel = supabase
      .channel("recap-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` }, () => {
        if (restaurantIdRef.current) loadData(restaurantIdRef.current);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "assistance_requests", filter: `restaurant_id=eq.${restaurantId}` }, () => {
        if (restaurantIdRef.current) loadData(restaurantIdRef.current);
      })
      .subscribe();

    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [restaurantId]);

  const revTrend = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  const orderTrend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;
  const weekTrend = lastWeekRevenue > 0 ? ((todayRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0;
  const totalActive = Object.values(activeStatusSummary).reduce((s, v) => s + v, 0);

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Récapitulatif</h1>
          <p className="mt-1 text-sm text-muted-foreground">{format(new Date(), "EEEE d MMMM yyyy")}</p>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            Mis à jour à {format(lastUpdated, "HH:mm:ss")}
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="mt-6 space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard title="Chiffre d'affaires" value={`${todayRevenue.toFixed(2)} DT`} icon={TrendingUp} trend={revTrend} />
            <KpiCard title="Commandes" value={`${todayOrders}`} icon={ShoppingBag} trend={orderTrend} />
            <KpiCard title="Panier moyen" value={`${avgOrder.toFixed(2)} DT`} icon={TrendingUp} sub="par commande" />
            <KpiCard title="Note moyenne" value={avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "—"} icon={Star} sub={`Annulations: ${cancelRate.toFixed(0)}%`} />
            <KpiCard title="Même jour sem. dern." value={`${lastWeekRevenue.toFixed(2)} DT`} icon={TrendingUp} trend={weekTrend} />
          </div>

          {/* Clients + Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Heure de pointe</p>
                <p className="text-2xl font-extrabold">{peakHour ?? "—"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meilleure catégorie</p>
                <p className="text-lg font-extrabold">{topCategory ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Active orders + Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Commandes actives
                {totalActive > 0 && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">{totalActive}</span>}
              </p>
              <p className="text-xs text-muted-foreground mb-4">En attente · En préparation · Prêt</p>
              {Object.keys(activeStatusSummary).length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune commande active</p>
              ) : (
                <div className="space-y-2">
                  {ACTIVE_STATUSES.filter(s => activeStatusSummary[s]).map((status) => (
                    <div key={status} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                        <span className="text-sm font-medium">{STATUS_LABELS[status]}</span>
                      </div>
                      <span className="text-sm font-bold">{activeStatusSummary[status]}</span>
                    </div>
                  ))}
                </div>
              )}
              {Object.keys(doneStatusSummary).length > 0 && (
                <div className="mt-4 pt-4 border-t border-border space-y-1.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Terminées</p>
                  {Object.entries(doneStatusSummary).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status] ?? "bg-muted"}`} />
                        <span className="text-muted-foreground">{STATUS_LABELS[status] ?? status}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-4">Autres indicateurs</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                    Demandes d'assistance
                  </div>
                  <span className={`text-sm font-bold ${assistanceCount > 0 ? "text-yellow-500" : ""}`}>{assistanceCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    Commandes annulées
                  </div>
                  <span className={`text-sm font-bold ${(doneStatusSummary["cancelled"] ?? 0) > 0 ? "text-destructive" : ""}`}>{doneStatusSummary["cancelled"] ?? 0}</span>
                </div>
                
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Taux d'annulation
                  </div>
                  <span className={`text-sm font-bold ${cancelRate > 10 ? "text-destructive" : ""}`}>{cancelRate.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent orders */}
          {recentOrders.length > 0 && (
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-bold">5 dernières commandes</p>
              </div>
              <div className="divide-y divide-border">
                {recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(o.created_at), "HH:mm")} · Table {o.table_number ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        o.status === "paid" ? "bg-primary/10 text-primary" :
                        o.status === "ready" ? "bg-green-100 text-green-700" :
                        o.status === "preparing" ? "bg-blue-100 text-blue-700" :
                        o.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{STATUS_LABELS[o.status] ?? o.status}</span>
                      <span className="text-sm font-bold">{Number(o.total).toFixed(2)} DT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hourly chart */}
          {hourlyData.length > 0 && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-4">Revenus par heure</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyData}>
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} DT`} />
                  <Bar dataKey="revenue" fill="#7ab450" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top products */}
          {topProducts.length > 0 && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-4">Top produits aujourd'hui</p>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-xs font-bold text-muted-foreground">{p.qty}x · {p.revenue.toFixed(2)} DT</p>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentOrders.length === 0 && (
            <div className="rounded-2xl border border-border bg-background p-10 text-center">
              <p className="text-muted-foreground text-sm">Aucune commande aujourd'hui pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </DashboardPage>
  );
}