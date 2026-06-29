import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/daily-report")({
  component: DailyReportPage,
});

function DailyReportPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [dailyData, setDailyData] = useState<{ date: string; revenue: number; orders: number; avgOrder: number }[]>([]);

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
      const start = startOfDay(subDays(new Date(), days - 1)).toISOString();
      const { data: orders } = await supabase.from("orders").select("total, status, created_at").eq("restaurant_id", restaurantId).gte("created_at", start).neq("status", "cancelled");

      const map: Record<string, { revenue: number; orders: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "dd/MM");
        map[d] = { revenue: 0, orders: 0 };
      }

      (orders ?? []).forEach((o: any) => {
        const d = format(new Date(o.created_at), "dd/MM");
        if (map[d]) {
          map[d].revenue += Number(o.total);
          map[d].orders += 1;
        }
      });

      setDailyData(Object.entries(map).map(([date, v]) => ({ date, ...v, avgOrder: v.orders > 0 ? v.revenue / v.orders : 0 })));
      setLoading(false);
    };
    load();
  }, [restaurantId, days]);

  const exportCSV = () => {
    const csv = ["Date,Revenus (DT),Commandes,Panier moyen (DT)", ...dailyData.map(d => `${d.date},${d.revenue.toFixed(2)},${d.orders},${d.avgOrder.toFixed(2)}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menufy-rapport-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = dailyData.reduce((s, d) => s + d.orders, 0);
  const bestDay = [...dailyData].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Rapport journalier</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analyse de vos performances par jour</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${days === d ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>{d}j</button>
          ))}
          <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p> : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total revenus</p>
              <p className="mt-2 text-2xl font-extrabold">{totalRevenue.toFixed(2)} DT</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total commandes</p>
              <p className="mt-2 text-2xl font-extrabold">{totalOrders}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meilleur jour</p>
              <p className="mt-2 text-2xl font-extrabold">{bestDay?.date ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{bestDay?.revenue.toFixed(2)} DT</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4">Revenus par jour</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={days > 30 ? 6 : days > 7 ? 2 : 0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} DT`} />
                <Bar dataKey="revenue" fill="#7ab450" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4">Commandes par jour</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={days > 30 ? 6 : days > 7 ? 2 : 0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#7ab450" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-background overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-sm font-bold">Détail par jour</p>
            </div>
            <div className="divide-y divide-border">
              {[...dailyData].reverse().map(d => (
                <div key={d.date} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm font-medium">{d.date}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{d.orders} cmd</span>
                    <span className="text-muted-foreground">{d.avgOrder.toFixed(2)} DT moy.</span>
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