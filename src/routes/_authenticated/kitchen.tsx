import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/lang-switch";
import { Button } from "@/components/ui/button";
import { Clock, StickyNote, X, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/kitchen")({
  component: KitchenPage,
});

type OrderStatus = "pending" | "preparing" | "ready" | "paid" | "cancelled";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  notes: string | null;
}

interface Order {
  id: string;
  table_number: number | null;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
};

const CARD_STYLE: Record<OrderStatus, string> = {
  pending: "border-yellow-500/40 bg-yellow-500/5",
  preparing: "border-blue-500/40 bg-blue-500/5",
  ready: "border-primary/50 bg-primary/5",
  paid: "",
  cancelled: "",
};

const BADGE_STYLE: Record<OrderStatus, string> = {
  pending: "bg-yellow-500 text-black",
  preparing: "bg-blue-500 text-white",
  ready: "bg-primary text-primary-foreground",
  paid: "",
  cancelled: "",
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "0 min";
  return `${mins} min`;
}

function KitchenPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async (rid: string) => {
    const { data } = await supabase
      .from("orders")
      .select("id, table_number, status, notes, created_at, order_items(id, product_name, quantity, notes)")
      .eq("restaurant_id", rid)
      .in("status", ["pending", "preparing"])
      .order("created_at", { ascending: true });
    setOrders((data as Order[]) ?? []);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRestaurantId(data.id);
          loadOrders(data.id);
        }
      });
  }, [user]);

  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel(`kitchen-${restaurantId}`)
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

  // Tick every 30s so "time ago" stays fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const advanceStatus = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setOrders((prev) => prev.filter((o) => o.id !== order.id || next === "preparing" || next === "ready"));
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    await supabase.from("orders").update({ status: next }).eq("id", order.id);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{t("kitchen.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("kitchen.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitch />
          <Link to="/dashboard/orders">
            <Button variant="outline" className="gap-1.5">
              <X className="h-4 w-4" />
              {t("kitchen.exit")}
            </Button>
          </Link>
        </div>
      </header>

      {orders.length === 0 ? (
        <p className="mt-20 text-center text-lg text-muted-foreground">{t("kitchen.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <div key={order.id} className={`flex flex-col rounded-2xl border-2 p-4 ${CARD_STYLE[order.status]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold">
                    {order.table_number ?? "—"}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${BADGE_STYLE[order.status]}`}>
                    {order.status === "pending" ? t("kitchen.newOrder") : t(`orders.status.${order.status}`)}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {timeAgo(order.created_at)}
                </p>

                <div className="mt-3 flex-1 space-y-1.5 border-t border-border/60 pt-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-baseline gap-2 text-lg font-semibold">
                      <span className="text-primary">{item.quantity}×</span>
                      <span>{item.product_name}</span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-sm text-muted-foreground">
                    <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{order.notes}</span>
                  </div>
                )}

                {next && (
                  <Button onClick={() => advanceStatus(order)} className="mt-4 h-12 w-full gap-2 text-base font-bold">
                    <ArrowRight className="h-5 w-5" />
                    {t(`orders.action.${order.status === "pending" ? "start" : "ready"}`)}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}