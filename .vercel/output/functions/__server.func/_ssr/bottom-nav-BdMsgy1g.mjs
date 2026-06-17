import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useI18n } from "./router-QBDctAac.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { H as House, B as ClipboardList, l as UtensilsCrossed, J as Settings } from "../_libs/lucide-react.mjs";
function BottomNav() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/dashboard", icon: House, label: t("nav.dashboard.home"), exact: true },
    { to: "/dashboard/orders", icon: ClipboardList, label: t("nav.dashboard.orders"), exact: false },
    { to: "/dashboard/menu", icon: UtensilsCrossed, label: t("nav.dashboard.menu"), exact: false },
    { to: "/dashboard/settings", icon: Settings, label: t("nav.dashboard.settings"), exact: false }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid max-w-3xl grid-cols-4", children: items.map(({ to, icon: Icon, label, exact }) => {
    const active = exact ? pathname === to : pathname.startsWith(to);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to,
        className: cn(
          "flex flex-col items-center gap-1 py-3 text-[11px] font-medium",
          active ? "text-primary" : "text-muted-foreground"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }),
          label
        ]
      },
      to
    );
  }) }) });
}
export {
  BottomNav as B
};
