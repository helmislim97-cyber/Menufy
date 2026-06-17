import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CjM7Gvsx.mjs";
import { R as Route$a, u as useI18n, a as useAuth } from "./router-QBDctAac.mjs";
import { L as LangSwitch } from "./lang-switch-Do_3_4HU.mjs";
import { L as Logo } from "./logo-CA2Gasx3.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { S as Store, U as User, M as Mail, L as Lock, a as LoaderCircle } from "../_libs/lucide-react.mjs";
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
function AuthPage() {
  const {
    mode = "login"
  } = Route$a.useSearch();
  const isRegister = mode === "register";
  const {
    t
  } = useI18n();
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [user, loading, navigate]);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [restaurantName, setRestaurantName] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: {
              full_name: fullName,
              restaurant_name: restaurantName
            }
          }
        });
        if (error) throw error;
        toast.success("Compte créé !");
        navigate({
          to: "/dashboard"
        });
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({
          to: "/dashboard"
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 -z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between px-4 py-5 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitch, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex max-w-md flex-col px-4 pb-12 pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-extrabold tracking-tight", children: isRegister ? t("auth.register.title") : t("auth.login.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: isRegister ? t("auth.register.subtitle") : t("auth.login.subtitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-6 space-y-3.5", children: [
        isRegister && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: Store, placeholder: t("auth.restaurantName"), value: restaurantName, onChange: setRestaurantName, required: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: User, placeholder: t("auth.fullName"), value: fullName, onChange: setFullName, required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: Mail, type: "email", placeholder: t("auth.email"), value: email, onChange: setEmail, required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: Lock, type: "password", placeholder: t("auth.password"), value: password, onChange: setPassword, required: true, minLength: 6 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: submitting, className: "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60", children: [
          submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          isRegister ? t("auth.register.button") : t("auth.login.button")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        isRegister ? t("auth.toLogin") : t("auth.toRegister"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
          mode: isRegister ? "login" : "register"
        }, className: "font-semibold text-primary hover:underline", children: isRegister ? t("auth.signIn") : t("auth.signUp") })
      ] })
    ] }) })
  ] });
}
function Field({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  minLength
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, placeholder, value, onChange: (e) => onChange(e.target.value), required, minLength, className: "w-full rounded-xl border border-border bg-background px-10 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" })
  ] });
}
export {
  AuthPage as component
};
