import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { b as Route$3, u as useI18n } from "./router-QBDctAac.mjs";
import { L as Logo } from "./logo-CA2Gasx3.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { T as Textarea, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-D_mvxjrL.mjs";
import { I as Input, D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./input-CX2_nYzV.mjs";
import "../_libs/sonner.mjs";
import { i as CircleCheck, A as ArrowLeft, m as Search, n as ShoppingCart, o as Minus, p as Plus, F as Facebook, I as Instagram, q as Info, r as MapPin, s as Phone, t as Wifi, u as Flame, e as Clock } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-presence.mjs";
function RestaurantCover({ name, logoUrl, facebookUrl, instagramUrl, tableNumber, leaving, onOrder }) {
  const { t } = useI18n();
  const hasSocial = !!(facebookUrl || instagramUrl);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative flex h-[100dvh] flex-col items-center justify-between overflow-hidden bg-[#f3efe4] px-6 py-4 text-[#1c1f16] transition-opacity duration-300 ease-out ${leaving ? "opacity-0" : "opacity-100"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-4 top-4 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, { variant: "light" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center pt-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-60 w-56 flex-col items-center justify-center rounded-[3rem] border border-[#1c1f16]/25 px-6 text-center", children: logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: name, className: "max-h-40 max-w-full object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl font-extrabold uppercase tracking-[0.2em]", children: name }) }),
      hasSocial && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-4", children: [
        facebookUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: facebookUrl, target: "_blank", rel: "noreferrer", className: "grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25 transition-colors hover:bg-[#1c1f16]/5", "aria-label": "Facebook", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Facebook, { className: "h-4 w-4" }) }),
        instagramUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: instagramUrl, target: "_blank", rel: "noreferrer", className: "grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25 transition-colors hover:bg-[#1c1f16]/5", "aria-label": "Instagram", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 text-center text-xs font-bold uppercase tracking-[0.3em] text-[#1c1f16]/50", children: [
        t("client.table"),
        " ",
        tableNumber
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onOrder,
          disabled: leaving,
          className: "w-full rounded-2xl bg-[#1c1f16] py-3.5 text-base font-extrabold uppercase tracking-widest text-[#f3efe4] transition-transform active:scale-[0.98]",
          children: t("client.orderNow")
        }
      )
    ] })
  ] });
}
function CategoryGrid({ name, logoUrl, facebookUrl, instagramUrl, address, phone, description, wifi, categories, onSelect, onBack }) {
  const { t } = useI18n();
  const hasSocial = !!(facebookUrl || instagramUrl);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen animate-fade-in bg-[#f3efe4] px-2 py-4 text-[#1c1f16] sm:px-6 sm:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "grid h-9 w-9 place-items-center rounded-full border border-[#1c1f16]/25", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, { variant: "light" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-col items-center", children: logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 w-32 items-center justify-center rounded-[2rem] border border-[#1c1f16]/25 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: name, className: "max-h-full max-w-full object-contain" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-extrabold uppercase tracking-[0.2em]", children: name }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onSelect(c.id), className: "relative w-full h-32 sm:h-48 overflow-hidden rounded-2xl bg-white/70 text-left flex items-stretch shadow-sm border border-[#1c1f16]/8", children: [
      c.imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.imageUrl, alt: "", className: "absolute right-0 top-0 h-full w-full object-cover" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-white via-white/85 via-30% to-transparent" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-5 self-end pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-extrabold uppercase tracking-wide text-[#1c1f16]", children: c.name }),
        c.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-[#1c1f16]/55", children: c.description })
      ] })
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
      description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40", children: t("client.info") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm leading-relaxed text-[#1c1f16]/80", children: description })
        ] })
      ] }),
      address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40", children: t("client.address") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-[#1c1f16]/80", children: address })
        ] })
      ] }),
      phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40", children: t("client.reservation") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${phone}`, className: "mt-1 block text-sm text-[#1c1f16]/80", children: phone })
        ] })
      ] }),
      wifi && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-4 border border-[#1c1f16]/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "mt-0.5 h-5 w-5 shrink-0 text-[#1c1f16]/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.2em] text-[#1c1f16]/40", children: t("client.wifi") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-mono tracking-wide text-[#1c1f16]/80", children: wifi })
        ] })
      ] })
    ] }),
    hasSocial && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col items-center gap-3 pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-[0.3em] text-[#1c1f16]/50", children: t("client.followUs") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        facebookUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: facebookUrl, target: "_blank", rel: "noreferrer", className: "grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25", "aria-label": "Facebook", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Facebook, { className: "h-4 w-4" }) }),
        instagramUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: instagramUrl, target: "_blank", rel: "noreferrer", className: "grid h-10 w-10 place-items-center rounded-full border border-[#1c1f16]/25", "aria-label": "Instagram", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "pb-8 pt-6 text-center text-xs text-[#1c1f16]/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        t("client.poweredBy"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://menufy-tau.vercel.app", target: "_blank", rel: "noreferrer", className: "font-semibold text-[#1c1f16]/60 hover:text-[#1c1f16]", children: "Menufy" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Menufy. ",
        t("client.allRightsReserved")
      ] })
    ] })
  ] }) });
}
const UNCATEGORIZED = "__uncategorized__";
const COUNTRY_CODES = [{
  code: "+93",
  flag: "🇦🇫",
  name: "Afghanistan"
}, {
  code: "+355",
  flag: "🇦🇱",
  name: "Albania"
}, {
  code: "+213",
  flag: "🇩🇿",
  name: "Algeria"
}, {
  code: "+376",
  flag: "🇦🇩",
  name: "Andorra"
}, {
  code: "+244",
  flag: "🇦🇴",
  name: "Angola"
}, {
  code: "+1",
  flag: "🇦🇬",
  name: "Antigua and Barbuda"
}, {
  code: "+54",
  flag: "🇦🇷",
  name: "Argentina"
}, {
  code: "+374",
  flag: "🇦🇲",
  name: "Armenia"
}, {
  code: "+61",
  flag: "🇦🇺",
  name: "Australia"
}, {
  code: "+43",
  flag: "🇦🇹",
  name: "Austria"
}, {
  code: "+994",
  flag: "🇦🇿",
  name: "Azerbaijan"
}, {
  code: "+1",
  flag: "🇧🇸",
  name: "Bahamas"
}, {
  code: "+973",
  flag: "🇧🇭",
  name: "Bahrain"
}, {
  code: "+880",
  flag: "🇧🇩",
  name: "Bangladesh"
}, {
  code: "+1",
  flag: "🇧🇧",
  name: "Barbados"
}, {
  code: "+375",
  flag: "🇧🇾",
  name: "Belarus"
}, {
  code: "+32",
  flag: "🇧🇪",
  name: "Belgium"
}, {
  code: "+501",
  flag: "🇧🇿",
  name: "Belize"
}, {
  code: "+229",
  flag: "🇧🇯",
  name: "Benin"
}, {
  code: "+975",
  flag: "🇧🇹",
  name: "Bhutan"
}, {
  code: "+591",
  flag: "🇧🇴",
  name: "Bolivia"
}, {
  code: "+387",
  flag: "🇧🇦",
  name: "Bosnia and Herzegovina"
}, {
  code: "+267",
  flag: "🇧🇼",
  name: "Botswana"
}, {
  code: "+55",
  flag: "🇧🇷",
  name: "Brazil"
}, {
  code: "+673",
  flag: "🇧🇳",
  name: "Brunei"
}, {
  code: "+359",
  flag: "🇧🇬",
  name: "Bulgaria"
}, {
  code: "+226",
  flag: "🇧🇫",
  name: "Burkina Faso"
}, {
  code: "+257",
  flag: "🇧🇮",
  name: "Burundi"
}, {
  code: "+855",
  flag: "🇰🇭",
  name: "Cambodia"
}, {
  code: "+237",
  flag: "🇨🇲",
  name: "Cameroon"
}, {
  code: "+1",
  flag: "🇨🇦",
  name: "Canada"
}, {
  code: "+238",
  flag: "🇨🇻",
  name: "Cape Verde"
}, {
  code: "+236",
  flag: "🇨🇫",
  name: "Central African Republic"
}, {
  code: "+235",
  flag: "🇹🇩",
  name: "Chad"
}, {
  code: "+56",
  flag: "🇨🇱",
  name: "Chile"
}, {
  code: "+86",
  flag: "🇨🇳",
  name: "China"
}, {
  code: "+57",
  flag: "🇨🇴",
  name: "Colombia"
}, {
  code: "+269",
  flag: "🇰🇲",
  name: "Comoros"
}, {
  code: "+242",
  flag: "🇨🇬",
  name: "Congo"
}, {
  code: "+243",
  flag: "🇨🇩",
  name: "DR Congo"
}, {
  code: "+506",
  flag: "🇨🇷",
  name: "Costa Rica"
}, {
  code: "+385",
  flag: "🇭🇷",
  name: "Croatia"
}, {
  code: "+53",
  flag: "🇨🇺",
  name: "Cuba"
}, {
  code: "+357",
  flag: "🇨🇾",
  name: "Cyprus"
}, {
  code: "+420",
  flag: "🇨🇿",
  name: "Czech Republic"
}, {
  code: "+45",
  flag: "🇩🇰",
  name: "Denmark"
}, {
  code: "+253",
  flag: "🇩🇯",
  name: "Djibouti"
}, {
  code: "+1",
  flag: "🇩🇲",
  name: "Dominica"
}, {
  code: "+1",
  flag: "🇩🇴",
  name: "Dominican Republic"
}, {
  code: "+593",
  flag: "🇪🇨",
  name: "Ecuador"
}, {
  code: "+20",
  flag: "🇪🇬",
  name: "Egypt"
}, {
  code: "+503",
  flag: "🇸🇻",
  name: "El Salvador"
}, {
  code: "+240",
  flag: "🇬🇶",
  name: "Equatorial Guinea"
}, {
  code: "+291",
  flag: "🇪🇷",
  name: "Eritrea"
}, {
  code: "+372",
  flag: "🇪🇪",
  name: "Estonia"
}, {
  code: "+268",
  flag: "🇸🇿",
  name: "Eswatini"
}, {
  code: "+251",
  flag: "🇪🇹",
  name: "Ethiopia"
}, {
  code: "+679",
  flag: "🇫🇯",
  name: "Fiji"
}, {
  code: "+358",
  flag: "🇫🇮",
  name: "Finland"
}, {
  code: "+33",
  flag: "🇫🇷",
  name: "France"
}, {
  code: "+241",
  flag: "🇬🇦",
  name: "Gabon"
}, {
  code: "+220",
  flag: "🇬🇲",
  name: "Gambia"
}, {
  code: "+995",
  flag: "🇬🇪",
  name: "Georgia"
}, {
  code: "+49",
  flag: "🇩🇪",
  name: "Germany"
}, {
  code: "+233",
  flag: "🇬🇭",
  name: "Ghana"
}, {
  code: "+30",
  flag: "🇬🇷",
  name: "Greece"
}, {
  code: "+1",
  flag: "🇬🇩",
  name: "Grenada"
}, {
  code: "+502",
  flag: "🇬🇹",
  name: "Guatemala"
}, {
  code: "+224",
  flag: "🇬🇳",
  name: "Guinea"
}, {
  code: "+245",
  flag: "🇬🇼",
  name: "Guinea-Bissau"
}, {
  code: "+592",
  flag: "🇬🇾",
  name: "Guyana"
}, {
  code: "+509",
  flag: "🇭🇹",
  name: "Haiti"
}, {
  code: "+504",
  flag: "🇭🇳",
  name: "Honduras"
}, {
  code: "+852",
  flag: "🇭🇰",
  name: "Hong Kong"
}, {
  code: "+36",
  flag: "🇭🇺",
  name: "Hungary"
}, {
  code: "+354",
  flag: "🇮🇸",
  name: "Iceland"
}, {
  code: "+91",
  flag: "🇮🇳",
  name: "India"
}, {
  code: "+62",
  flag: "🇮🇩",
  name: "Indonesia"
}, {
  code: "+98",
  flag: "🇮🇷",
  name: "Iran"
}, {
  code: "+964",
  flag: "🇮🇶",
  name: "Iraq"
}, {
  code: "+353",
  flag: "🇮🇪",
  name: "Ireland"
}, {
  code: "+972",
  flag: "🇮🇱",
  name: "Israel"
}, {
  code: "+39",
  flag: "🇮🇹",
  name: "Italy"
}, {
  code: "+1",
  flag: "🇯🇲",
  name: "Jamaica"
}, {
  code: "+81",
  flag: "🇯🇵",
  name: "Japan"
}, {
  code: "+962",
  flag: "🇯🇴",
  name: "Jordan"
}, {
  code: "+7",
  flag: "🇰🇿",
  name: "Kazakhstan"
}, {
  code: "+254",
  flag: "🇰🇪",
  name: "Kenya"
}, {
  code: "+686",
  flag: "🇰🇮",
  name: "Kiribati"
}, {
  code: "+965",
  flag: "🇰🇼",
  name: "Kuwait"
}, {
  code: "+996",
  flag: "🇰🇬",
  name: "Kyrgyzstan"
}, {
  code: "+856",
  flag: "🇱🇦",
  name: "Laos"
}, {
  code: "+371",
  flag: "🇱🇻",
  name: "Latvia"
}, {
  code: "+961",
  flag: "🇱🇧",
  name: "Lebanon"
}, {
  code: "+266",
  flag: "🇱🇸",
  name: "Lesotho"
}, {
  code: "+231",
  flag: "🇱🇷",
  name: "Liberia"
}, {
  code: "+218",
  flag: "🇱🇾",
  name: "Libya"
}, {
  code: "+423",
  flag: "🇱🇮",
  name: "Liechtenstein"
}, {
  code: "+370",
  flag: "🇱🇹",
  name: "Lithuania"
}, {
  code: "+352",
  flag: "🇱🇺",
  name: "Luxembourg"
}, {
  code: "+853",
  flag: "🇲🇴",
  name: "Macau"
}, {
  code: "+261",
  flag: "🇲🇬",
  name: "Madagascar"
}, {
  code: "+265",
  flag: "🇲🇼",
  name: "Malawi"
}, {
  code: "+60",
  flag: "🇲🇾",
  name: "Malaysia"
}, {
  code: "+960",
  flag: "🇲🇻",
  name: "Maldives"
}, {
  code: "+223",
  flag: "🇲🇱",
  name: "Mali"
}, {
  code: "+356",
  flag: "🇲🇹",
  name: "Malta"
}, {
  code: "+692",
  flag: "🇲🇭",
  name: "Marshall Islands"
}, {
  code: "+222",
  flag: "🇲🇷",
  name: "Mauritania"
}, {
  code: "+230",
  flag: "🇲🇺",
  name: "Mauritius"
}, {
  code: "+52",
  flag: "🇲🇽",
  name: "Mexico"
}, {
  code: "+691",
  flag: "🇫🇲",
  name: "Micronesia"
}, {
  code: "+373",
  flag: "🇲🇩",
  name: "Moldova"
}, {
  code: "+377",
  flag: "🇲🇨",
  name: "Monaco"
}, {
  code: "+976",
  flag: "🇲🇳",
  name: "Mongolia"
}, {
  code: "+382",
  flag: "🇲🇪",
  name: "Montenegro"
}, {
  code: "+212",
  flag: "🇲🇦",
  name: "Morocco"
}, {
  code: "+258",
  flag: "🇲🇿",
  name: "Mozambique"
}, {
  code: "+95",
  flag: "🇲🇲",
  name: "Myanmar"
}, {
  code: "+264",
  flag: "🇳🇦",
  name: "Namibia"
}, {
  code: "+674",
  flag: "🇳🇷",
  name: "Nauru"
}, {
  code: "+977",
  flag: "🇳🇵",
  name: "Nepal"
}, {
  code: "+31",
  flag: "🇳🇱",
  name: "Netherlands"
}, {
  code: "+64",
  flag: "🇳🇿",
  name: "New Zealand"
}, {
  code: "+505",
  flag: "🇳🇮",
  name: "Nicaragua"
}, {
  code: "+227",
  flag: "🇳🇪",
  name: "Niger"
}, {
  code: "+234",
  flag: "🇳🇬",
  name: "Nigeria"
}, {
  code: "+389",
  flag: "🇲🇰",
  name: "North Macedonia"
}, {
  code: "+47",
  flag: "🇳🇴",
  name: "Norway"
}, {
  code: "+968",
  flag: "🇴🇲",
  name: "Oman"
}, {
  code: "+92",
  flag: "🇵🇰",
  name: "Pakistan"
}, {
  code: "+680",
  flag: "🇵🇼",
  name: "Palau"
}, {
  code: "+970",
  flag: "🇵🇸",
  name: "Palestine"
}, {
  code: "+507",
  flag: "🇵🇦",
  name: "Panama"
}, {
  code: "+675",
  flag: "🇵🇬",
  name: "Papua New Guinea"
}, {
  code: "+595",
  flag: "🇵🇾",
  name: "Paraguay"
}, {
  code: "+51",
  flag: "🇵🇪",
  name: "Peru"
}, {
  code: "+63",
  flag: "🇵🇭",
  name: "Philippines"
}, {
  code: "+48",
  flag: "🇵🇱",
  name: "Poland"
}, {
  code: "+351",
  flag: "🇵🇹",
  name: "Portugal"
}, {
  code: "+974",
  flag: "🇶🇦",
  name: "Qatar"
}, {
  code: "+40",
  flag: "🇷🇴",
  name: "Romania"
}, {
  code: "+7",
  flag: "🇷🇺",
  name: "Russia"
}, {
  code: "+250",
  flag: "🇷🇼",
  name: "Rwanda"
}, {
  code: "+1",
  flag: "🇰🇳",
  name: "Saint Kitts and Nevis"
}, {
  code: "+1",
  flag: "🇱🇨",
  name: "Saint Lucia"
}, {
  code: "+1",
  flag: "🇻🇨",
  name: "Saint Vincent and the Grenadines"
}, {
  code: "+685",
  flag: "🇼🇸",
  name: "Samoa"
}, {
  code: "+378",
  flag: "🇸🇲",
  name: "San Marino"
}, {
  code: "+239",
  flag: "🇸🇹",
  name: "Sao Tome and Principe"
}, {
  code: "+966",
  flag: "🇸🇦",
  name: "Saudi Arabia"
}, {
  code: "+221",
  flag: "🇸🇳",
  name: "Senegal"
}, {
  code: "+381",
  flag: "🇷🇸",
  name: "Serbia"
}, {
  code: "+248",
  flag: "🇸🇨",
  name: "Seychelles"
}, {
  code: "+232",
  flag: "🇸🇱",
  name: "Sierra Leone"
}, {
  code: "+65",
  flag: "🇸🇬",
  name: "Singapore"
}, {
  code: "+421",
  flag: "🇸🇰",
  name: "Slovakia"
}, {
  code: "+386",
  flag: "🇸🇮",
  name: "Slovenia"
}, {
  code: "+677",
  flag: "🇸🇧",
  name: "Solomon Islands"
}, {
  code: "+252",
  flag: "🇸🇴",
  name: "Somalia"
}, {
  code: "+27",
  flag: "🇿🇦",
  name: "South Africa"
}, {
  code: "+82",
  flag: "🇰🇷",
  name: "South Korea"
}, {
  code: "+211",
  flag: "🇸🇸",
  name: "South Sudan"
}, {
  code: "+34",
  flag: "🇪🇸",
  name: "Spain"
}, {
  code: "+94",
  flag: "🇱🇰",
  name: "Sri Lanka"
}, {
  code: "+249",
  flag: "🇸🇩",
  name: "Sudan"
}, {
  code: "+597",
  flag: "🇸🇷",
  name: "Suriname"
}, {
  code: "+46",
  flag: "🇸🇪",
  name: "Sweden"
}, {
  code: "+41",
  flag: "🇨🇭",
  name: "Switzerland"
}, {
  code: "+963",
  flag: "🇸🇾",
  name: "Syria"
}, {
  code: "+886",
  flag: "🇹🇼",
  name: "Taiwan"
}, {
  code: "+992",
  flag: "🇹🇯",
  name: "Tajikistan"
}, {
  code: "+255",
  flag: "🇹🇿",
  name: "Tanzania"
}, {
  code: "+66",
  flag: "🇹🇭",
  name: "Thailand"
}, {
  code: "+670",
  flag: "🇹🇱",
  name: "Timor-Leste"
}, {
  code: "+228",
  flag: "🇹🇬",
  name: "Togo"
}, {
  code: "+676",
  flag: "🇹🇴",
  name: "Tonga"
}, {
  code: "+1",
  flag: "🇹🇹",
  name: "Trinidad and Tobago"
}, {
  code: "+216",
  flag: "🇹🇳",
  name: "Tunisia"
}, {
  code: "+90",
  flag: "🇹🇷",
  name: "Turkey"
}, {
  code: "+993",
  flag: "🇹🇲",
  name: "Turkmenistan"
}, {
  code: "+688",
  flag: "🇹🇻",
  name: "Tuvalu"
}, {
  code: "+256",
  flag: "🇺🇬",
  name: "Uganda"
}, {
  code: "+380",
  flag: "🇺🇦",
  name: "Ukraine"
}, {
  code: "+971",
  flag: "🇦🇪",
  name: "United Arab Emirates"
}, {
  code: "+44",
  flag: "🇬🇧",
  name: "United Kingdom"
}, {
  code: "+1",
  flag: "🇺🇸",
  name: "United States"
}, {
  code: "+598",
  flag: "🇺🇾",
  name: "Uruguay"
}, {
  code: "+998",
  flag: "🇺🇿",
  name: "Uzbekistan"
}, {
  code: "+678",
  flag: "🇻🇺",
  name: "Vanuatu"
}, {
  code: "+39",
  flag: "🇻🇦",
  name: "Vatican City"
}, {
  code: "+58",
  flag: "🇻🇪",
  name: "Venezuela"
}, {
  code: "+84",
  flag: "🇻🇳",
  name: "Vietnam"
}, {
  code: "+967",
  flag: "🇾🇪",
  name: "Yemen"
}, {
  code: "+260",
  flag: "🇿🇲",
  name: "Zambia"
}, {
  code: "+263",
  flag: "🇿🇼",
  name: "Zimbabwe"
}];
function ProductCard({
  p,
  qty,
  t,
  addToCart,
  changeQty,
  onOpen
}) {
  const soldOut = !p.is_available;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => onOpen(p), className: `relative h-32 rounded-2xl bg-white shadow-[0_8px_24px_-8px_rgba(28,31,22,0.25)] cursor-pointer sm:h-auto ${soldOut ? "opacity-60" : ""}`, children: [
    soldOut ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 right-0 rounded-l-full bg-[#1c1f16]/70 px-3 py-1 text-xs font-bold uppercase text-white shadow-sm", children: t("client.soldOut") }) : p.badge && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 right-0 rounded-l-full bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground shadow-sm", children: p.badge }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-background text-3xl", children: p.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.image_url, alt: p.name, className: "h-full w-full object-cover" }) : p.emoji || "🍽️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-extrabold leading-tight text-[#1c1f16]", children: p.name }),
        p.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-snug text-muted-foreground line-clamp-2", children: p.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex flex-col gap-1 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-extrabold text-[#1c1f16]", children: [
            Number(p.price).toFixed(2),
            " DT"
          ] }),
          (p.kcal || p.prep_minutes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap", children: [
            p.kcal && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3 w-3" }),
              p.kcal,
              " ",
              t("client.kcal")
            ] }),
            p.kcal && p.prep_minutes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "|" }),
            p.prep_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              p.prep_minutes,
              " ",
              t("client.min")
            ] })
          ] })
        ] })
      ] })
    ] }),
    !soldOut && (qty === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
      e.stopPropagation();
      onOpen(p);
    }, className: "absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-tl-xl bg-primary text-primary-foreground shadow-md z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 right-0 flex items-center gap-1.5 rounded-tl-xl bg-white px-1.5 py-1 shadow-md z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
        e.stopPropagation();
        changeQty(p.id, -1);
      }, className: "grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-center text-sm font-bold text-[#1c1f16]", children: qty }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
        e.stopPropagation();
        changeQty(p.id, 1);
      }, className: "grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }) })
    ] }))
  ] });
}
function MenuPage() {
  const {
    restaurantId,
    tableNumber
  } = Route$3.useParams();
  const {
    t
  } = useI18n();
  const [loading, setLoading] = reactExports.useState(true);
  const [restaurant, setRestaurant] = reactExports.useState(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [activeCategory, setActiveCategory] = reactExports.useState("");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [showCover, setShowCover] = reactExports.useState(true);
  const [coverLeaving, setCoverLeaving] = reactExports.useState(false);
  const [showCategories, setShowCategories] = reactExports.useState(true);
  const [cart, setCart] = reactExports.useState({});
  const [productSupplements, setProductSupplements] = reactExports.useState({});
  const makeCartKey = (productId, supplementIds) => `${productId}::${[...supplementIds].sort().join(",")}`;
  const [detailNote, setDetailNote] = reactExports.useState("");
  const [detailSupplements, setDetailSupplements] = reactExports.useState([]);
  const [selectedSupplementIds, setSelectedSupplementIds] = reactExports.useState([]);
  const [detailQty, setDetailQty] = reactExports.useState(1);
  const [cartOpen, setCartOpen] = reactExports.useState(false);
  const [detailProduct, setDetailProduct] = reactExports.useState(null);
  const [notes, setNotes] = reactExports.useState("");
  const [customerFirstName, setCustomerFirstName] = reactExports.useState("");
  const [customerLastName, setCustomerLastName] = reactExports.useState("");
  const [customerPhone, setCustomerPhone] = reactExports.useState("");
  const [customerCountryCode, setCustomerCountryCode] = reactExports.useState("+216");
  const [sessionExpired, setSessionExpired] = reactExports.useState(false);
  const [showInfoError, setShowInfoError] = reactExports.useState(false);
  const [placing, setPlacing] = reactExports.useState(false);
  const [placedOrder, setPlacedOrder] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const storageKey = `menufy_session_${restaurantId}_${tableNumber}`;
    const SESSION_DURATION_MS = 2 * 60 * 60 * 1e3;
    const params = new URLSearchParams(window.location.search);
    const isFreshScan = params.get("qr") === "1";
    if (isFreshScan) {
      localStorage.setItem(storageKey, String(Date.now()));
      setSessionExpired(false);
      params.delete("qr");
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
    const checkSession = () => {
      const stored = localStorage.getItem(storageKey);
      const now = Date.now();
      if (!stored) {
        localStorage.setItem(storageKey, String(now));
      } else {
        const startedAt = parseInt(stored, 10);
        if (!isNaN(startedAt) && now - startedAt > SESSION_DURATION_MS) {
          setSessionExpired(true);
        }
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 1e4);
    return () => clearInterval(interval);
  }, [restaurantId, tableNumber]);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function load() {
      const {
        data: rest
      } = await supabase.from("restaurants").select("id, name, logo_url, facebook_url, instagram_url, address, phone, description, wifi, banner_url, banner_position_x, banner_position_y, banner_zoom").eq("id", restaurantId).eq("is_active", true).maybeSingle();
      if (cancelled) return;
      setRestaurant(rest ?? null);
      if (!rest) {
        setLoading(false);
        return;
      }
      const [{
        data: cats
      }, {
        data: prods
      }] = await Promise.all([supabase.from("categories").select("id, name, description, image_url, position").eq("restaurant_id", restaurantId).order("position"), supabase.from("products").select("id, category_id, name, description, price, emoji, image_url, is_available, position, kcal, prep_minutes, badge, tags").eq("restaurant_id", restaurantId).order("position")]);
      if (cancelled) return;
      const catList = cats ?? [];
      const prodList = prods ?? [];
      setCategories(catList);
      setProducts(prodList);
      const firstWithProducts = catList.find((c) => prodList.some((p) => p.category_id === c.id));
      if (firstWithProducts) {
        setActiveCategory(firstWithProducts.id);
      } else if (prodList.some((p) => p.category_id === null)) {
        setActiveCategory(UNCATEGORIZED);
      }
      if (prodList.length > 0) {
        const {
          data: supps
        } = await supabase.from("product_supplements").select("id, product_id, name, price, position").in("product_id", prodList.map((p) => p.id)).order("position");
        const grouped = {};
        for (const s of supps ?? []) {
          if (!grouped[s.product_id]) grouped[s.product_id] = [];
          grouped[s.product_id].push(s);
        }
        setProductSupplements(grouped);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);
  const visibleCategories = reactExports.useMemo(() => {
    const cats = categories.filter((c) => products.some((p) => p.category_id === c.id));
    if (products.some((p) => p.category_id === null)) {
      cats.push({
        id: UNCATEGORIZED,
        name: t("menu.uncategorized"),
        description: null,
        image_url: null,
        position: 9999
      });
    }
    return cats;
  }, [categories, products, t]);
  const categoryCards = reactExports.useMemo(() => {
    return visibleCategories.map((c) => {
      const cat = c;
      if (cat.image_url) {
        return {
          id: c.id,
          name: c.name,
          description: cat.description ?? null,
          imageUrl: cat.image_url
        };
      }
      const match = products.find((p) => (c.id === UNCATEGORIZED ? p.category_id === null : p.category_id === c.id) && p.image_url);
      return {
        id: c.id,
        name: c.name,
        description: cat.description ?? null,
        imageUrl: match?.image_url ?? null
      };
    });
  }, [visibleCategories, products]);
  const searchResults = reactExports.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
  }, [products, searchQuery]);
  const productsByCategory = reactExports.useMemo(() => {
    const map = {};
    for (const c of visibleCategories) {
      map[c.id] = c.id === UNCATEGORIZED ? products.filter((p) => p.category_id === null) : products.filter((p) => p.category_id === c.id);
    }
    return map;
  }, [visibleCategories, products]);
  const sectionRefs = reactExports.useRef({});
  const tabRefs = reactExports.useRef({});
  const isScrollingToSection = reactExports.useRef(false);
  const pendingScrollCategory = reactExports.useRef(null);
  const categoriesScrollPos = reactExports.useRef(0);
  const productsScrollPos = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const el = tabRefs.current[activeCategory];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  }, [activeCategory]);
  reactExports.useEffect(() => {
    if (searchQuery.trim()) return;
    const onScroll = () => {
      if (isScrollingToSection.current) return;
      const threshold = 140;
      let current = null;
      for (const c of visibleCategories) {
        const el = sectionRefs.current[c.id];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          current = c.id;
        } else {
          break;
        }
      }
      if (current && current !== activeCategory) {
        setActiveCategory(current);
      }
    };
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [visibleCategories, searchQuery, activeCategory]);
  reactExports.useEffect(() => {
    if (detailProduct) {
      const cartKey = makeCartKey(detailProduct.id, []);
      setDetailNote(cart[cartKey]?.note ?? "");
      setSelectedSupplementIds([]);
      setDetailQty(1);
      setDetailSupplements(productSupplements[detailProduct.id] ?? []);
    } else {
      setDetailSupplements([]);
      setSelectedSupplementIds([]);
      setDetailQty(1);
    }
  }, [detailProduct, productSupplements]);
  reactExports.useEffect(() => {
    const onPopState = (e) => {
      if (!showCover && !showCategories) {
        productsScrollPos.current = window.scrollY;
      } else if (!showCover && showCategories) {
        categoriesScrollPos.current = window.scrollY;
      }
      const view = e.state?.view ?? "cover";
      if (view === "cover") {
        setCoverLeaving(false);
        setShowCover(true);
        setShowCategories(true);
      } else if (view === "categories") {
        setShowCover(false);
        setShowCategories(true);
        isScrollingToSection.current = true;
        requestAnimationFrame(() => {
          window.scrollTo(0, categoriesScrollPos.current);
          setTimeout(() => {
            isScrollingToSection.current = false;
          }, 300);
        });
      } else if (view === "products") {
        setShowCover(false);
        setShowCategories(false);
        isScrollingToSection.current = true;
        requestAnimationFrame(() => {
          window.scrollTo(0, productsScrollPos.current);
          setTimeout(() => {
            isScrollingToSection.current = false;
          }, 300);
        });
      }
    };
    window.addEventListener("popstate", onPopState);
    if (!window.history.state?.view) {
      window.history.replaceState({
        view: "cover"
      }, "");
    }
    return () => window.removeEventListener("popstate", onPopState);
  }, [showCover, showCategories]);
  reactExports.useEffect(() => {
    if (showCategories) return;
    const targetId = pendingScrollCategory.current;
    if (!targetId || targetId === UNCATEGORIZED) {
      pendingScrollCategory.current = null;
      return;
    }
    isScrollingToSection.current = true;
    let attempts = 0;
    let timeoutId;
    const tryScroll = () => {
      const el = sectionRefs.current[targetId];
      if (el) {
        el.scrollIntoView({
          behavior: "auto",
          block: "start"
        });
        setActiveCategory(targetId);
        pendingScrollCategory.current = null;
        setTimeout(() => {
          isScrollingToSection.current = false;
        }, 400);
      } else if (attempts < 20) {
        attempts++;
        timeoutId = setTimeout(tryScroll, 50);
      } else {
        pendingScrollCategory.current = null;
        isScrollingToSection.current = false;
      }
    };
    timeoutId = setTimeout(tryScroll, 50);
    return () => clearTimeout(timeoutId);
  }, [showCategories, productsByCategory]);
  const scrollToCategory = (id) => {
    setActiveCategory(id);
    const el = sectionRefs.current[id];
    if (el) {
      isScrollingToSection.current = true;
      el.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      setTimeout(() => {
        isScrollingToSection.current = false;
      }, 600);
    }
  };
  const cartItems = reactExports.useMemo(() => {
    return Object.entries(cart).map(([cartKey, entry]) => {
      const product = products.find((p) => p.id === entry.productId);
      if (!product || entry.qty <= 0) return null;
      const allSupp = productSupplements[entry.productId] ?? [];
      const chosenSupplements = allSupp.filter((s) => entry.supplementIds.includes(s.id));
      const unitPrice = Number(product.price) + chosenSupplements.reduce((sum, s) => sum + Number(s.price), 0);
      return {
        cartKey,
        product,
        qty: entry.qty,
        note: entry.note,
        supplements: chosenSupplements,
        unitPrice
      };
    }).filter((x) => x !== null);
  }, [cart, products, productSupplements]);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const addToCart = (productId, note, supplementIds = [], qtyToAdd = 1) => {
    const cartKey = makeCartKey(productId, supplementIds);
    setCart((c) => ({
      ...c,
      [cartKey]: {
        productId,
        qty: (c[cartKey]?.qty ?? 0) + qtyToAdd,
        note: note ?? c[cartKey]?.note ?? "",
        supplementIds
      }
    }));
  };
  const changeQtyByKey = (cartKey, delta) => {
    setCart((c) => {
      const next = {
        ...c
      };
      const entry = next[cartKey];
      if (!entry) return c;
      const updated = Math.max(0, entry.qty + delta);
      if (updated === 0) {
        delete next[cartKey];
      } else {
        next[cartKey] = {
          ...entry,
          qty: updated
        };
      }
      return next;
    });
  };
  const changeQty = (productId, delta) => {
    const cartKey = makeCartKey(productId, []);
    if (delta > 0 && !cart[cartKey]) {
      addToCart(productId);
      return;
    }
    changeQtyByKey(cartKey, delta);
  };
  const placeOrder = async () => {
    if (!restaurant || cartItems.length === 0) return;
    if (!customerFirstName.trim() || !customerLastName.trim() || !customerPhone.trim()) {
      setShowInfoError(true);
      return;
    }
    setShowInfoError(false);
    setPlacing(true);
    const {
      data: order,
      error: orderError
    } = await supabase.from("orders").insert({
      restaurant_id: restaurant.id,
      table_number: parseInt(tableNumber, 10) || null,
      status: "pending",
      total: cartTotal,
      notes: notes.trim() || null,
      customer_name: `${customerFirstName.trim()} ${customerLastName.trim()}`,
      customer_phone: `${customerCountryCode} ${customerPhone.trim()}`
    }).select("id").single();
    if (orderError || !order) {
      setPlacing(false);
      return;
    }
    const items = cartItems.map((i) => {
      const suppText = i.supplements.length > 0 ? ` + ${i.supplements.map((s) => s.name).join(", ")}` : "";
      const noteText = i.note.trim() ? ` (${i.note.trim()})` : "";
      return {
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name + suppText + noteText,
        product_price: i.unitPrice,
        quantity: i.qty
      };
    });
    await supabase.from("order_items").insert(items);
    setPlacing(false);
    setPlacedOrder({
      total: cartTotal
    });
    setCartOpen(false);
    setCart({});
    setNotes("");
  };
  const startNewOrder = () => {
    setPlacedOrder(null);
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerPhone("");
    setShowInfoError(false);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("menu.loading") }) });
  }
  if (!restaurant) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between border-b border-border/50 px-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { size: "sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-md px-4 py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-extrabold", children: t("client.notFound.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t("client.notFound.subtitle") })
      ] })
    ] });
  }
  if (showCover) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RestaurantCover, { name: restaurant.name, logoUrl: restaurant.logo_url, facebookUrl: restaurant.facebook_url, instagramUrl: restaurant.instagram_url, tableNumber, leaving: coverLeaving, onOrder: () => {
      setCoverLeaving(true);
      window.history.pushState({
        view: "categories"
      }, "");
      setTimeout(() => setShowCover(false), 250);
    } });
  }
  if (showCategories && categoryCards.length > 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryGrid, { name: restaurant.name, logoUrl: restaurant.logo_url, facebookUrl: restaurant.facebook_url, instagramUrl: restaurant.instagram_url, address: restaurant.address, phone: restaurant.phone, description: restaurant.description, wifi: restaurant.wifi, categories: categoryCards, onSelect: (id) => {
      categoriesScrollPos.current = window.scrollY;
      pendingScrollCategory.current = id;
      window.history.pushState({
        view: "products"
      }, "");
      setShowCategories(false);
    }, onBack: () => {
      setCoverLeaving(false);
      setShowCover(true);
    } });
  }
  if (placedOrder) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center bg-[#f3efe4] px-6 text-center text-[#1c1f16]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-9 w-9" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-2xl font-extrabold", children: t("client.success.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-xs text-sm text-[#1c1f16]/60", children: t("client.success.subtitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 w-full max-w-xs rounded-2xl bg-white p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#1c1f16]/60", children: t("client.success.table") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: tableNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#1c1f16]/60", children: t("client.total") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-gold", children: [
            placedOrder.total.toFixed(2),
            " DT"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: startNewOrder, className: "mt-8 w-full max-w-xs", children: t("client.success.newOrder") })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen animate-fade-in bg-[#f3efe4] pb-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl sm:px-6 sm:py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative bg-[#f3efe4]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-56 w-full overflow-hidden sm:-mx-6 sm:-mt-8 sm:w-[calc(100%+3rem)]", children: [
        restaurant.banner_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.banner_url, alt: "", className: "absolute inset-0 h-full w-full object-cover", style: {
          objectPosition: `${restaurant.banner_position_x ?? 50}% ${restaurant.banner_position_y ?? 50}%`,
          transform: `scale(${restaurant.banner_zoom ?? 1})`,
          transformOrigin: `${restaurant.banner_position_x ?? 50}% ${restaurant.banner_position_y ?? 50}%`
        } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#1c1f16]/10 to-[#1c1f16]/5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          productsScrollPos.current = window.scrollY;
          window.history.back();
        }, className: "grid h-9 w-9 place-items-center rounded-full border border-[#1c1f16]/25 bg-white/70 text-[#1c1f16] backdrop-blur-sm", "aria-label": "Back", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-4 top-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, { variant: "light" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-t-3xl bg-[#f3efe4] -mt-6 px-4 pb-3 pt-20 text-center", children: [
        restaurant.logo_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 flex h-36 w-36 items-center justify-center rounded-full border-4 border-[#f3efe4] bg-white p-5 shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: restaurant.logo_url, alt: restaurant.name, className: "max-h-full max-w-full object-contain" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-xl font-extrabold leading-tight text-[#1c1f16]", children: restaurant.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs uppercase tracking-wider text-[#1c1f16]/40", children: [
          t("client.table"),
          " ",
          tableNumber
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-md px-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: t("client.searchPlaceholder"), className: "ps-9 bg-white text-[#1c1f16] placeholder:text-[#1c1f16]/40" })
      ] }) })
    ] }),
    visibleCategories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `scrollbar-none sticky top-0 z-30 flex gap-2 overflow-x-auto bg-[#f3efe4] px-4 py-3 mx-auto max-w-md sm:max-w-none ${searchQuery.trim() ? "opacity-40" : ""}`, children: visibleCategories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { ref: (el) => {
      tabRefs.current[c.id] = el;
    }, onClick: () => {
      setSearchQuery("");
      scrollToCategory(c.id);
    }, className: `shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${activeCategory === c.id ? "border-primary bg-primary text-primary-foreground" : "border-[#1c1f16]/15 bg-white text-[#1c1f16]/70"}`, children: c.name }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "mx-auto max-w-md px-2 py-4 pb-[60vh] sm:px-4 sm:max-w-none", children: visibleCategories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-center text-sm text-muted-foreground", children: t("client.empty") }) : searchResults ? searchResults.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-10 text-center text-sm text-muted-foreground", children: t("client.noResults") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0", children: searchResults.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { p, qty: cart[makeCartKey(p.id, [])]?.qty ?? 0, t, addToCart, changeQty, onOpen: setDetailProduct }, p.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: visibleCategories.map((c) => {
      const prods = productsByCategory[c.id] ?? [];
      if (prods.length === 0) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-category-id": c.id, ref: (el) => {
        sectionRefs.current[c.id] = el;
      }, className: "scroll-mt-32", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-lg font-extrabold uppercase tracking-wide text-[#1c1f16]", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0", children: prods.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { p, qty: cart[makeCartKey(p.id, [])]?.qty ?? 0, t, addToCart, changeQty, onOpen: setDetailProduct }, p.id)) })
      ] }, c.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mx-auto max-w-md px-4 py-6 text-center text-xs text-[#1c1f16]/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        t("client.poweredBy"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://menufy-tau.vercel.app", target: "_blank", rel: "noreferrer", className: "font-semibold text-[#1c1f16]/60 hover:text-[#1c1f16]", children: "Menufy" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Menufy. ",
        t("client.allRightsReserved")
      ] })
    ] }),
    cartCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-0 z-40 border-t border-[#1c1f16]/10 bg-[#f3efe4]/95 p-4 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCartOpen(true), className: "mx-auto flex max-w-md w-full items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-sm font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4" }),
        cartCount,
        " ",
        cartCount > 1 ? t("client.items") : t("client.item")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-extrabold", children: [
        cartTotal.toFixed(2),
        " DT"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!detailProduct, onOpenChange: (open) => !open && setDetailProduct(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-h-[90vh] overflow-y-auto bg-[#f3efe4] text-[#1c1f16]", children: detailProduct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-56 w-56 place-items-center overflow-hidden rounded-2xl bg-background text-6xl", children: detailProduct.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: detailProduct.image_url, alt: detailProduct.name, className: "h-full w-full object-cover" }) : detailProduct.emoji || "🍽️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg text-muted-foreground", children: detailProduct.name }),
      detailProduct.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: detailProduct.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-3xl font-extrabold text-[#1c1f16]", children: [
        (Number(detailProduct.price) + detailSupplements.filter((s) => selectedSupplementIds.includes(s.id)).reduce((sum, s) => sum + Number(s.price), 0)).toFixed(2),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-semibold", children: "DT" })
      ] }),
      detailSupplements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 w-full space-y-1.5 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-[#1c1f16]/60", children: t("client.supplements") }),
        detailSupplements.map((s) => {
          const checked = selectedSupplementIds.includes(s.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedSupplementIds((prev) => checked ? prev.filter((id) => id !== s.id) : [...prev, s.id]), className: `flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm ${checked ? "border-primary bg-primary/10" : "border-[#1c1f16]/15 bg-white"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 font-medium text-[#1c1f16]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-4 w-4 place-items-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-[#1c1f16]/30"}`, children: checked && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) }),
              s.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-[#1c1f16]/70", children: [
              "+",
              Number(s.price).toFixed(2),
              " DT"
            ] })
          ] }, s.id);
        })
      ] }),
      !detailProduct.is_available ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-4 rounded-full bg-[#1c1f16]/70 px-4 py-1.5 text-sm font-bold uppercase text-white", children: t("client.soldOut") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-6 rounded-full bg-[#ebe7dc] px-6 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDetailQty((q) => Math.max(1, q - 1)), className: "grid h-7 w-7 place-items-center text-[#1c1f16]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 text-center text-lg font-bold text-[#1c1f16]", children: detailQty }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDetailQty((q) => q + 1), className: "grid h-7 w-7 place-items-center text-[#1c1f16]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 w-full space-y-1.5 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-[#1c1f16]/60", children: t("client.itemNote") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: detailNote, onChange: (e) => setDetailNote(e.target.value), placeholder: t("client.itemNotePlaceholder"), rows: 2, className: "bg-white" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          addToCart(detailProduct.id, detailNote, selectedSupplementIds, detailQty);
          setDetailProduct(null);
        }, className: "mt-4 w-full gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4" }),
          t("client.addToCart")
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: cartOpen, onOpenChange: setCartOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto bg-[#f3efe4] text-[#1c1f16]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-[#1c1f16]", children: t("client.cartTitle") }) }),
      cartItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-center text-sm text-[#1c1f16]/60", children: t("client.cartEmpty") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        cartItems.map(({
          cartKey,
          product,
          qty,
          note,
          supplements,
          unitPrice
        }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-background text-xl", children: product.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image_url, alt: product.name, className: "h-full w-full object-cover" }) : product.emoji || "🍽️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold text-[#1c1f16]", children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#1c1f16]/50", children: [
              unitPrice.toFixed(2),
              " DT"
            ] }),
            supplements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#1c1f16]/50", children: [
              "+ ",
              supplements.map((s) => s.name).join(", ")
            ] }),
            note.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs italic text-[#1c1f16]/50", children: note.trim() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => changeQtyByKey(cartKey, -1), className: "grid h-7 w-7 place-items-center rounded-full border border-[#1c1f16]/15 bg-white text-[#1c1f16]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-center text-sm font-bold text-[#1c1f16]", children: qty }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => changeQtyByKey(cartKey, 1), className: "grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-16 shrink-0 text-end text-sm font-bold text-gold", children: [
            (unitPrice * qty).toFixed(2),
            " DT"
          ] })
        ] }, cartKey)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: t("client.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: t("client.notesPlaceholder"), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-bold shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#1c1f16]/60", children: t("client.success.table") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#1c1f16]", children: tableNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-[#1c1f16]/10 pt-3 text-base font-extrabold text-[#1c1f16]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("client.total") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gold", children: [
            cartTotal.toFixed(2),
            " DT"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t border-[#1c1f16]/10 pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-[#1c1f16]", children: [
            t("client.yourInfo"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: customerFirstName, onChange: (e) => setCustomerFirstName(e.target.value), placeholder: `${t("client.firstNamePlaceholder")} *` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: customerLastName, onChange: (e) => setCustomerLastName(e.target.value), placeholder: `${t("client.lastNamePlaceholder")} *` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: customerCountryCode, onValueChange: setCustomerCountryCode, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COUNTRY_CODES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
                c.flag,
                " ",
                c.code
              ] }, c.code)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value), placeholder: `${t("client.phonePlaceholder")} *`, className: "flex-1" })
          ] }),
          showInfoError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-destructive", children: t("client.missingInfoError") })
        ] })
      ] }),
      cartItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: placeOrder, disabled: placing, className: "w-full", children: placing ? t("client.placing") : t("client.confirmOrder") }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: sessionExpired, onOpenChange: () => {
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "bg-[#f3efe4] text-[#1c1f16] [&>button]:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center px-2 py-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-extrabold", children: t("client.sessionExpired.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-[#1c1f16]/70", children: t("client.sessionExpired.subtitle") })
    ] }) }) })
  ] }) });
}
export {
  MenuPage as component
};
