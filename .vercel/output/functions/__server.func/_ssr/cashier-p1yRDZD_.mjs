import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { a as useAuth, u as useI18n } from "./router-QBDctAac.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import "../_libs/sonner.mjs";
import { X, R as Receipt, W as Wallet } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
function CashierPage() {
  const {
    user
  } = useAuth();
  const {
    t
  } = useI18n();
  const [restaurantId, setRestaurantId] = reactExports.useState(null);
  const [orders, setOrders] = reactExports.useState([]);
  const loadOrders = async (rid) => {
    const {
      data
    } = await supabase.from("orders").select("id, table_number, status, total, created_at, order_items(id, product_name, product_price, quantity)").eq("restaurant_id", rid).in("status", ["pending", "preparing", "ready"]).order("created_at", {
      ascending: true
    });
    setOrders(data ?? []);
  };
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle().then(({
      data
    }) => {
      if (data) {
        setRestaurantId(data.id);
        loadOrders(data.id);
      }
    });
  }, [user]);
  reactExports.useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase.channel(`cashier-${restaurantId}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "orders",
      filter: `restaurant_id=eq.${restaurantId}`
    }, () => loadOrders(restaurantId)).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "order_items"
    }, () => loadOrders(restaurantId)).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);
  const tables = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const order of orders) {
      const key = order.table_number ?? 0;
      if (!map.has(key)) map.set(key, {
        orders: [],
        items: [],
        total: 0
      });
      const entry = map.get(key);
      entry.orders.push(order);
      entry.items.push(...order.order_items);
      entry.total += Number(order.total);
    }
    return Array.from(map.entries()).map(([tableNumber, data]) => ({
      tableNumber,
      ...data
    })).sort((a, b) => a.tableNumber - b.tableNumber);
  }, [orders]);
  const markPaid = async (orderIds) => {
    if (!window.confirm(t("cashier.confirmPaid"))) return;
    setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)));
    await supabase.from("orders").update({
      status: "paid"
    }).in("id", orderIds);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold", children: t("cashier.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("cashier.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/orders", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          t("cashier.exit")
        ] }) })
      ] })
    ] }),
    tables.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-20 text-center text-lg text-muted-foreground", children: t("cashier.empty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: tables.map((table) => {
      const merged = /* @__PURE__ */ new Map();
      for (const item of table.items) {
        const key = item.product_name;
        const existing = merged.get(key);
        if (existing) existing.qty += item.quantity;
        else merged.set(key, {
          name: item.product_name,
          price: Number(item.product_price),
          qty: item.quantity
        });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col rounded-2xl border-2 border-border bg-surface p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-extrabold", children: table.tableNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-3.5 w-3.5" }),
            table.orders.length,
            " ",
            t("cashier.ordersCount")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex-1 space-y-1.5 border-t border-border/60 pt-3", children: Array.from(merged.values()).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-primary", children: [
              item.qty,
              "×"
            ] }),
            " ",
            item.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            (item.price * item.qty).toFixed(2),
            " DT"
          ] })
        ] }, item.name)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-border/60 pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-muted-foreground", children: t("cashier.total") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-extrabold text-gold", children: [
            table.total.toFixed(2),
            " DT"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => markPaid(table.orders.map((o) => o.id)), className: "mt-4 h-12 w-full gap-2 text-base font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5" }),
          t("cashier.markPaid")
        ] })
      ] }, table.tableNumber);
    }) })
  ] });
}
export {
  CashierPage as component
};
