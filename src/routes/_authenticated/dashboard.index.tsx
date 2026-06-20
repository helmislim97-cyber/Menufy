import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LogOut, UtensilsCrossed, ShoppingBag, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AssistanceBell } from "@/components/assistance-bell";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

interface Restaurant {
  id: string;
  name: string;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRestaurant(data);
        if (!data) return;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", data.id)
          .then(({ count }) => setProductCount(count ?? 0));

        supabase
          .from("orders")
          .select("id, total, status", { count: "exact" })
          .eq("restaurant_id", data.id)
          .gte("created_at", todayStart.toISOString())
          .then(({ data: orders, count }) => {
            setOrderCount(count ?? 0);
            const pending = (orders ?? []).filter((o) => o.status === "pending" || o.status === "preparing").length;
            setPendingCount(pending);
            const total = (orders ?? [])
              .filter((o) => o.status === "paid")
              .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
            setRevenue(total);
          });
      });
  }, [user]);

  const onLogout = async () => {
    await signOut();
    toast.success("À bientôt !");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background pb-24 ps-16">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <AssistanceBell />
            <LangSwitch />
            <button onClick={onLogout} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-3xl border border-border bg-gradient-brand p-6 text-primary-foreground shadow-glow">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Restaurant</p>
          <h1 className="mt-1 text-2xl font-extrabold">{restaurant?.name ?? "…"}</h1>
          <p className="mt-2 text-sm opacity-90">Bienvenue sur votre tableau de bord.</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Kpi icon={TrendingUp} label="Revenu du jour" value={revenue !== null ? `${revenue.toFixed(2)} DT` : "…"} />
          <Kpi icon={ShoppingBag} label="Commandes" value={orderCount !== null ? String(orderCount) : "…"} />
          <Kpi icon={Clock} label="En cours" value={pendingCount !== null ? String(pendingCount) : "…"} />
          <Kpi icon={UtensilsCrossed} label="Produits" value={productCount !== null ? String(productCount) : "…"} />
        </div>

        {productCount === 0 && (
          <Link
            to="/dashboard/menu"
            className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-sm transition-colors hover:bg-primary/10"
          >
            <div>
              <p className="font-semibold text-foreground">{t("menu.title")}</p>
              <p className="mt-1 text-muted-foreground">{t("menu.noCategoriesHint")}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
          </Link>
        )}
      </main>

      <DashboardSidebar />
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}