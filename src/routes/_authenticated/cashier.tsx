import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { playOrderSound, unlockAudio, setSoundEnabled, isSoundEnabled } from "@/lib/notif-sound";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/lang-switch";
import { Button } from "@/components/ui/button";
import { X, Wallet, Receipt } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cashier")({
  component: CashierPage,
});

type OrderStatus = "pending" | "preparing" | "ready" | "paid" | "cancelled";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  table_number: number | null;
  status: OrderStatus;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

function CashierPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const knownAssistIds = useRef<Set<string>>(new Set());
  const assistFirstLoad = useRef(true);

  const loadOrders = async (rid: string) => {
    const { data } = await supabase
      .from("orders")
      .select("id, table_number, status, total, created_at, order_items(id, product_name, product_price, quantity)")
      .eq("restaurant_id", rid)
      .in("status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: true });
    setOrders((data as Order[]) ?? []);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, notification_prefs")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRestaurantId(data.id);
          setSoundEnabled(data.notification_prefs?.soundAlerts ?? true);
          loadOrders(data.id);
        }
      });
  }, [user]);

  // Unlock audio on first interaction + keep warm
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    const onVisible = () => { if (document.visibilityState === "visible") unlockAudio(); };
    document.addEventListener("visibilitychange", onVisible);
    const keepWarm = setInterval(unlockAudio, 5000);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(keepWarm);
    };
  }, []);

  // Assistance requests — beep when a new one arrives
  useEffect(() => {
    if (!restaurantId) return;
    const checkAssist = async () => {
      const { data } = await supabase
        .from("assistance_requests")
        .select("id, created_at")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(20);
      const list = data ?? [];
      if (!assistFirstLoad.current && isSoundEnabled()) {
        const hasNew = list.some((a: any) => !knownAssistIds.current.has(a.id));
        if (hasNew) playOrderSound();
      }
      list.forEach((a: any) => knownAssistIds.current.add(a.id));
      assistFirstLoad.current = false;
    };
    checkAssist();
    const ch = supabase
      .channel(`cashier-assist-${restaurantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "assistance_requests" }, checkAssist)
      .subscribe();
    const poll = setInterval(checkAssist, 15000);
    return () => { supabase.removeChannel(ch); clearInterval(poll); };
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel(`cashier-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` },
        () => loadOrders(restaurantId),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => loadOrders(restaurantId))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const tables = useMemo(() => {
    const map = new Map<number, { orders: Order[]; items: OrderItem[]; total: number }>();
    for (const order of orders) {
      const key = order.table_number ?? 0;
      if (!map.has(key)) map.set(key, { orders: [], items: [], total: 0 });
      const entry = map.get(key)!;
      entry.orders.push(order);
      entry.items.push(...order.order_items);
      entry.total += Number(order.total);
    }
    return Array.from(map.entries())
      .map(([tableNumber, data]) => ({ tableNumber, ...data }))
      .sort((a, b) => a.tableNumber - b.tableNumber);
  }, [orders]);

  const markPaid = async (orderIds: string[]) => {
    if (!window.confirm(t("cashier.confirmPaid"))) return;
    setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)));
    await supabase.from("orders").update({ status: "paid" }).in("id", orderIds);
  };
  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{t("cashier.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("cashier.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitch />
          <Link to="/dashboard/orders">
            <Button variant="outline" className="gap-1.5">
              <X className="h-4 w-4" />
              {t("cashier.exit")}
            </Button>
          </Link>
        </div>
      </header>

      {tables.length === 0 ? (
        <p className="mt-20 text-center text-lg text-muted-foreground">{t("cashier.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => {
            // merge identical items
            const merged = new Map<string, { name: string; price: number; qty: number }>();
            for (const item of table.items) {
              const key = item.product_name;
              const existing = merged.get(key);
              if (existing) existing.qty += item.quantity;
              else merged.set(key, { name: item.product_name, price: Number(item.product_price), qty: item.quantity });
            }

            return (
              <div key={table.tableNumber} className="flex flex-col rounded-2xl border-2 border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold">
                    {table.tableNumber || "—"}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" />
                    {table.orders.length} {t("cashier.ordersCount")}
                  </span>
                </div>

                <div className="mt-3 flex-1 space-y-1.5 border-t border-border/60 pt-3">
                  {Array.from(merged.values()).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span>
                        <span className="font-bold text-primary">{item.qty}×</span> {item.name}
                      </span>
                      <span className="text-muted-foreground">{(item.price * item.qty).toFixed(2)} DT</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-sm font-semibold text-muted-foreground">{t("cashier.total")}</span>
                  <span className="text-xl font-extrabold text-gold">{table.total.toFixed(2)} DT</span>
                </div>

                <Button
                  onClick={() => markPaid(table.orders.map((o) => o.id))}
                  className="mt-4 h-12 w-full gap-2 text-base font-bold"
                >
                  <Wallet className="h-5 w-5" />
                  {t("cashier.markPaid")}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}