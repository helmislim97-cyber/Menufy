import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { subDays, startOfDay } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard/orders-stats")({
  component: OrdersStatsPage,
});

const COLORS = ["#7ab450", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];
const DAYS_OPTIONS = [7, 30, 90];

function OrdersStatsPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [tableData, setTableData] = useState<{ table: string; orders: number; revenue: number }[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: string; orders: number }[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<{ day: string; orders: number; revenue: number }[]>([]);

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
      const { data: orders } = await supabase.from("orders").select("id, total, status, created_at, table_number").eq("restaurant_id", restaurantId).gte("created_at", start);
      const orderIds = (orders ?? []).map((o: any) => o.id);
      const { data: items } = orderIds.length > 0 ? await supabase.from("order_items").select("product_name, product_price, quantity, order_id").in("order_id", orderIds) : { data: [] };

      // Status breakdown
      const statusMap: Record<string, number> = {};
      (orders ?? []).forEach((o: any) => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1; });
      const statusLabels: Record<string, string> = { pending: "En attente", preparing: "En préparation", ready: "Prêt", paid: "Payé", cancelled: "Annulé" };
      setStatusData(Object.entries(statusMap).map(([k, v]) => ({ name: statusLabels[k] ?? k, value: v })));

      // Top products
      const prodMap: Record<string, { qty: number; revenue: number }> = {};
      (items ?? []).forEach((item: any) => {
        const key = item.product_name.split(" +")[0].split(" (")[0];
        if (!prodMap[key]) prodMap[key] = { qty: 0, revenue: 0 };
        prodMap[key].qty += item.quantity;
        prodMap[key].revenue += item.quantity * Number(item.product_price);
      });
      setTopProducts(Object.entries(prodMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 10));

      // Table performance
      const tableMap: Record<string, { orders: number; revenue: number }> = {};
      (orders ?? []).filter((o: any) => o.status !== "cancelled").forEach((o: any) => {
        const t = o.table_number ? `Table ${o.table_number}` : "Sans table";
        if (!tableMap[t]) tableMap[t] = { orders: 0, revenue: 0 };
        tableMap[t].orders += 1;
        tableMap[t].revenue += Number(o.total);
      });
      setTableData(Object.entries(tableMap).map(([table, v]) => ({ table, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 8));

      // Peak hours
      const hourMap: Record<number, number> = {};
      for (let i = 0; i < 24; i++) hourMap[i] = 0;
      (orders ?? []).forEach((o: any) => { hourMap[new Date(o.created_at).getHours()] += 1; });
      setPeakHours(Object.entries(hourMap).map(([h, v]) => ({ hour: `${h}h`, orders: v })).filter(h => h.orders > 0));

      // Day of week
      const dowMap: Record<number, { orders: number; revenue: number }> = {};
      for (let i = 0; i < 7; i++) dowMap[i] = { orders: 0, revenue: 0 };
      (orders ?? []).filter((o: any) => o.status !== "cancelled").forEach((o: any) => {
        const d = new Date(o.created_at).getDay();
        dowMap[d].orders += 1;
        dowMap[d].revenue += Number(o.total);
      });
      const dowLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
      setDayOfWeek(Object.entries(dowMap).map(([d, v]) => ({ day: dowLabels[Number(d)], ...v })));

      setLoading(false);
    };
    load();
  }, [restaurantId, days]);

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Statistiques commandes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analyse détaillée de vos commandes</p>
        </div>
        <div className="flex items-center gap-2">
          {DAYS_OPTIONS.map(d => (
            <button key={d} onClick={() => setDays(d)} className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${days === d ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"}`}>{d}j</button>
          ))}
        </div>
      </div>

      {loading ? <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p> : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {statusData.length > 0 && (
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-sm font-bold mb-4">Répartition par statut</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {statusData.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-bold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {dayOfWeek.length > 0 && (
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-sm font-bold mb-4">Commandes par jour de semaine</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={dayOfWeek}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#7ab450" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {peakHours.length > 0 && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-4">Heures de pointe</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {peakHours.map((entry, i) => (
                      <Cell key={i} fill={entry.orders === Math.max(...peakHours.map(h => h.orders)) ? "#ef4444" : "#7ab450"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {topProducts.length > 0 && (
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-sm font-bold">Top 10 produits</p>
              </div>
              <div className="divide-y divide-border">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xs font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">{p.qty}x</p>
                      <p className="text-xs text-muted-foreground">{p.revenue.toFixed(2)} DT</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tableData.length > 0 && (
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-sm font-bold">Performance par table</p>
              </div>
              <div className="divide-y divide-border">
                {tableData.map(t => (
                  <div key={t.table} className="flex items-center justify-between px-5 py-3">
                    <p className="text-sm font-semibold">{t.table}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-muted-foreground">{t.orders} cmd</span>
                      <span className="font-bold">{t.revenue.toFixed(2)} DT</span>
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