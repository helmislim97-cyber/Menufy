import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, UtensilsCrossed, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl">

export function BottomNav() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/dashboard", icon: Home, label: t("nav.dashboard.home"), exact: true },
    { to: "/dashboard/orders", icon: ClipboardList, label: t("nav.dashboard.orders"), exact: false },
    { to: "/dashboard/menu", icon: UtensilsCrossed, label: t("nav.dashboard.menu"), exact: false },
    { to: "/dashboard/settings", icon: Settings, label: t("nav.dashboard.settings"), exact: false },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-3xl grid-cols-4">
        {items.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
