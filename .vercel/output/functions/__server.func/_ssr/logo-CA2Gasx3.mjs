import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { l as UtensilsCrossed } from "../_libs/lucide-react.mjs";
function Logo({ size = "md" }) {
  const sz = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${sz} grid place-items-center rounded-xl bg-gradient-brand shadow-glow`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(UtensilsCrossed, { size: icon, className: "text-white", strokeWidth: 2.5 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `${text} font-extrabold tracking-tight`, children: [
      "Menu",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "fy" })
    ] })
  ] });
}
export {
  Logo as L
};
