import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useI18n } from "./router-QBDctAac.mjs";
import { y as ChevronDown } from "../_libs/lucide-react.mjs";
const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇹🇳" },
  { code: "en", label: "English", flag: "🇬🇧" }
];
function LangSwitch({ className = "", variant = "default" }) {
  const { locale, setLocale } = useI18n();
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
  const styles = variant === "light" ? "border-[#1c1f16]/15 bg-[#f3efe4] text-[#1c1f16] shadow-sm" : "border-border bg-surface text-foreground hover:bg-accent";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${styles} ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: current.flag }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: current.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 opacity-60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "select",
      {
        value: locale,
        onChange: (e) => setLocale(e.target.value),
        className: "absolute inset-0 cursor-pointer opacity-0",
        "aria-label": "Change language",
        children: LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: l.code, children: [
          l.flag,
          " ",
          l.label
        ] }, l.code))
      }
    )
  ] });
}
export {
  LangSwitch as L
};
