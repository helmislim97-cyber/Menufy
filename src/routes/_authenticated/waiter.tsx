import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurantAccess } from "@/hooks/use-restaurant-access";
import { useStaffSession } from "@/hooks/use-staff-session";
import { StaffExitButton } from "@/components/staff-exit-button";
import { AccessGuard } from "@/components/access-guard";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/lang-switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Plus, Minus, X, Send, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CancelRequestButton } from "@/components/cancel-request";
import { EditRequestButton } from "@/components/edit-request";

export const Route = createFileRoute("/_authenticated/waiter")({
  component: () => (
    <AccessGuard area="cashier">
      <WaiterPage />
    </AccessGuard>
  ),
});

interface Category { id: string; name: string; position: number }
interface Product { id: string; name: string; price: number; category_id: string | null }
interface TableRow { id: string; number: number }
interface OrderItem { id: string; product_name: string; product_price: number; quantity: number }
interface Order { id: string; table_number: number | null; status: string; total: number; order_items: OrderItem[] }

function WaiterPage() {
  const { t } = useI18n();
  const access = useRestaurantAccess();
  const { exit } = useStaffSession(access);

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [newOpen, setNewOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tableValue, setTableValue] = useState<string>("none");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async (rid: string) => {
    const { data } = await supabase
      .from("orders")
      .select("id, table_number, status, total, order_items(id, product_name, product_price, quantity)")
      .eq("restaurant_id", rid)
      .in("status", ["pending", "preparing", "ready"])
      .order("created_at", { ascending: true });
    setOrders((data as Order[]) ?? []);
  };

  useEffect(() => {
    if (access.loading || !access.restaurantId) return;
    const rid = access.restaurantId;
    setRestaurantId(rid);
    (async () => {
      const [cat, prod, tbl] = await Promise.all([
        supabase.from("categories").select("id, name, position").eq("restaurant_id", rid).eq("is_active", true).order("position"),
        supabase.from("products").select("id, name, price, category_id").eq("restaurant_id", rid).eq("is_available", true).order("position"),
        supabase.from("tables").select("id, number").eq("restaurant_id", rid).eq("is_active", true).order("number"),
      ]);
      setCategories((cat.data as Category[]) ?? []);
      setProducts((prod.data as unknown as Product[]) ?? []);
      setTables((tbl.data as unknown as TableRow[]) ?? []);
    })();
    loadOrders(rid);
  }, [access.loading, access.restaurantId]);

  // realtime: keep the tables overview fresh
  useEffect(() => {
    if (!restaurantId) return;
    const ch = supabase
      .channel(`waiter-${restaurantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` }, () => loadOrders(restaurantId))
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => loadOrders(restaurantId))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [restaurantId]);

  const productById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const grouped = useMemo(() => {
    const byCat = new Map<string | null, Product[]>();
    for (const p of products) {
      const k = p.category_id;
      if (!byCat.has(k)) byCat.set(k, []);
      byCat.get(k)!.push(p);
    }
    const res = categories
      .map((c) => ({ id: c.id, name: c.name, items: byCat.get(c.id) ?? [] }))
      .filter((g) => g.items.length);
    const uncat = byCat.get(null) ?? [];
    if (uncat.length) res.push({ id: "_uncat", name: "Autres", items: uncat });
    return res;
  }, [categories, products]);

  const cartLines = useMemo(
    () => Object.entries(cart).filter(([, q]) => q > 0)
      .map(([id, q]) => ({ product: productById[id] as Product | undefined, qty: q }))
      .filter((l): l is { product: Product; qty: number } => !!l.product),
    [cart, productById],
  );
  const cartTotal = cartLines.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);

  const setQty = (id: string, delta: number) =>
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) + delta);
      const copy = { ...c };
      if (next === 0) delete copy[id]; else copy[id] = next;
      return copy;
    });

  const submitOrder = async () => {
    if (!restaurantId || cartLines.length === 0) return;
    setSubmitting(true);
    // Manual walk-in order entered by a waiter. We only declare source here;
    // attribution (created_by_staff_id/name/role) is stamped AUTHORITATIVELY by
    // the snapshot_order_creator() trigger from auth.uid() — the client cannot
    // omit or forge it. (M5)
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        restaurant_id: restaurantId,
        table_number: tableValue === "none" ? null : parseInt(tableValue, 10),
        status: "pending",
        total: cartTotal,
        notes: note.trim() || null,
        source: "manual",
      })
      .select("id")
      .single();
    if (error || !order) { toast.error(t("waiter.error")); setSubmitting(false); return; }

    const items = cartLines.map((l) => ({
      order_id: order.id,
      product_name: l.product.name,
      product_price: Number(l.product.price),
      quantity: l.qty,
    }));
    const { error: itemErr } = await supabase.from("order_items").insert(items);
    if (itemErr) { toast.error(t("waiter.error")); setSubmitting(false); return; }

    toast.success(t("waiter.orderSent"));
    setCart({}); setTableValue("none"); setNote("");
    setNewOpen(false);
    setSubmitting(false);
    loadOrders(restaurantId);
  };

  const markPaid = async (tableOrders: Order[]) => {
    if (!window.confirm(t("cashier.confirmPaid"))) return;
    if (!restaurantId) return;
    const orderIds = tableOrders.map((o) => o.id);
    setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id))); // optimistic

    // Record one payment per order. settled_by_* is stamped AUTHORITATIVELY by
    // trg_payments_snapshot_handlers from auth.uid() — we send only the details.
    // ── v1 is cash-only; a method picker + amount_tendered/change_given go here ──
    const rows = tableOrders.map((o) => ({
      restaurant_id: restaurantId,
      order_id: o.id,
      method: "cash",
      amount_due: Number(o.total),
    }));
    // Require positive confirmation that EVERY payment row was written (not just
    // "no error") before flipping status — an order must never be marked paid
    // without its payment record.
    const { data: inserted, error } = await supabase.from("payments").insert(rows).select("id");
    if (error || !inserted || inserted.length !== rows.length) {
      toast.error(t("cashier.payError"));
      loadOrders(restaurantId);
      return;
    }
    await supabase.from("orders").update({ status: "paid" }).in("id", orderIds);
  };

  const tableGroups = useMemo(() => {
    const map = new Map<number, { orders: Order[]; items: OrderItem[]; total: number }>();
    for (const o of orders) {
      const key = o.table_number ?? 0;
      if (!map.has(key)) map.set(key, { orders: [], items: [], total: 0 });
      const e = map.get(key)!;
      e.orders.push(o);
      e.items.push(...o.order_items);
      e.total += Number(o.total);
    }
    return Array.from(map.entries()).map(([n, d]) => ({ tableNumber: n, ...d })).sort((a, b) => a.tableNumber - b.tableNumber);
  }, [orders]);

  return (
    <div className="min-h-screen bg-background p-4 pb-28">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{t("waiter.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("waiter.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitch />
          <StaffExitButton isOwner={access.isOwner} onExit={exit} />
        </div>
      </header>

      {tableGroups.length === 0 ? (
        <p className="mt-16 text-center text-lg text-muted-foreground">{t("waiter.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tableGroups.map((tbl) => {
            const merged = new Map<string, { name: string; qty: number }>();
            for (const it of tbl.items) {
              const ex = merged.get(it.product_name);
              if (ex) ex.qty += it.quantity;
              else merged.set(it.product_name, { name: it.product_name, qty: it.quantity });
            }
            return (
              <div key={tbl.tableNumber} className="flex flex-col rounded-2xl border-2 border-border bg-surface p-4">
                <span className="text-3xl font-extrabold">{tbl.tableNumber || "—"}</span>
                <div className="mt-3 flex-1 space-y-1 border-t border-border/60 pt-3 text-sm">
                  {Array.from(merged.values()).map((m) => (
                    <div key={m.name}>
                      <span className="font-bold text-primary">{m.qty}×</span> {m.name}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-sm font-semibold text-muted-foreground">{t("waiter.total")}</span>
                  <span className="text-lg font-extrabold text-gold">{tbl.total.toFixed(2)} DT</span>
                </div>
                {access.can.markPaid && (
                  <Button onClick={() => markPaid(tbl.orders)} className="mt-3 h-11 w-full gap-2 font-bold">
                    <Wallet className="h-5 w-5" /> {t("waiter.markPaid")}
                  </Button>
                )}

                <CancelRequestButton
                  restaurantId={restaurantId}
                  className="mt-2 h-10 w-full gap-1.5 text-sm font-semibold"
                  orders={tbl.orders.map((o) => ({
                    id: o.id,
                    total: Number(o.total),
                    itemCount: o.order_items.reduce((s, it) => s + it.quantity, 0),
                  }))}
                />

                <EditRequestButton
                  restaurantId={restaurantId}
                  className="mt-2 h-10 w-full gap-1.5 text-sm font-semibold"
                  orders={tbl.orders.map((o) => ({
                    id: o.id,
                    total: Number(o.total),
                    items: o.order_items.map((it) => ({
                      id: it.id, name: it.product_name, price: Number(it.product_price), qty: it.quantity,
                    })),
                  }))}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* fixed new-order button */}
      <button
        onClick={() => setNewOpen(true)}
        className="fixed bottom-5 inset-x-0 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg"
      >
        <Plus className="h-5 w-5" /> {t("waiter.newOrder")}
      </button>

      {/* new order overlay */}
      {newOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-extrabold">{t("waiter.newOrder")}</h2>
            <button onClick={() => setNewOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {grouped.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">{t("waiter.noMenu")}</p>
            ) : grouped.map((g) => (
              <div key={g.id} className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{g.name}</p>
                <div className="space-y-2">
                  {g.items.map((p) => {
                    const qty = cart[p.id] ?? 0;
                    return (
                      <div key={p.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{Number(p.price).toFixed(2)} DT</p>
                        </div>
                        {qty > 0 && (
                          <>
                            <button onClick={() => setQty(p.id, -1)} className="grid h-9 w-9 place-items-center rounded-lg bg-muted"><Minus className="h-4 w-4" /></button>
                            <span className="w-6 text-center font-bold">{qty}</span>
                          </>
                        )}
                        <button onClick={() => setQty(p.id, 1)} className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* checkout footer */}
          <div className="border-t border-border bg-background p-4 space-y-3">
            <div className="flex gap-2">
              <Select value={tableValue} onValueChange={setTableValue}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={t("waiter.selectTable")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("waiter.noTable")}</SelectItem>
                  {tables.map((tb) => (
                    <SelectItem key={tb.id} value={String(tb.number)}>{`${t("waiter.table")} ${tb.number}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("waiter.note")} className="flex-1" />
            </div>
            <Button onClick={submitOrder} disabled={cartLines.length === 0 || submitting} className="h-12 w-full gap-2 text-base font-bold">
              <Send className="h-5 w-5" />
              {submitting ? "…" : `${t("waiter.send")}${cartCount ? ` · ${cartTotal.toFixed(2)} DT` : ""}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
