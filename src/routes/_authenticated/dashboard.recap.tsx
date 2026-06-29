import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { TrendingUp, TrendingDown, ShoppingBag, Star, Clock, Ban } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, startOfDay, endOfDay, startOfYesterday, endOfYesterday } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard/recap")({
  component: RecapPage,
});

function KpiCard({ title, value, sub, icon: Icon, trend }: { title: string; value: string; sub?: string; icon: any; trend?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-green-600" : "text-destructive"}`}>
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend).toFixed(1)}% vs yesterday
        </div>
      )}
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function RecapPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [avgOrder, setAvgOrder] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [cancelRate, setCancelRate] = useState(0);
  const [yesterdayRevenue, setYesterdayRevenue] = useState(0);
  const [yesterdayOrders, setYesterdayOrders] = useState(0);
  const [hourlyData, setHourlyData] = useState<{ hour: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setRestaurantId(data.id);
    });
  }, [user]);

  useEffect(() => {
    if (!restaurantId) return;
    const load = async () => {
      setLoading(true);
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();
      const yStart = startOfYesterday().toISOString();
      const yEnd = endOfYesterday().toISOString();

      const [{ data: todayOrdersData }, { data: yesterdayOrdersData }, { data: reviewsData }, { data: itemsData }] = await Promise.all([
        supabase.from("orders").select("id, total, status, created_at").eq("restaurant_id", restaurantId).gte("created_at", todayStart).lte("created_at", todayEnd),
        supabase.from("orders").select("id, total, status").eq("restaurant_id", restaurantId).gte("created_at", yStart).lte("created_at", yEnd),
        supabase.from("reviews").select("rating").eq("restaurant_id", restaurantId).gte("created_at", todayStart),
        supabase.from("order_items").select("product_name, product_price, quantity, order_id").in("order_id", (todayOrdersData ?? []).map((o: any) => o.id)),
      ]);

      const completed = (todayOrdersData ?? []).filter((o: any) => o.status !== "cancelled");
      const cancelled = (todayOrdersData ?? []).filter((o: any) => o.status === "cancelled");
      const rev = completed.reduce((s: number, o: any) => s + Number(o.total), 0);
      const yRev = (yesterdayOrdersData ?? []).filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total), 0);

      setTodayRevenue(rev);
      setTodayOrders(completed.length);
      setAvgOrder(completed.length > 0 ? rev / completed.length : 0);
      setYesterdayRevenue(yRev);
      setYesterdayOrders((yesterdayOrdersData ?? []).filter((o: any) => o.status !== "cancelled").length);
      setCancelRate((todayOrdersData ?? []).length > 0 ? (cancelled.length / (todayOrdersData ?? []).length) * 100 : 0);

      const ratings = (reviewsData ?? []).map((r: any) => r.rating);
      setAvgRating(ratings.length > 0 ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length : 0);

      // Hourly data
      const hourly: Record<number, { revenue: number; orders: number }> = {};
      for (let i = 0; i < 24; i++) hourly[i] = { revenue: 0, orders: 0 };
      completed.forEach((o: any) => {
        const h = new Date(o.created_at).getHours();
        hourly[h].revenue += Number(o.total);
        hourly[h].orders += 1;
      });
      setHourlyData(Object.entries(hourly).filter(([, v]) => v.orders > 0).map(([h, v]) => ({ hour: `${h}h`, ...v })));

      // Top products
      const prodMap: Record<string, { qty: number; revenue: number }> = {};
      (itemsData ?? []).forEach((item: any) => {
        const key = item.product_name.split(" +")[0].split(" (")[0];
        if (!prodMap[key]) prodMap[key] = { qty: 0, revenue: 0 };
        prodMap[key].qty += item.quantity;
        prodMap[key].revenue += item.quantity * Number(item.product_price);
      });
      setTopProducts(Object.entries(prodMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 5));

      setLoading(false);
    };
    load();
  }, [restaurantId]);

  const revTrend = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  const orderTrend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

  return (
    <DashboardPage>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Récapitulatif</h1>
          <p className="mt-1 text-sm text-muted-foreground">{format(new Date(), "EEEE d MMMM yyyy")}</p>
        </div>
      </div>

      {loading ? <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p> : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard title="Chiffre d'affaires" value={`${todayRevenue.toFixed(2)} DT`} icon={TrendingUp} trend={revTrend} />
            <KpiCard title="Commandes" value={`${todayOrders}`} icon={ShoppingBag} trend={orderTrend} />
            <KpiCard title="Panier moyen" value={`${avgOrder.toFixed(2)} DT`} icon={TrendingUp} sub="par commande" />
            <KpiCard title="Note moyenne" value={avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "—"} icon={Star} sub={`Taux annulation: ${cancelRate.toFixed(0)}%`} />
          </div>

          {hourlyData.length > 0 && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-4">Revenus par heure aujourd'hui</p>
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
        </div>
      )}
    </DashboardPage>
  );
}