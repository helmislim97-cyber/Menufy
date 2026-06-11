import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { LangSwitch } from "@/components/lang-switch";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, Store } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).catch("login").optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Connexion — Menufy" },
      { name: "description", content: "Connectez-vous ou créez votre compte restaurant Menufy." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const isRegister = mode === "register";
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName, restaurant_name: restaurantName },
          },
        });
        if (error) throw error;
        toast.success("Compte créé !");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link to="/"><Logo /></Link>
        <LangSwitch />
      </header>

      <div className="mx-auto flex max-w-md flex-col px-4 pb-12 pt-6">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isRegister ? t("auth.register.title") : t("auth.login.title")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isRegister ? t("auth.register.subtitle") : t("auth.login.subtitle")}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3.5">
            {isRegister && (
              <>
                <Field icon={Store} placeholder={t("auth.restaurantName")} value={restaurantName} onChange={setRestaurantName} required />
                <Field icon={UserIcon} placeholder={t("auth.fullName")} value={fullName} onChange={setFullName} required />
              </>
            )}
            <Field icon={Mail} type="email" placeholder={t("auth.email")} value={email} onChange={setEmail} required />
            <Field icon={Lock} type="password" placeholder={t("auth.password")} value={password} onChange={setPassword} required minLength={6} />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRegister ? t("auth.register.button") : t("auth.login.button")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? t("auth.toLogin") : t("auth.toRegister")}{" "}
            <Link to="/auth" search={{ mode: isRegister ? "login" : "register" }} className="font-semibold text-primary hover:underline">
              {isRegister ? t("auth.signIn") : t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, type = "text", placeholder, value, onChange, required, minLength,
}: {
  icon: typeof Mail; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; minLength?: number;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full rounded-xl border border-border bg-background px-10 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
