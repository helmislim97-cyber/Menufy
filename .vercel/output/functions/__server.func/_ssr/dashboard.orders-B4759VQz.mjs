import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { a as useAuth, u as useI18n } from "./router-QBDctAac.mjs";
import { L as Logo } from "./logo-CA2Gasx3.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { B as BottomNav } from "./bottom-nav-BdMsgy1g.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import "../_libs/sonner.mjs";
import { C as ChefHat, W as Wallet, e as Clock, h as StickyNote } from "../_libs/lucide-react.mjs";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
const STATUS_BADGE = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
  preparing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  ready: "bg-primary/15 text-primary border-primary/20",
  paid: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20"
};
const NEXT_STATUS = {
  pending: "preparing",
  preparing: "ready",
  ready: "paid"
};
const NEXT_ACTION_KEY = {
  pending: "orders.action.start",
  preparing: "orders.action.ready",
  ready: "orders.action.paid"
};
function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 6e4);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  return `il y a ${hours}h`;
}
function OrdersPage() {
  const {
    user
  } = useAuth();
  const {
    t
  } = useI18n();
  const [restaurantId, setRestaurantId] = reactExports.useState(null);
  const [orders, setOrders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const loadOrders = async (rid) => {
    const {
      data
    } = await supabase.from("orders").select("id, table_number, status, total, notes, created_at, order_items(id, product_name, product_price, quantity, notes)").eq("restaurant_id", rid).order("created_at", {
      ascending: false
    }).limit(50);
    setOrders(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle().then(({
      data
    }) => {
      if (!data) {
        setLoading(false);
        return;
      }
      setRestaurantId(data.id);
      loadOrders(data.id);
    });
  }, [user]);
  reactExports.useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase.channel(`orders-${restaurantId}`).on("postgres_changes", {
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
  const advanceStatus = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setOrders((prev) => prev.map((o) => o.id === order.id ? {
      ...o,
      status: next
    } : o));
    await supabase.from("orders").update({
      status: next
    }).eq("id", order.id);
  };
  const cancelOrder = async (order) => {
    setOrders((prev) => prev.map((o) => o.id === order.id ? {
      ...o,
      status: "cancelled"
    } : o));
    await supabase.from("orders").update({
      status: "cancelled"
    }).eq("id", order.id);
  };
  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing" || o.status === "ready");
  const historyOrders = orders.filter((o) => o.status === "paid" || o.status === "cancelled");
  const isToday = (iso) => {
    const d = new Date(iso);
    const now = /* @__PURE__ */ new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };
  const todayPaidOrders = orders.filter((o) => o.status === "paid" && isToday(o.created_at));
  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-3xl items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: "sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold", children: t("orders.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t("orders.subtitle") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/kitchen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChefHat, { className: "h-4 w-4" }),
            t("kitchen.openKitchen")
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cashier", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }),
            t("cashier.openCashier")
          ] }) })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-center text-sm text-muted-foreground", children: t("menu.loading") }) : orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: t("orders.empty") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t("orders.emptyHint") })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-surface p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: t("orders.todayRevenue") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-2xl font-extrabold text-gold", children: [
              todayRevenue.toFixed(2),
              " DT"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-surface p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: t("orders.todayOrders") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-extrabold", children: todayPaidOrders.length })
          ] })
        ] }),
        activeOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground", children: t("orders.active") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: activeOrders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx(OrderCard, { order, t, onAdvance: () => advanceStatus(order), onCancel: () => cancelOrder(order) }, order.id)) })
        ] }),
        historyOrders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground", children: t("orders.history") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: historyOrders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx(OrderCard, { order, t }, order.id)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
function OrderCard({
  order,
  t,
  onAdvance,
  onCancel
}) {
  const nextActionKey = NEXT_ACTION_KEY[order.status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-surface p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-xl bg-background text-sm font-extrabold", children: order.table_number ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground", children: [
            t("orders.table"),
            " ",
            order.table_number ?? "—"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1 text-[11px] text-muted-foreground/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
            timeAgo(order.created_at)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[order.status]}`, children: t(`orders.status.${order.status}`) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-1 border-t border-border/60 pt-3", children: order.order_items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-primary", children: [
          item.quantity,
          "×"
        ] }),
        " ",
        item.product_name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
        (Number(item.product_price) * item.quantity).toFixed(2),
        " DT"
      ] })
    ] }, item.id)) }),
    order.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-start gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StickyNote, { className: "mt-0.5 h-3 w-3 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.notes })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-border/60 pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-extrabold text-gold", children: [
        Number(order.total).toFixed(2),
        " DT"
      ] }),
      nextActionKey && onAdvance && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        onCancel && order.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: onCancel, className: "text-muted-foreground", children: t("orders.action.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: onAdvance, children: t(nextActionKey) })
      ] })
    ] })
  ] });
}
export {
  OrdersPage as component
};
