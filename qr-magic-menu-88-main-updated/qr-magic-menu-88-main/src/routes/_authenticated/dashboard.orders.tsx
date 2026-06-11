import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/dashboard/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <LangSwitch />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-extrabold">{t("nav.dashboard.orders")}</h1>
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">🚧 Phase 2</p>
          <p className="mt-1">Le flux de commandes en temps réel arrive ici.</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
