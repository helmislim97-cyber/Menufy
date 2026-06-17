import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { a as useAuth, u as useI18n } from "./router-QBDctAac.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import "../_libs/sonner.mjs";
import { X, e as Clock, h as StickyNote, i as CircleCheck, c as ArrowRight } from "../_libs/lucide-react.mjs";
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
const NEXT_STATUS = {
  pending: "preparing",
  preparing: "ready",
  ready: "paid"
};
const CARD_STYLE = {
  pending: "border-yellow-500/40 bg-yellow-500/5",
  preparing: "border-blue-500/40 bg-blue-500/5",
  ready: "border-primary/50 bg-primary/5",
  paid: "",
  cancelled: ""
};
const BADGE_STYLE = {
  pending: "bg-yellow-500 text-black",
  preparing: "bg-blue-500 text-white",
  ready: "bg-primary text-primary-foreground",
  paid: "",
  cancelled: ""
};
function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4);
  if (mins < 1) return "0 min";
  return `${mins} min`;
}
function KitchenPage() {
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
    } = await supabase.from("orders").select("id, table_number, status, notes, created_at, order_items(id, product_name, quantity, notes)").eq("restaurant_id", rid).in("status", ["pending", "preparing", "ready"]).order("created_at", {
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
    const channel = supabase.channel(`kitchen-${restaurantId}`).on("postgres_changes", {
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
  const [, setTick] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 3e4);
    return () => clearInterval(id);
  }, []);
  const advanceStatus = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setOrders((prev) => prev.filter((o) => o.id !== order.id || next === "preparing" || next === "ready"));
    setOrders((prev) => prev.map((o) => o.id === order.id ? {
      ...o,
      status: next
    } : o));
    await supabase.from("orders").update({
      status: next
    }).eq("id", order.id);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold", children: t("kitchen.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("kitchen.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard/orders", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          t("kitchen.exit")
        ] }) })
      ] })
    ] }),
    orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-20 text-center text-lg text-muted-foreground", children: t("kitchen.empty") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: orders.map((order) => {
      const next = NEXT_STATUS[order.status];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col rounded-2xl border-2 p-4 ${CARD_STYLE[order.status]}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-extrabold", children: order.table_number ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-extrabold uppercase ${BADGE_STYLE[order.status]}`, children: order.status === "pending" ? t("kitchen.newOrder") : t(`orders.status.${order.status}`) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          timeAgo(order.created_at)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex-1 space-y-1.5 border-t border-border/60 pt-3", children: order.order_items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 text-lg font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
            item.quantity,
            "×"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.product_name })
        ] }, item.id)) }),
        order.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-start gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StickyNote, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.notes })
        ] }),
        next && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => advanceStatus(order), className: "mt-4 h-12 w-full gap-2 text-base font-bold", children: [
          next === "paid" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5" }),
          t(`orders.action.${order.status === "pending" ? "start" : order.status === "preparing" ? "ready" : "paid"}`)
        ] })
      ] }, order.id);
    }) })
  ] });
}
export {
  KitchenPage as component
};
