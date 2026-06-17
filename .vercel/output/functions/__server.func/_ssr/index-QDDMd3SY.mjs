import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useI18n } from "./router-QBDctAac.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { L as Logo } from "./logo-CA2Gasx3.mjs";
import "../_libs/sonner.mjs";
import { b as Sparkles, A as ArrowLeft, c as ArrowRight, Q as QrCode, d as Smartphone, C as ChefHat, e as Clock, W as Wallet, f as Languages, P as Printer, g as Check } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-CjM7Gvsx.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
function Landing() {
  const {
    t,
    locale,
    dir
  } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 -z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-gold/10 blur-[100px]" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 pt-12 pb-20 sm:pt-20 sm:pb-28 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          t("hero.badge")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl", children: [
          t("hero.title").split(" ").slice(0, -2).join(" "),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: t("hero.title").split(" ").slice(-2).join(" ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg", children: t("hero.subtitle") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", search: {
            mode: "register"
          }, className: "group inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]", children: [
            t("hero.cta"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how", className: "inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-accent", children: t("hero.cta2") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto mt-16 w-full max-w-xs sm:max-w-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-brand opacity-30 blur-2xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative rounded-[2.5rem] border-[10px] border-surface-elevated bg-surface p-3 shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[1.8rem] bg-background p-4 text-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "9:41" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Table 7" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: locale === "fr" ? "Restaurant" : "مطعم" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: "Dar El Jeld" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-1.5 overflow-hidden", children: (locale === "fr" ? ["Entrées", "Plats", "Desserts"] : ["مقبلات", "أطباق", "حلويات"]).map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-surface-elevated text-muted-foreground"}`, children: c }, c)) }),
            [{
              e: "🥗",
              n: locale === "fr" ? "Salade Tunisienne" : "سلطة تونسية",
              p: "8.500"
            }, {
              e: "🍲",
              n: locale === "fr" ? "Couscous Royal" : "كسكسي ملكي",
              p: "24.000"
            }, {
              e: "🥘",
              n: locale === "fr" ? "Tajine au thon" : "طاجين تونة",
              p: "18.000"
            }].map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: it.e }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: it.n }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-primary", children: [
                    it.p,
                    " DT"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-lg bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground", children: "+" })
            ] }, it.n)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-xl bg-gradient-brand px-3 py-2.5 text-center text-xs font-bold text-primary-foreground", children: locale === "fr" ? "Commander · 50.500 DT" : "اطلب · 50.500 د.ت" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "how", className: "border-t border-border/50 bg-surface/40 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-extrabold sm:text-4xl", children: t("how.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: t("how.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-6 md:grid-cols-3", children: [{
        icon: QrCode,
        title: t("how.step1.title"),
        desc: t("how.step1.desc"),
        n: "01"
      }, {
        icon: Smartphone,
        title: t("how.step2.title"),
        desc: t("how.step2.desc"),
        n: "02"
      }, {
        icon: ChefHat,
        title: t("how.step3.title"),
        desc: t("how.step3.desc"),
        n: "03"
      }].map(({
        icon: Icon,
        title,
        desc,
        n
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute end-4 top-4 text-5xl font-black text-primary/10", children: n }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 text-lg font-bold", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: desc })
      ] }, n)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "features", className: "py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-extrabold sm:text-4xl", children: t("features.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: t("features.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [{
        icon: Smartphone,
        k: "1"
      }, {
        icon: Clock,
        k: "2"
      }, {
        icon: QrCode,
        k: "3"
      }, {
        icon: Wallet,
        k: "4"
      }, {
        icon: Languages,
        k: "5"
      }, {
        icon: Printer,
        k: "6"
      }].map(({
        icon: Icon,
        k
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-accent/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-grid h-10 w-10 place-items-center rounded-lg bg-gold/15 text-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-bold", children: t(`features.${k}.title`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: t(`features.${k}.desc`) })
      ] }, k)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "pricing", className: "border-t border-border/50 bg-surface/40 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-extrabold sm:text-4xl", children: t("pricing.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: t("pricing.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 grid gap-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PriceCard, { name: t("pricing.free.name"), price: t("pricing.free.price"), desc: t("pricing.free.desc"), features: [`5 ${t("pricing.feat.tables")}`, t("pricing.feat.menu"), t("pricing.feat.realtime")] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PriceCard, { highlight: true, badge: t("pricing.popular"), name: t("pricing.pro.name"), price: t("pricing.pro.price"), period: t("pricing.pro.period"), desc: t("pricing.pro.desc"), features: [t("pricing.feat.unlimited"), t("pricing.feat.menu"), t("pricing.feat.realtime"), t("pricing.feat.qr"), t("pricing.feat.support")] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PriceCard, { name: t("pricing.entr.name"), price: t("pricing.entr.price"), desc: t("pricing.entr.desc"), features: [t("pricing.feat.multi"), t("pricing.feat.api"), t("pricing.feat.support")] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-4xl px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-brand p-10 text-center shadow-glow sm:p-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-extrabold text-primary-foreground sm:text-4xl", children: t("cta.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base", children: t("cta.subtitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/auth", search: {
        mode: "register"
      }, className: "mt-8 inline-flex items-center gap-2 rounded-2xl bg-background px-6 py-3.5 text-sm font-bold text-foreground transition-transform hover:scale-[1.02]", children: [
        t("cta.button"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { className: "h-4 w-4" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Header() {
  const {
    t
  } = useI18n();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how", className: "transition-colors hover:text-foreground", children: t("nav.howItWorks") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", className: "transition-colors hover:text-foreground", children: t("nav.features") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#pricing", className: "transition-colors hover:text-foreground", children: t("nav.pricing") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
        mode: "login"
      }, className: "hidden rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground sm:inline-flex", children: t("nav.login") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
        mode: "register"
      }, className: "rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow", children: t("nav.register") })
    ] })
  ] }) });
}
function PriceCard({
  name,
  price,
  period,
  desc,
  features,
  highlight,
  badge
}) {
  const {
    t
  } = useI18n();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-3xl border p-6 ${highlight ? "border-primary bg-surface shadow-glow" : "border-border bg-surface"}`, children: [
    badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-foreground", children: badge }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: desc }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-baseline gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-extrabold", children: price }),
      period && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: period })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 space-y-2.5", children: features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
    ] }, f)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
      mode: "register"
    }, className: `mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.01] ${highlight ? "bg-gradient-brand text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"}`, children: t("pricing.cta") })
  ] });
}
function Footer() {
  const {
    t
  } = useI18n();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border/50 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 sm:items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: "sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("footer.tagline") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Menufy. ",
      t("footer.rights")
    ] })
  ] }) });
}
export {
  Landing as component
};
