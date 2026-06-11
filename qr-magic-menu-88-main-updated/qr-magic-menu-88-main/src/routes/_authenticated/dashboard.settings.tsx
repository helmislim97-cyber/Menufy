import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await signOut();
    toast.success("À bientôt !");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Logo size="sm" />
          <LangSwitch />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-extrabold">{t("nav.dashboard.settings")}</h1>
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">🚧 Phase 2</p>
          <p className="mt-1">Informations du restaurant, tables, QR codes — bientôt ici.</p>
        </div>
        <Button onClick={onLogout} variant="outline" className="mt-6 w-full gap-2">
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
