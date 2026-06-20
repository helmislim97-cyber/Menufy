import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Home,
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
  Menu as MenuIcon,
  X,
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
      { to: "/dashboard", icon: Home, labelKey: "sidebar.home" },
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

const MOBILE_QUICK_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: Home, labelKey: "sidebar.home" },
  { to: "/dashboard/orders", icon: ShoppingBag, labelKey: "sidebar.orders" },
  { to: "/dashboard/menu", icon: UtensilsCrossed, labelKey: "sidebar.menu" },
  { to: "/dashboard/assistance", icon: BellRing, labelKey: "sidebar.assistance" },
];

function NavLinks({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.titleKey} className="mt-4 first:mt-0">
          {expanded && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{t(group.titleKey)}</p>
          )}
          <div className="mt-1 space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
              if (item.comingSoon) {
                return (
                  <div
                    key={item.to}
                    title={!expanded ? t(item.labelKey) : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30",
                      !expanded && "h-11 w-11 sm:h-12 sm:w-12 justify-center px-0 mx-auto",
                    )}
                  >
                    <item.icon className={expanded ? "h-[18px] w-[18px] shrink-0 sm:h-6 sm:w-6" : "h-5 w-5 shrink-0 sm:h-6 sm:w-6"} />
                    {expanded && t(item.labelKey)}
                  </div>
                );
              }
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  title={!expanded ? t(item.labelKey) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors sm:text-base sm:py-3",
                    !expanded && "h-11 w-11 sm:h-12 sm:w-12 justify-center px-0 mx-auto",
                    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon className={expanded ? "h-[18px] w-[18px] shrink-0 sm:h-6 sm:w-6" : "h-5 w-5 shrink-0 sm:h-6 sm:w-6"} />
                  {expanded && t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function DashboardSidebar() {
  const { t, dir } = useI18n();
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [expanded, setExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop: always-visible collapsible vertical sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-40 hidden sm:flex flex-col bg-[#1a2332] text-white transition-all duration-200",
          dir === "rtl" ? "right-0" : "left-0",
          expanded ? "w-80" : "w-20",
        )}
      >
        <div className="flex items-center justify-between px-3 py-4">
          {expanded && <Logo size="sm" />}
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 hover:text-white", !expanded && "mx-auto")}
            aria-label={t("sidebar.open")}
          >
            {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <NavLinks expanded={expanded} />

        <div className="border-t border-white/10 px-3 py-4">
          {expanded && (
            <div className="mb-3">
              <p className="truncate text-sm font-semibold">{user?.email?.split("@")[0] ?? ""}</p>
              <p className="truncate text-xs text-white/40">{user?.email ?? ""}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            title={!expanded ? t("sidebar.logout") : undefined}
            className={cn("flex items-center gap-2 text-sm font-medium text-destructive", !expanded && "justify-center w-full")}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {expanded && t("sidebar.logout")}
          </button>
        </div>
      </div>

      {/* Mobile: fixed bottom bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-[#1a2332] sm:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_QUICK_ITEMS.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] font-medium",
                  active ? "text-primary" : "text-white/60",
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-white/60"
          >
            <MenuIcon className="h-5 w-5" />
            {t("sidebar.more")}
          </button>
        </div>
      </nav>

      {/* Mobile: slide-out full menu, triggered by "Plus" */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div
            className={cn(
              "relative flex h-full w-72 flex-col bg-[#1a2332] text-white shadow-xl",
              dir === "rtl" ? "ms-auto" : "",
            )}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <Logo size="sm" />
              <button onClick={() => setMobileMenuOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks expanded onNavigate={() => setMobileMenuOpen(false)} />
            <div className="border-t border-white/10 px-4 py-4">
              <p className="truncate text-sm font-semibold">{user?.email?.split("@")[0] ?? ""}</p>
              <p className="truncate text-xs text-white/40">{user?.email ?? ""}</p>
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