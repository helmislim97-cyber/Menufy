import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { subDays, startOfDay, endOfDay, differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, ShoppingBag, CheckCircle2, Ban, Package } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InfoTooltip } from "@/components/info-tooltip";

export const Route = createFileRoute("/_authenticated/dashboard/orders-stats")({
  component: OrdersStatsPage,
});

const COLORS = ["#7ab450", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];
const STATUS_LABELS: Record<string, string> = { pending: "En attente", preparing: "En préparation", ready: "Prêt", paid: "Payé", cancelled: "Annulé" };
const DOW_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: any }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-h-[2rem] leading-tight">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
      <div className="min-h-[3rem] flex items-center mt-2 mb-2">
        <p className="text-2xl font-extrabold leading-none whitespace-nowrap">{value}</p>
      </div>
      <div className="mt-auto">
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function OrdersStatsPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ from: Date; to: Date }>({ from: startOfDay(subDays(new Date(), 29)), to: new Date() });
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({ from: range.from, to: range.to });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [totalOrders, setTotalOrders] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [cancelRate, setCancelRate] = useState(0);
  const [avgItems, setAvgItems] = useState(0);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [cancelledProducts, setCancelledProducts] = useState<{ name: string; qty: number }[]>([]);
  const [tableData, setTableData] = useState<{ table: string; orders: number; revenue: number }[]>([]);
  const [peakHours, setPeakHours] = useState<{ hour: string; orders: number }[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<{ day: string; orders: number; revenue: number }[]>([]);
  const [orderSizeDist, setOrderSizeDist] = useState<{ size: string; count: number }[]>([]);

  const days = differenceInDays(range.to, range.from) + 1;
  const setPreset = (n: number) => setRange({ from: startOfDay(subDays(new Date(), n - 1)), to: new Date() });

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
      const start = startOfDay(range.from).toISOString();
      const end = endOfDay(range.to).toISOString();

      const { data: orders } = await supabase.from("orders").select("id, total, status, created_at, table_number").eq("restaurant_id", restaurantId).gte("created_at", start).lte("created_at", end);
      const orderIds = (orders ?? []).map((o: any) => o.id);
      const { data: items } = orderIds.length > 0
        ? await supabase.from("order_items").select("product_name, product_price, quantity, order_id").in("order_id", orderIds)
        : { data: [] };

      const completed = (orders ?? []).filter((o: any) => o.status !== "cancelled");
      const cancelled = (orders ?? []).filter((o: any) => o.status === "cancelled");

      setTotalOrders((orders ?? []).length);
      setCompletionRate((orders ?? []).length > 0 ? (completed.length / (orders ?? []).length) * 100 : 0);
      setCancelRate((orders ?? []).length > 0 ? (cancelled.length / (orders ?? []).length) * 100 : 0);

      // Avg items per order
      const itemsPerOrder: Record<string, number> = {};
      (items ?? []).forEach((it: any) => { itemsPerOrder[it.order_id] = (itemsPerOrder[it.order_id] ?? 0) + it.quantity; });
      const orderSizes = Object.values(itemsPerOrder);
      setAvgItems(orderSizes.length > 0 ? orderSizes.reduce((s, v) => s + v, 0) / orderSizes.length : 0);

      // Order size distribution
      const sizeBuckets: Record<string, number> = { "1 article": 0, "2-3 articles": 0, "4-5 articles": 0, "6+ articles": 0 };
      orderSizes.forEach(s => {
        if (s === 1) sizeBuckets["1 article"]++;
        else if (s <= 3) sizeBuckets["2-3 articles"]++;
        else if (s <= 5) sizeBuckets["4-5 articles"]++;
        else sizeBuckets["6+ articles"]++;
      });
      setOrderSizeDist(Object.entries(sizeBuckets).map(([size, count]) => ({ size, count })));

      // Status breakdown
      const statusMap: Record<string, number> = {};
      (orders ?? []).forEach((o: any) => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1; });
      setStatusData(Object.entries(statusMap).map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v })));

      // Top products
      const prodMap: Record<string, { qty: number; revenue: number }> = {};
      (items ?? []).forEach((item: any) => {
        const key = item.product_name.split(" +")[0].split(" (")[0];
        if (!prodMap[key]) prodMap[key] = { qty: 0, revenue: 0 };
        prodMap[key].qty += item.quantity;
        prodMap[key].revenue += item.quantity * Number(item.product_price);
      });
      setTopProducts(Object.entries(prodMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 10));

      // Cancelled products
      const cancelledIds = new Set(cancelled.map((o: any) => o.id));
      const cancelMap: Record<string, number> = {};
      (items ?? []).filter((it: any) => cancelledIds.has(it.order_id)).forEach((item: any) => {
        const key = item.product_name.split(" +")[0].split(" (")[0];
        cancelMap[key] = (cancelMap[key] ?? 0) + item.quantity;
      });
      setCancelledProducts(Object.entries(cancelMap).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5));

      // Table performance
      const tableMap: Record<string, { orders: number; revenue: number }> = {};
      completed.forEach((o: any) => {
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
      setPeakHours(Object.entries(hourMap).map(([h, v]) => ({ hour: `${h}h`, orders: v })));

      // Day of week
      const dowMap: Record<number, { orders: number; revenue: number }> = {};
      for (let i = 0; i < 7; i++) dowMap[i] = { orders: 0, revenue: 0 };
      completed.forEach((o: any) => {
        const d = new Date(o.created_at).getDay();
        dowMap[d].orders += 1;
        dowMap[d].revenue += Number(o.total);
      });
      const order = [1, 2, 3, 4, 5, 6, 0];
      setDayOfWeek(order.map(i => ({ day: DOW_LABELS[i], ...dowMap[i] })));

      setLoading(false);
    };
    load();
  }, [restaurantId, range.from, range.to]);

  const maxPeak = Math.max(...peakHours.map(h => h.orders), 0);
  const bestDow = [...dayOfWeek].sort((a, b) => b.orders - a.orders)[0];

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Statistiques commandes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analyse détaillée de vos commandes</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setPreset(d)} className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${days === d ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>{d}j</button>
          ))}
          <Popover open={calendarOpen} onOpenChange={(open) => { setCalendarOpen(open); if (open) setTempRange({ from: range.from, to: range.to }); }}>
            <PopoverTrigger asChild>
              <button className="rounded-full px-3 py-1.5 text-xs font-semibold border border-border text-muted-foreground hover:bg-accent flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {format(range.from, "dd/MM/yy")} – {format(range.to, "dd/MM/yy")}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DayPicker
                mode="range"
                locale={fr}
                selected={tempRange as any}
                disabled={{ before: subDays(new Date(), 730), after: new Date() }}
                onSelect={(r: any) => setTempRange(r ?? {})}
                numberOfMonths={2}
              />
              <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                <p className="text-xs text-muted-foreground">
                  {tempRange.from && tempRange.to ? `${differenceInDays(tempRange.to, tempRange.from) + 1} jours` : "Sélectionnez une période"}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCalendarOpen(false)}>Annuler</Button>
                  <Button size="sm" disabled={!tempRange.from || !tempRange.to} onClick={() => {
                    if (tempRange.from && tempRange.to) { setRange({ from: tempRange.from, to: tempRange.to }); setCalendarOpen(false); }
                  }}>Confirmer</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="mt-6 space-y-6">

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total commandes" value={`${totalOrders}`} icon={ShoppingBag} sub={`sur ${days} jours`} />
            <StatCard label="Taux complétion" value={`${completionRate.toFixed(0)}%`} icon={CheckCircle2} sub="commandes livrées" />
            <StatCard label="Taux annulation" value={`${cancelRate.toFixed(0)}%`} icon={Ban} sub="commandes annulées" />
            <StatCard label="Articles / commande" value={avgItems.toFixed(1)} icon={Package} sub="moyenne" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {statusData.length > 0 && (
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-sm font-bold mb-4 flex items-center gap-2">Répartition par statut <InfoTooltip text="Répartition de vos commandes selon leur statut : en attente, en préparation, prêt, payé ou annulé." /></p>
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
                        <span className="font-bold ml-auto">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {orderSizeDist.some(o => o.count > 0) && (
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-sm font-bold mb-4 flex items-center gap-2">Taille des commandes <InfoTooltip text="Combien de commandes contiennent 1 article, 2-3, 4-5 ou 6+ articles. Montre si vos clients commandent beaucoup ou peu." /></p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={orderSizeDist}>
                    <XAxis dataKey="size" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7ab450" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {dayOfWeek.some(d => d.orders > 0) && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-4 flex items-center gap-2">Commandes par jour de semaine <InfoTooltip text="Le nombre de commandes selon le jour de la semaine. Le meilleur jour est en doré. Utile pour planifier votre personnel." /></p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {dayOfWeek.map((entry, i) => (
                      <Cell key={i} fill={bestDow && entry.day === bestDow.day ? "#f59e0b" : "#7ab450"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {peakHours.some(h => h.orders > 0) && (
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-4 flex items-center gap-2">Heures de pointe <InfoTooltip text="Les heures de la journée où vous recevez le plus de commandes. L'heure la plus chargée est en rouge." /></p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {peakHours.map((entry, i) => (
                      <Cell key={i} fill={entry.orders === maxPeak && maxPeak > 0 ? "#ef4444" : "#7ab450"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Heure la plus chargée
              </p>
            </div>
          )}

          {topProducts.length > 0 && (
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-sm font-bold flex items-center gap-2">Top 10 produits <InfoTooltip text="Vos 10 produits les plus vendus sur la période, classés par quantité, avec le revenu généré." /></p>
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

          {cancelledProducts.length > 0 && (
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <Ban className="h-4 w-4 text-destructive" />
                <p className="text-sm font-bold flex items-center gap-2">Produits les plus annulés <InfoTooltip text="Les produits qui apparaissent le plus dans les commandes annulées. Un produit souvent annulé peut signaler un problème." /></p>
              </div>
              <div className="divide-y divide-border">
                {cancelledProducts.map((p) => (
                  <div key={p.name} className="flex items-center justify-between px-5 py-3">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <span className="text-sm font-bold text-destructive">{p.qty}x annulé</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tableData.length > 0 && (
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-sm font-bold flex items-center gap-2">Performance par table <InfoTooltip text="Les tables qui génèrent le plus de commandes et de revenus. Identifie vos meilleures places." /></p>
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

          {totalOrders === 0 && (
            <div className="rounded-2xl border border-border bg-background p-10 text-center">
              <p className="text-muted-foreground text-sm">Aucune commande sur cette période.</p>
            </div>
          )}
        </div>
      )}
    </DashboardPage>
  );
}