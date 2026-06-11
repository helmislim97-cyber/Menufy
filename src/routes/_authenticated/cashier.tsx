import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
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
              <div