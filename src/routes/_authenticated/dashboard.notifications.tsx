import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/components/dashboard-page";
import { ShoppingBag, Ban, BellRing, Star, FileText, Volume2, Smartphone, Mail, Clock, Check } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/notifications")({
  component: NotificationsPage,
});

interface Prefs {
  newOrder: boolean; orderCancelled: boolean; assistanceRequest: boolean; newReview: boolean;
  dailySummary: boolean; soundAlerts: boolean; channelInApp: boolean; channelEmail: boolean;
}
const DEFAULT_PREFS: Prefs = {
  newOrder: true, orderCancelled: true, assistanceRequest: true, newReview: true,
  dailySummary: false, soundAlerts: true, channelInApp: true, channelEmail: false,
};

// Play a notification sound using Web Audio API (no file needed)
function playOrderSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [880, 1100, 1320];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  } catch (e) { /* audio not available */ }
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[1.375rem]" : "left-0.5"}`} />
    </button>
  );
}

function PrefRow({ icon: Icon, title, desc, checked, onChange }: { icon: any; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-start gap-3 min-w-0">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted/60 text-muted-foreground"><Icon className="h-4 w-4" /></div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

interface FeedItem {
  id: string;
  type: "order" | "cancelled" | "review" | "assistance";
  title: string; desc: string; time: string;
}

type FilterType = "all" | "order" | "review" | "assistance";

const LAST_SEEN_KEY = "menufy_notif_last_seen";

function NotificationsPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [lastSeen, setLastSeen] = useState<number>(() => Number(localStorage.getItem(LAST_SEEN_KEY) ?? 0));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefsRef = useRef<Prefs>(DEFAULT_PREFS);
  const knownIds = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  useEffect(() => { prefsRef.current = prefs; }, [prefs]);

  useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id, notification_prefs").eq("owner_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setRestaurantId(data.id);
        setPrefs({ ...DEFAULT_PREFS, ...(data.notification_prefs ?? {}) });
      }
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!restaurantId) return;
    const load = async () => {
      const [{ data: orders }, { data: reviews }, { data: assistance }] = await Promise.all([
        supabase.from("orders").select("id, status, customer_name, total, created_at, table_number").eq("restaurant_id", restaurantId).order("created_at", { ascending: false }).limit(20),
        supabase.from("reviews").select("id, rating, created_at, table_number").eq("restaurant_id", restaurantId).order("created_at", { ascending: false }).limit(15),
        supabase.from("assistance_requests").select("id, customer_name, created_at, table_number").eq("restaurant_id", restaurantId).order("created_at", { ascending: false }).limit(15),
      ]);

      const items: FeedItem[] = [];
      (orders ?? []).forEach((o: any) => {
        if (o.status === "cancelled") items.push({ id: `c-${o.id}`, type: "cancelled", title: "Commande annulée", desc: `${o.customer_name} · Table ${o.table_number ?? "—"}`, time: o.created_at });
        else items.push({ id: `o-${o.id}`, type: "order", title: "Nouvelle commande", desc: `${o.customer_name} · ${Number(o.total).toFixed(2)} DT · Table ${o.table_number ?? "—"}`, time: o.created_at });
      });
      (reviews ?? []).forEach((r: any) => items.push({ id: `r-${r.id}`, type: "review", title: `Nouvel avis ${r.rating}★`, desc: `Table ${r.table_number ?? "—"}`, time: r.created_at }));
      (assistance ?? []).forEach((a: any) => items.push({ id: `a-${a.id}`, type: "assistance", title: "Demande d'assistance", desc: `${a.customer_name} · Table ${a.table_number ?? "—"}`, time: a.created_at }));

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      const trimmed = items.slice(0, 40);

      // Detect genuinely new orders for sound (skip first load)
      if (!firstLoad.current && prefsRef.current.soundAlerts) {
        const newOrder = trimmed.find(it => it.type === "order" && !knownIds.current.has(it.id));
        if (newOrder) playOrderSound();
      }
      trimmed.forEach(it => knownIds.current.add(it.id));
      firstLoad.current = false;

      setFeed(trimmed);
    };
    load();

    const channel = supabase
      .channel("notif-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews", filter: `restaurant_id=eq.${restaurantId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "assistance_requests", filter: `restaurant_id=eq.${restaurantId}` }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  const update = (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!restaurantId) return;
      const { error } = await supabase.from("restaurants").update({ notification_prefs: next }).eq("id", restaurantId);
      if (error) toast.error("Erreur d'enregistrement");
      else toast.success("Préférences enregistrées ✅");
    }, 600);
  };

  const markAllRead = () => {
    const now = Date.now();
    setLastSeen(now);
    localStorage.setItem(LAST_SEEN_KEY, String(now));
    window.dispatchEvent(new Event("menufy-notif-seen"));
    toast.success("Tout marqué comme lu");
  };

  const feedIcon = (type: FeedItem["type"]) => {
    switch (type) {
      case "order": return { icon: ShoppingBag, cls: "bg-primary/10 text-primary" };
      case "cancelled": return { icon: Ban, cls: "bg-red-100 text-red-600" };
      case "review": return { icon: Star, cls: "bg-gold/10 text-gold" };
      case "assistance": return { icon: BellRing, cls: "bg-yellow-100 text-yellow-600" };
    }
  };

  const filtered = feed.filter(it => {
    if (filter === "all") return true;
    if (filter === "order") return it.type === "order" || it.type === "cancelled";
    return it.type === filter;
  });

  const unreadCount = feed.filter(it => new Date(it.time).getTime() > lastSeen).length;

  // Group by day
  const groups: { label: string; items: FeedItem[] }[] = [];
  filtered.forEach(it => {
    const d = new Date(it.time);
    const label = isToday(d) ? "Aujourd'hui" : isYesterday(d) ? "Hier" : format(d, "d MMMM yyyy", { locale: fr });
    let g = groups.find(g => g.label === label);
    if (!g) { g = { label, items: [] }; groups.push(g); }
    g.items.push(it);
  });

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "order", label: "Commandes" },
    { key: "review", label: "Avis" },
    { key: "assistance", label: "Assistance" },
  ];

  return (
    <DashboardPage>
      <div>
        <h1 className="text-2xl font-extrabold">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gérez vos alertes et consultez votre activité récente</p>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Preferences */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-1">Types d'alertes</p>
              <p className="text-xs text-muted-foreground mb-2">Choisissez les événements pour lesquels vous souhaitez être notifié.</p>
              <div className="divide-y divide-border">
                <PrefRow icon={ShoppingBag} title="Nouvelle commande" desc="Quand un client passe une commande" checked={prefs.newOrder} onChange={(v) => update("newOrder", v)} />
                <PrefRow icon={Ban} title="Commande annulée" desc="Quand une commande est annulée" checked={prefs.orderCancelled} onChange={(v) => update("orderCancelled", v)} />
                <PrefRow icon={BellRing} title="Demande d'assistance" desc="Quand une table demande de l'aide" checked={prefs.assistanceRequest} onChange={(v) => update("assistanceRequest", v)} />
                <PrefRow icon={Star} title="Nouvel avis" desc="Quand un client laisse une note" checked={prefs.newReview} onChange={(v) => update("newReview", v)} />
                <PrefRow icon={FileText} title="Résumé journalier" desc="Un récapitulatif en fin de journée" checked={prefs.dailySummary} onChange={(v) => update("dailySummary", v)} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-bold mb-1">Son & canaux</p>
              <p className="text-xs text-muted-foreground mb-2">Comment et où recevoir vos notifications.</p>
              <div className="divide-y divide-border">
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted/60 text-muted-foreground"><Volume2 className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Alerte sonore</p>
                      <p className="text-xs text-muted-foreground">Jouer un son à chaque nouvelle commande</p>
                      <button onClick={playOrderSound} className="mt-1 text-xs font-semibold text-primary">▶ Tester le son</button>
                    </div>
                  </div>
                  <Toggle checked={prefs.soundAlerts} onChange={(v) => update("soundAlerts", v)} />
                </div>
                <PrefRow icon={Smartphone} title="Dans l'application" desc="Afficher les notifications dans le tableau de bord" checked={prefs.channelInApp} onChange={(v) => update("channelInApp", v)} />
                <PrefRow icon={Mail} title="Par email" desc="Recevoir un email pour les alertes importantes" checked={prefs.channelEmail} onChange={(v) => update("channelEmail", v)} />
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl border border-border bg-background overflow-hidden h-fit">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-bold">Activité récente</p>
                {unreadCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" /> Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto scrollbar-none">
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${filter === f.key ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground/40"><BellRing className="h-6 w-6" /></div>
                <p className="text-sm text-muted-foreground">Aucune activité</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {groups.map(group => (
                  <div key={group.label}>
                    <p className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 sticky top-0">{group.label}</p>
                    <div className="divide-y divide-border">
                      {group.items.map((item) => {
                        const { icon: Icon, cls } = feedIcon(item.type)!;
                        const isUnread = new Date(item.time).getTime() > lastSeen;
                        return (
                          <div key={item.id} className={`flex items-start gap-3 px-5 py-3.5 ${isUnread ? "bg-primary/5" : ""}`}>
                            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${cls}`}><Icon className="h-4 w-4" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold flex items-center gap-2">
                                {item.title}
                                {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {format(new Date(item.time), "HH:mm")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardPage>
  );
}