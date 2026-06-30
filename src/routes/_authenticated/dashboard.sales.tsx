import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { TrendingUp, TrendingDown, ShoppingBag, Star, CheckCircle2, Wallet, Calendar as CalendarIcon, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from "recharts";
import { format, subDays, subMonths, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InfoTooltip } from "@/components/info-tooltip";

export const Route = createFileRoute("/_authenticated/dashboard/sales")({
  component: SalesPage,
});

function StatCard({ label, value, sub, icon: Icon, trend, tip }: { label: string; value: string; sub?: string; icon: any; trend?: number; tip?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground min-h-[2rem] leading-tight flex items-center gap-1.5">
          {label}{tip && <InfoTooltip text={tip} />}
        </p>
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

type Period = "week" | "month" | "year" | "custom";

function SalesPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [range, setRange] = useState<{ from: Date; to: Date }>({ from: startOfDay(subDays(new Date(), 29)), to: new Date() });
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({ from: range.from, to: range.to });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [chartData, setChartData] = useState<{ label: string; revenue: number; orders: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrder, setAvgOrder] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [prevRevenue, setPrevRevenue] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [bestPeriod, setBestPeriod] = useState<{ label: string; revenue: number } | null>(null);
  const [paidRevenue, setPaidRevenue] = useState(0);

  const setPreset = (p: Period) => {
    setPeriod(p);
    const now = new Date();
    if (p === "week") setRange({ from: startOfDay(subDays(now, 6)), to: now });
    else if (p === "month") setRange({ from: startOfDay(subDays(now, 29)), to: now });
    else if (p === "year") setRange({ from: startOfDay(subMonths(now, 11)), to: now });
  };

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
      const start = startOfDay(range.from);
      const end = endOfDay(range.to);
      const days = differenceInDays(end, start) + 1;
      const prevStart = startOfDay(subDays(start, days));
      const prevEnd = startOfDay(start);

      const [{ data: orders }, { data: prevOrders }, { data: reviews }] = await Promise.all([
        supabase.from("orders").select("total, status, created_at").eq("restaurant_id", restaurantId).gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
        supabase.from("orders").select("total, status").eq("restaurant_id", restaurantId).gte("created_at", prevStart.toISOString()).lt("created_at", prevEnd.toISOString()),
        supabase.from("reviews").select("rating").eq("restaurant_id", restaurantId).gte("created_at", start.toISOString()),
      ]);

      const completed = (orders ?? []).filter((o: any) => o.status !== "cancelled");
      const rev = completed.reduce((s: number, o: any) => s + Number(o.total), 0);
      const paid = (orders ?? []).filter((o: any) => o.status === "paid").reduce((s: number, o: any) => s + Number(o.total), 0);
      const pRev = (prevOrders ?? []).filter((o: any) => o.status !== "cancelled").reduce((s: number, o: any) => s + Number(o.total), 0);
      const ratings = (reviews ?? []).map((r: any) => r.rating);

      setTotalRevenue(rev);
      setTotalOrders(completed.length);
      setAvgOrder(completed.length > 0 ? rev / completed.length : 0);
      setPrevRevenue(pRev);
      setPaidRevenue(paid);
      setAvgRating(ratings.length > 0 ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length : 0);
      setCompletionRate((orders ?? []).length > 0 ? (completed.length / (orders ?? []).length) * 100 : 0);

      // Build chart based on period granularity
      const map: Record<string, { revenue: number; orders: number }> = {};
      const useMonthly = period === "year" || days > 92;

      if (useMonthly) {
        const months = Math.min(Math.ceil(days / 30), 24);
        for (let i = months - 1; i >= 0; i--) { const d = format(subMonths(new Date(), i), "MMM yy", { locale: fr }); map[d] = { revenue: 0, orders: 0 }; }
        completed.forEach((o: any) => { const d = format(new Date(o.created_at), "MMM yy", { locale: fr }); if (map[d]) { map[d].revenue += Number(o.total); map[d].orders += 1; } });
      } else {
        for (let i = days - 1; i >= 0; i--) { const d = format(subDays(range.to, i), "dd/MM"); map[d] = { revenue: 0, orders: 0 }; }
        completed.forEach((o: any) => { const d = format(new Date(o.created_at), "dd/MM"); if (map[d]) { map[d].revenue += Number(o.total); map[d].orders += 1; } });
      }

      const cd = Object.entries(map).map(([label, v]) => ({ label, ...v }));
      setChartData(cd);

      const sorted = [...cd].filter(d => d.revenue > 0).sort((a, b) => b.revenue - a.revenue);
      setBestPeriod(sorted[0] ?? null);

      setLoading(false);
    };
    load();
  }, [restaurantId, range.from, range.to, period]);

  const revTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const maxRev = Math.max(...chartData.map(d => d.revenue), 0);

  return (
    <DashboardPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Ventes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vue globale de vos revenus</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["week", "month", "year"] as const).map(p => (
            <button key={p} onClick={() => setPreset(p)} className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${period === p ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
              {p === "week" ? "7 jours" : p === "month" ? "30 jours" : "12 mois"}
            </button>
          ))}
          <Popover open={calendarOpen} onOpenChange={(open) => { setCalendarOpen(open); if (open) setTempRange({ from: range.from, to: range.to }); }}>
            <PopoverTrigger asChild>
              <button className={`rounded-full px-3 py-1.5 text-xs font-semibold border flex items-center gap-1.5 transition-colors ${period === "custom" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {period === "custom" ? `${format(range.from, "dd/MM/yy")} – ${format(range.to, "dd/MM/yy")}` : "Personnalisé"}
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
                    if (tempRange.from && tempRange.to) { setRange({ from: tempRange.from, to: tempRange.to }); setPeriod("custom"); setCalendarOpen(false); }
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
            <StatCard label="Chiffre d'affaires" value={`${totalRevenue.toFixed(2)} DT`} icon={TrendingUp} trend={revTrend} tip="Le total de vos revenus sur la période (hors commandes annulées), comparé à la période précédente." />
            <StatCard label="Commandes" value={`${totalOrders}`} icon={ShoppingBag} sub="commandes complétées" tip="Le nombre total de commandes complétées (non annulées) sur la période." />
            <StatCard label="Panier moyen" value={`${avgOrder.toFixed(2)} DT`} icon={Wallet} sub="par commande" tip="Le montant moyen dépensé par commande. Calculé en divisant le chiffre d'affaires par le nombre de commandes." />
            <StatCard label="Taux complétion" value={`${completionRate.toFixed(0)}%`} icon={CheckCircle2} sub="commandes livrées" tip="Le pourcentage de commandes complétées par rapport au total. Plus c'est élevé, mieux c'est." />
          </div>

          {/* Secondary cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">Revenus encaissés <InfoTooltip text="Le montant des commandes marquées comme payées. Représente l'argent réellement encaissé." /></p>
                <p className="text-xl font-extrabold">{paidRevenue.toFixed(2)} DT</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10">
                <Award className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">Meilleure période <InfoTooltip text="Le jour (ou mois) où vous avez généré le plus de revenus sur la période sélectionnée." /></p>
                <p className="text-xl font-extrabold">{bestPeriod?.label ?? "—"}</p>
                {bestPeriod && <p className="text-xs text-muted-foreground">{bestPeriod.revenue.toFixed(2)} DT</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5 flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10">
                <Star className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">Note moyenne <InfoTooltip text="La note moyenne laissée par vos clients sur la période, sur 5 étoiles." /></p>
                <p className="text-xl font-extrabold">{avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "—"}</p>
              </div>
            </div>
          </div>

          {/* Revenue evolution */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4 flex items-center gap-2">Évolution des revenus <InfoTooltip text="L'évolution de votre chiffre d'affaires au fil du temps. Affiché par jour pour les courtes périodes, par mois pour les longues." /></p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7ab450" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7ab450" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={chartData.length > 30 ? 4 : 0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} DT`} />
                <Area type="monotone" dataKey="revenue" stroke="#7ab450" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders bar chart */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-sm font-bold mb-4 flex items-center gap-2">Commandes par période <InfoTooltip text="Le nombre de commandes pour chaque jour ou mois. La période la plus active est mise en évidence." /></p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={chartData.length > 30 ? 4 : 0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.revenue === maxRev && maxRev > 0 ? "#f59e0b" : "#7ab450"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          

          {totalRevenue === 0 && (
            <div className="rounded-2xl border border-border bg-background p-10 text-center">
              <p className="text-muted-foreground text-sm">Aucune vente sur cette période.</p>
            </div>
          )}
        </div>
      )}
    </DashboardPage>
  );
}