import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Clock, StickyNote, ChefHat, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/orders")({
  component: OrdersPage,
});

type OrderStatus = "pending" | "preparing" | "ready" | "paid" | "cancelled";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  notes: string | null;
}

interface Order {
  id: string;
  table_number: number | null;
  status: OrderStatus;
  total: number;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
  preparing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  ready: "bg-primary/15 text-primary border-primary/20",
  paid: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "paid",
};

const NEXT_ACTION_KEY: Partial<Record<OrderStatus, string>> = {
  pending: "orders.action.start",
  preparing: "orders.action.ready",
  ready: "orders.action.paid",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `il y a ${hours}h`;
}

function OrdersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async (rid: string) => {
    const { data } = await supabase
      .from("orders")
      .select("id, table_number, status, total, notes, created_at, order_items(id, product_name, product_price, quantity, notes)")
      .eq("restaurant_id", rid)
      .order("created_at", { ascending: false })
      .limit(50);
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setLoading(false);
          return;
        }
        setRestaurantId(data.id);
        loadOrders(data.id);
      });
  }, [user]);

  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel(`orders-${restaurantId}`)
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

  const advanceStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    await supabase.from("orders").update({ status: next }).eq("id", order.id);
  };

  const cancelOrder = async (order: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o)));
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
  };

  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing" || o.status === "ready");
  const historyOrders = orders.filter((o) => o.status === "paid" || o.status === "cancelled");

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <LangSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">{t("orders.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("orders.subtitle")}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link to="/kitchen">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ChefHat className="h-4 w-4" />
                {t("kitchen.openKitchen")}
              </Button>
            </Link>
            <Link to="/cashier">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Wallet className="h-4 w-4" />
                {t("cashier.openCashier")}
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center">
            <p className="font-semibold text-foreground">{t("orders.empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("orders.emptyHint")}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {activeOrders.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t("orders.active")}
                </h2>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      t={t}
                      onAdvance={() => advanceStatus(order)}
                      onCancel={() => cancelOrder(order)}
                    />
                  ))}
                </div>
              </section>
            )}

            {historyOrders.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t("orders.history")}
                </h2>
                <div className="space-y-3">
                  {historyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} t={t} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function OrderCard({
  order,
  t,
  onAdvance,
  onCancel,
}: {
  order: Order;
  t: (key: string) => string;
  onAdvance?: () => void;
  onCancel?: () => void;
}) {
  const nextActionKey = NEXT_ACTION_KEY[order.status];

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-background text-sm font-extrabold">
            {order.table_number ?? "—"}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {t("orders.table")} {order.table_number ?? "—"}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              {timeAgo(order.created_at)}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[order.status]}`}>
          {t(`orders.status.${order.status}`)}
        </span>
      </div>

      <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span>
              <span className="font-bold text-primary">{item.quantity}×</span> {item.product_name}
            </span>
            <span className="text-muted-foreground">{(Number(item.product_price) * item.quantity).toFixed(2)} DT</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
          <StickyNote className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{order.notes}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-sm font-extrabold text-gold">{Number(order.total).toFixed(2)} DT</span>
        {nextActionKey && onAdvance && (
          <div className="flex items-center gap-2">
            {onCancel && order.status === "pending" && (
              <Button size="sm" variant="ghost" onClick={onCancel} className="text-muted-foreground">
                {t("orders.action.cancel")}
              </Button>
            )}
            <Button size="sm" onClick={onAdvance}>
              {t(nextActionKey)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}