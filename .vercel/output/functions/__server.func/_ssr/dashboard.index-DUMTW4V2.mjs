import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { a as useAuth, u as useI18n } from "./router-QBDctAac.mjs";
import { L as Logo } from "./logo-CA2Gasx3.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { B as BottomNav } from "./bottom-nav-BdMsgy1g.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { j as LogOut, T as TrendingUp, k as ShoppingBag, e as Clock, l as UtensilsCrossed, c as ArrowRight } from "../_libs/lucide-react.mjs";
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
function Dashboard() {
  const {
    user,
    signOut
  } = useAuth();
  const {
    t
  } = useI18n();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [productCount, setProductCount] = reactExports.useState(null);
  const [orderCount, setOrderCount] = reactExports.useState(null);
  const [pendingCount, setPendingCount] = reactExports.useState(null);
  const [revenue, setRevenue] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("id, name").eq("owner_id", user.id).maybeSingle().then(({
      data
    }) => {
      setRestaurant(data);
      if (!data) return;
      const todayStart = /* @__PURE__ */ new Date();
      todayStart.setHours(0, 0, 0, 0);
      supabase.from("products").select("id", {
        count: "exact",
        head: true
      }).eq("restaurant_id", data.id).then(({
        count
      }) => setProductCount(count ?? 0));
      supabase.from("orders").select("id, total, status", {
        count: "exact"
      }).eq("restaurant_id", data.id).gte("created_at", todayStart.toISOString()).then(({
        data: orders,
        count
      }) => {
        setOrderCount(count ?? 0);
        const pending = (orders ?? []).filter((o) => o.status === "pending" || o.status === "preparing").length;
        setPendingCount(pending);
        const total = (orders ?? []).filter((o) => o.status === "paid").reduce((sum, o) => sum + Number(o.total ?? 0), 0);
        setRevenue(total);
      });
    });
  }, [user]);
  const onLogout = async () => {
    await signOut();
    toast.success("À bientôt !");
    navigate({
      to: "/"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-14 max-w-3xl items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: "sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onLogout, className: "grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-gradient-brand p-6 text-primary-foreground shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider opacity-80", children: "Restaurant" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-extrabold", children: restaurant?.name ?? "…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm opacity-90", children: "Bienvenue sur votre tableau de bord." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: TrendingUp, label: "Revenu du jour", value: revenue !== null ? `${revenue.toFixed(2)} DT` : "…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: ShoppingBag, label: "Commandes", value: orderCount !== null ? String(orderCount) : "…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Clock, label: "En cours", value: pendingCount !== null ? String(pendingCount) : "…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: UtensilsCrossed, label: "Produits", value: productCount !== null ? String(productCount) : "…" })
      ] }),
      productCount === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard/menu", className: "mt-6 flex items-center justify-between rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-sm transition-colors hover:bg-primary/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: t("menu.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: t("menu.noCategoriesHint") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5 shrink-0 text-primary" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
function Kpi({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-surface p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-extrabold", children: value })
  ] });
}
export {
  Dashboard as component
};
