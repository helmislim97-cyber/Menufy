import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu as MenuIcon,
  X,
  ShoppingBag,
  BellRing,
  Heart,
  UtensilsCrossed,
  Table2,
  Palette,
  Settings2,
  Bell,
  Shield,
  Clock,
  FileDown,
  PieChart,
  TrendingUp,
  User,
  Lock,
  MessageSquare,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: typeof ShoppingBag;
  labelKey: string;
  comingSoon?: boolean;
}

interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: "sidebar.group.activity",
    items: [
      { to: "/dashboard/orders", icon: ShoppingBag, labelKey: "sidebar.orders" },
      { to: "/dashboard/assistance", icon: BellRing, labelKey: "sidebar.assistance" },
      { to: "/dashboard/loyalty", icon: Heart, labelKey: "sidebar.loyalty", comingSoon: true },
    ],
  },
  {
    titleKey: "sidebar.group.management",
    items: [
      { to: "/dashboard/menu", icon: UtensilsCrossed, labelKey: "sidebar.menu" },
      { to: "/dashboard/tables", icon: Table2, labelKey: "sidebar.tables" },
      { to: "/dashboard/appearance", icon: Palette, labelKey: "sidebar.appearance" },
      { to: "/dashboard/info", icon: Settings2, labelKey: "sidebar.info" },
      { to: "/dashboard/notifications", icon: Bell, labelKey: "sidebar.notifications", comingSoon: true },
      { to: "/dashboard/roles", icon: Shield, labelKey: "sidebar.roles", comingSoon: true },
    ],
  },
  {
    titleKey: "sidebar.group.stats",
    items: [
      { to: "/dashboard/recap", icon: Clock, labelKey: "sidebar.recap", comingSoon: true },
      { to: "/dashboard/daily-report", icon: FileDown, labelKey: "sidebar.dailyReport", comingSoon: true },
      { to: "/dashboard/orders-stats", icon: PieChart, labelKey: "sidebar.ordersStats", comingSoon: true },
      { to: "/dashboard/sales", icon: TrendingUp, labelKey: "sidebar.sales", comingSoon: true },
    ],
  },
  {
    titleKey: "sidebar.group.account",
    items: [
      { to: "/dashboard/profile", icon: User, labelKey: "sidebar.profile", comingSoon: true },
      { to: "/dashboard/password", icon: Lock, labelKey: "sidebar.password", comingSoon: true },
      { to: "/dashboard/contact", icon: MessageSquare, labelKey: "sidebar.contact", comingSoon: true },
      { to: "/dashboard/help", icon: HelpCircle, labelKey: "sidebar.help", comingSoon: true },
    ],
  },
];

export function DashboardSidebar() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-full bg-background shadow-lg border border-border"
        aria-label={t("sidebar.open")}
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-72 flex-col bg-[#1a2332] text-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <Logo size="sm" />
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-3">
              {NAV_GROUPS.map((group) => (
                <div key={group.titleKey} className="mt-4 first:mt-0">
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{t(group.titleKey)}</p>
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.to || pathname.startsWith(item.to + "/");
                      if (item.comingSoon) {
                        return (
                          <div
                            key={item.to}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30"
                          >
                            <item.icon className="h-4.5 w-4.5 shrink-0" />
                            {t(item.labelKey)}
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <item.icon className="h-4.5 w-4.5 shrink-0" />
                          {t(item.labelKey)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-white/10 px-4 py-4">
              <p className="text-sm font-semibold">{user?.email?.split("@")[0] ?? ""}</p>
              <p className="text-xs text-white/40">{user?.email ?? ""}</p>
              <button onClick={onLogout} className="mt-3 flex items-center gap-2 text-sm font-medium text-destructive">
                <LogOut className="h-4 w-4" />
                {t("sidebar.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}