import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { TrendingUp, TrendingDown, ShoppingBag, Star } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, subMonths, subYears, startOfDay, startOfMonth, startOfYear } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard/sales")({
  component: SalesPage,
});

function SalesPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [chartData, setChartData] = useState<{ label: string; revenue: number; orders: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [prevRevenue, setPrevRevenue] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

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
      const now = new Date();
      let start: Date, prevStart: Date, prevEnd: Date;

      if (period === "week") {
        start = startOfDay(subDays(now, 6));
        prevStart = startOfDay(subDays(now, 13));
        prevEnd = startOfDay(subDays(now, 7));
      } else if (period === "month") {
        start = startOfDay(subDays(now, 29));
        prevStart = startOfDay(subDays(now, 59));
        prevEnd = startOfDay(subDays(now, 30));
      } else {
        start = startOfDay(subDays(now, 364));
        prevStart = startOfDay(subDays(now, 729));
        prevEnd = startOfDay(subDays(now, 365));
      }

      const [{ data: orders }, { data: prevOrders }, { data: reviews }] = await Promise.all([
        supabase.from("orders").select("total, status, created_at").eq("restaurant_id", restaurantId).gte("created_at", start.toISOString()),
        supabase.from("orders").select("total, status").eq("restaurant_id", restaurantId).gte("created_at", prevStart.toISOString()).lte("created_at", prevEnd.toISOString()),
        supabase.from("reviews").select("rating").eq("restaurant_id", restaurantId).gte("created_at", start.toISOString()),
      ]);

      const completed = (orders ?? []).filter((o: any) => o.status !== "cancelled");
      const rev = completed.reduce((s: number, o: any) => s + Number(o.total), 0);
      const pRev = (prevOrders ?? []).filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total), 0);
      const ratings = (reviews ?? []).map((r: any) => r.rating);

      setTotalRevenue(rev);
      setTotalOrders(completed.length);
      setPrevRevenue(pRev);
      setAvgRating(ratings.length > 0 ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length : 0);
      setCompletionRate((orders ?? []).length > 0 ? (completed.length / (orders ?? []).length) * 100 : 0);

      // Build chart data
      const map: Record<string, { revenue: number; orders: number }> = {};
      if (period === "week") {
        for (let i = 6; i >= 0; i--) { const d = format(subDays(now, i), "EEE dd/MM"); map[d] = { revenue: 0, orders: 0 }; }
        completed.forEach((o: any) => { const d = format(new Date(o.created_at), "EEE dd/MM"); if (map[d]) { map[d].revenue += Number(o.total); map[d].orders += 1; } });
      } else if (period === "month") {
        for (let i = 29; i >= 0; i--) { const d = format(subDays(now, i), "dd/MM"); map[d] = { revenue: 0, orders: 0 }; }
        completed.forEach((o: any) => { const d = format(new Date(o.created_at), "dd/MM"); if (map[d]) { map[d].revenue += Number(o.total); map[d].orders += 1; } });
      } else {
        for (let i = 11; i >= 0; i--) { const d = format(subMonths(now, i), "MMM yyyy"); map[d] = { revenue: 0, orders: 0 }; }
        completed.forEach((o: any) => { const d = format(new Date(o.created_at), "MMM yyyy"); if (map[d]) { map[d].revenue += Number(o.total); map[d].orders += 1; } });
      }

      setChartData(Object.entries(map).map(([label, v]) => ({ label, ...v })));
      setLoading(false);
    };
    load();
  }, [restaurantId, period]);

  const revTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Ventes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vue globale de vos revenus</p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month", "year"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${period === p ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>
              {p === "week" ? "7 jours" : p === "month" ? "30 jours" : "12 mois"}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p> : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chiffre d'affaires</p>
              <p className="mt-2 text-2xl font-extrabold">{totalRevenue.toFixed(2)} DT</p>
              <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${revTrend >= 0 ? "text-green-600" : "text-destructive"}`}>
                {revTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(revTrend).toFixed(1)}% vs période préc.
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commandes</p>
              <p className="mt-2 text-2xl font-extrabold">{totalOrders}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Taux complétion</p>
              <p className="mt-2 text-2xl font-extrabold">{completionRate.toFixed(0)}%</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Note moyenne</p>
              <p className="mt-2 text-2xl font-extrabold">{avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "—"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4">Évolution des revenus</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7ab450" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7ab450" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={period === "month" ? 4 : 0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} DT`} />
                <Area type="monotone" dataKey="revenue" stroke="#7ab450" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-background overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-sm font-bold">Détail par période</p>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {[...chartData].reverse().map(d => (
                <div key={d.label} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm font-medium">{d.label}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{d.orders} cmd</span>
                    <span className="font-bold">{d.revenue.toFixed(2)} DT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}