import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { Download, TrendingUp, TrendingDown, Calendar as CalendarIcon, BarChart3, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell, AreaChart, Area } from "recharts";
import { format, subDays, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InfoTooltip } from "@/components/info-tooltip";

export const Route = createFileRoute("/_authenticated/dashboard/daily-report")({
  component: DailyReportPage,
});

function StatCard({ label, value, sub, icon: Icon, trend }: { label: string; value: string; sub?: string; icon: any; trend?: number }) {
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
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-green-600" : "text-destructive"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}% vs période préc.
          </div>
        )}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

const DOW_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function DailyReportPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ from: Date; to: Date }>({ from: startOfDay(subDays(new Date(), 29)), to: new Date() });
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({ from: range.from, to: range.to });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const days = differenceInDays(range.to, range.from) + 1;
  const setPreset = (n: number) => setRange({ from: startOfDay(subDays(new Date(), n - 1)), to: new Date() });
  const [dailyData, setDailyData] = useState<{ date: string; revenue: number; orders: number; avgOrder: number }[]>([]);
  const [cumulativeData, setCumulativeData] = useState<{ date: string; cumulative: number }[]>([]);
  const [dowData, setDowData] = useState<{ day: string; revenue: number; orders: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgDaily, setAvgDaily] = useState(0);
  const [prevRevenue, setPrevRevenue] = useState(0);
  const [bestDay, setBestDay] = useState<{ date: string; revenue: number } | null>(null);
  const [worstDay, setWorstDay] = useState<{ date: string; revenue: number } | null>(null);

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
      const prevStart = startOfDay(subDays(range.from, days)).toISOString();
      const prevEnd = startOfDay(range.from).toISOString();

      const [{ data: orders }, { data: prevOrders }] = await Promise.all([
        supabase.from("orders").select("total, status, created_at").eq("restaurant_id", restaurantId).gte("created_at", start).lte("created_at", end).neq("status", "cancelled"),
        supabase.from("orders").select("total, status").eq("restaurant_id", restaurantId).gte("created_at", prevStart).lt("created_at", prevEnd).neq("status", "cancelled"),
      ]);

      const map: Record<string, { revenue: number; orders: number }> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = format(subDays(range.to, i), "dd/MM");
        map[d] = { revenue: 0, orders: 0 };
      }
      (orders ?? []).forEach((o: any) => {
        const d = format(new Date(o.created_at), "dd/MM");
        if (map[d]) { map[d].revenue += Number(o.total); map[d].orders += 1; }
      });

      const daily = Object.entries(map).map(([date, v]) => ({ date, ...v, avgOrder: v.orders > 0 ? v.revenue / v.orders : 0 }));
      setDailyData(daily);

      // Cumulative
      let run = 0;
      setCumulativeData(daily.map(d => { run += d.revenue; return { date: d.date, cumulative: run }; }));

      // Day of week
      const dow: Record<number, { revenue: number; orders: number }> = {};
      for (let i = 0; i < 7; i++) dow[i] = { revenue: 0, orders: 0 };
      (orders ?? []).forEach((o: any) => {
        const d = new Date(o.created_at).getDay();
        dow[d].revenue += Number(o.total);
        dow[d].orders += 1;
      });
      // Reorder Mon-Sun
      const order = [1, 2, 3, 4, 5, 6, 0];
      setDowData(order.map(i => ({ day: DOW_LABELS[i], ...dow[i] })));

      const total = daily.reduce((s, d) => s + d.revenue, 0);
      const totalOrd = daily.reduce((s, d) => s + d.orders, 0);
      const pRev = (prevOrders ?? []).reduce((s: number, o: any) => s + Number(o.total), 0);

      setTotalRevenue(total);
      setTotalOrders(totalOrd);
      setAvgDaily(total / days);
      setPrevRevenue(pRev);

      const sorted = [...daily].filter(d => d.revenue > 0).sort((a, b) => b.revenue - a.revenue);
      setBestDay(sorted[0] ?? null);
      setWorstDay(sorted.length > 1 ? sorted[sorted.length - 1] : null);

      setLoading(false);
    };
    load();
  }, [restaurantId, range.from, range.to]);

  const exportCSV = () => {
    const header = "Date,Revenus (DT),Commandes,Panier moyen (DT)";
    const rows = dailyData.map((d, i) => {
      const fullDate = format(subDays(range.to, dailyData.length - 1 - i), "dd MMMM yyyy", { locale: fr });
      return `${fullDate},${d.revenue.toFixed(2)},${d.orders},${d.avgOrder.toFixed(2)}`;
    });
    const csv = "\uFEFF" + [header, ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menufy-rapport-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = dailyData.map(d => `<tr><td>${d.date}</td><td>${d.revenue.toFixed(2)} DT</td><td>${d.orders}</td><td>${d.avgOrder.toFixed(2)} DT</td></tr>`).join("");
    win.document.write(`
      <html><head><title>Rapport Menufy</title>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 40px; color: #1c1f16; }
        h1 { font-size: 24px; }
        .meta { color: #666; margin-bottom: 24px; }
        .cards { display: flex; gap: 16px; margin-bottom: 24px; }
        .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; flex: 1; }
        .card p:first-child { font-size: 11px; text-transform: uppercase; color: #888; margin: 0; }
        .card p:last-child { font-size: 20px; font-weight: 800; margin: 4px 0 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 700; }
      </style></head><body>
      <h1>Rapport journalier — ${days} jours</h1>
      <p class="meta">Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm")}</p>
      <div class="cards">
        <div class="card"><p>Total revenus</p><p>${totalRevenue.toFixed(2)} DT</p></div>
        <div class="card"><p>Total commandes</p><p>${totalOrders}</p></div>
        <div class="card"><p>Revenu moyen/jour</p><p>${avgDaily.toFixed(2)} DT</p></div>
      </div>
      <table><thead><tr><th>Date</th><th>Revenus</th><th>Commandes</th><th>Panier moyen</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 0);
  const bestDow = [...dowData].sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Rapport journalier</h1>
          <p className="mt-1 text-sm text-muted-foreground">Analyse de vos performances par jour</p>
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
                  {tempRange.from && tempRange.to
                    ? `${differenceInDays(tempRange.to, tempRange.from) + 1} jours sélectionnés`
                    : "Sélectionnez une période"}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setCalendarOpen(false)}>Annuler</Button>
                  <Button
                    size="sm"
                    disabled={!tempRange.from || !tempRange.to}
                    onClick={() => {
                      if (tempRange.from && tempRange.to) {
                        setRange({ from: tempRange.from, to: tempRange.to });
                        setCalendarOpen(false);
                      }
                    }}
                  >
                    Confirmer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportPDF} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="mt-6 space-y-6">

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total revenus" value={`${totalRevenue.toFixed(2)} DT`} icon={TrendingUp} trend={growth} />
            <StatCard label="Total commandes" value={`${totalOrders}`} icon={BarChart3} sub={`sur ${days} jours`} />
            <StatCard label="Revenu moyen / jour" value={`${avgDaily.toFixed(2)} DT`} icon={CalendarIcon} sub="moyenne période" />
            <StatCard label="Meilleur jour semaine" value={bestDow?.day ?? "—"} icon={Award} sub={bestDow ? `${bestDow.revenue.toFixed(2)} DT au total` : undefined} />
          </div>

          {/* Best & worst day */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-green-100 text-green-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Meilleur jour</p>
                <p className="text-xl font-extrabold">{bestDay?.date ?? "—"}</p>
                {bestDay && <p className="text-xs text-muted-foreground">{bestDay.revenue.toFixed(2)} DT</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-red-100 text-red-700">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jour le plus faible</p>
                <p className="text-xl font-extrabold">{worstDay?.date ?? "—"}</p>
                {worstDay && <p className="text-xs text-muted-foreground">{worstDay.revenue.toFixed(2)} DT</p>}
              </div>
            </div>
          </div>

          {/* Revenue bar chart with best day highlighted */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4 flex items-center gap-2">Revenus par jour <InfoTooltip text="Vos revenus pour chaque jour de la période. Le jour le plus rentable est mis en évidence en doré." /></p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={days > 30 ? 6 : days > 7 ? 2 : 0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} DT`} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {dailyData.map((entry, i) => (
                    <Cell key={i} fill={entry.revenue === maxRevenue && maxRevenue > 0 ? "#f59e0b" : "#7ab450"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> Meilleur jour mis en évidence
            </p>
          </div>

          {/* Cumulative revenue */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4 flex items-center gap-2">Revenus cumulés <InfoTooltip text="Le total de vos revenus qui s'accumule jour après jour. Montre votre progression sur la période." /></p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorCumul" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7ab450" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7ab450" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={days > 30 ? 6 : days > 7 ? 2 : 0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} DT`} />
                <Area type="monotone" dataKey="cumulative" stroke="#7ab450" strokeWidth={2} fill="url(#colorCumul)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Day of week performance */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4 flex items-center gap-2">Performance par jour de semaine <InfoTooltip text="Compare vos revenus selon le jour de la semaine (lundi à dimanche). Utile pour repérer vos meilleurs jours." /></p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} DT`} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {dowData.map((entry, i) => (
                    <Cell key={i} fill={bestDow && entry.day === bestDow.day ? "#f59e0b" : "#7ab450"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders line chart */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4 flex items-center gap-2">Commandes par jour <InfoTooltip text="Le nombre de commandes reçues chaque jour de la période." /></p>
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

          {/* Detail table */}
          <div className="rounded-2xl border border-border bg-background overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-sm font-bold flex items-center gap-2">Détail par jour <InfoTooltip text="Tableau détaillé jour par jour : nombre de commandes, panier moyen et revenus totaux." /></p>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {[...dailyData].reverse().map(d => (
                <div key={d.date} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm font-medium w-16">{d.date}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground w-16 text-right">{d.orders} cmd</span>
                    <span className="text-muted-foreground w-24 text-right">{d.avgOrder.toFixed(2)} DT moy.</span>
                    <span className="font-bold w-24 text-right">{d.revenue.toFixed(2)} DT</span>
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