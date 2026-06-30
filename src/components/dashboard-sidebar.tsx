import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
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
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type Listener = (expanded: boolean) => void;
const listeners = new Set<Listener>();
let sidebarExpandedValue = true;
function setSidebarExpandedGlobal(v: boolean) {
  sidebarExpandedValue = v;
  listeners.forEach((l) => l(v));
}
export function useSidebarExpanded() {
  const [val, setVal] = useState(sidebarExpandedValue);
  useEffect(() => {
    listeners.add(setVal);
    return () => {
      listeners.delete(setVal);
    };
  }, []);
  return val;
}

interface NavItem {
  to: string;
  icon: typeof ShoppingBag;
  labelKey: string;
  comingSoon?: boolean;
  showNotifBadge?: boolean;
  children?: { to: string; labelKey: string }[];
}

function useNotifUnread() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    let rid: string | null = null;
    const compute = async () => {
      if (!rid) {
        const { data } = await supabase.from("restaurants").select("id").eq("owner_id", user.id).maybeSingle();
        rid = data?.id ?? null;
      }
      if (!rid) return;
      let seen: Set<string>;
      try { seen = new Set(JSON.parse(localStorage.getItem("menufy_notif_seen_ids") ?? "[]")); } catch { seen = new Set(); }
      const [{ data: orders }, { data: reviews }, { data: assistance }] = await Promise.all([
        supabase.from("orders").select("id, status").eq("restaurant_id", rid).order("created_at", { ascending: false }).limit(40),
        supabase.from("reviews").select("id").eq("restaurant_id", rid).order("created_at", { ascending: false }).limit(20),
        supabase.from("assistance_requests").select("id").eq("restaurant_id", rid).order("created_at", { ascending: false }).limit(20),
      ]);
      let c = 0;
      (orders ?? []).forEach((o: any) => { const id = o.status === "cancelled" ? `c-${o.id}` : `o-${o.id}`; if (!seen.has(id)) c++; });
      (reviews ?? []).forEach((r: any) => { if (!seen.has(`r-${r.id}`)) c++; });
      (assistance ?? []).forEach((a: any) => { if (!seen.has(`a-${a.id}`)) c++; });
      setCount(c);
    };
    compute();
    const interval = setInterval(compute, 20000);
    const onSeen = () => compute();
    window.addEventListener("menufy-notif-seen", onSeen);

    // Realtime: update badge instantly on new activity
    const ch = supabase
      .channel("sidebar-notif-badge")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, compute)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, compute)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "assistance_requests" }, compute)
      .subscribe();

    return () => {
      clearInterval(interval);
      window.removeEventListener("menufy-notif-seen", onSeen);
      supabase.removeChannel(ch);
    };
  }, [user]);
  return count;
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
      {
        to: "/dashboard/orders",
        icon: ShoppingBag,
        labelKey: "sidebar.orders",
        children: [
          { to: "/kitchen", labelKey: "sidebar.kitchenMode" },
          { to: "/cashier", labelKey: "sidebar.cashierMode" },
        ],
      },
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
      { to: "/dashboard/notifications", icon: Bell, labelKey: "sidebar.notifications", showNotifBadge: true },
      { to: "/dashboard/roles", icon: Shield, labelKey: "sidebar.roles" },
    ],
  },
  {
    titleKey: "sidebar.group.stats",
    items: [
      { to: "/dashboard/recap", icon: Clock, labelKey: "sidebar.recap" },
      { to: "/dashboard/daily-report", icon: FileDown, labelKey: "sidebar.dailyReport" },
      { to: "/dashboard/orders-stats", icon: PieChart, labelKey: "sidebar.ordersStats" },
      { to: "/dashboard/sales", icon: TrendingUp, labelKey: "sidebar.sales" },
    ],
  },
  {
    titleKey: "sidebar.group.account",
    items: [
      { to: "/dashboard/profile", icon: User, labelKey: "sidebar.profile", href: "/dashboard/profile" },
      { to: "/dashboard/password", icon: Lock, labelKey: "sidebar.password" },
      { to: "/dashboard/contact", icon: MessageSquare, labelKey: "sidebar.contact", comingSoon: true },
      { to: "/dashboard/help", icon: HelpCircle, labelKey: "sidebar.help", comingSoon: true },
    ],
  },
];

const MOBILE_QUICK_ITEMS: NavItem[] = [
  { to: "/dashboard", icon: Home, labelKey: "sidebar.home" },
  {
        to: "/dashboard/orders",
        icon: ShoppingBag,
        labelKey: "sidebar.orders",
        children: [
          { to: "/kitchen", labelKey: "sidebar.kitchenMode" },
          { to: "/cashier", labelKey: "sidebar.cashierMode" },
        ],
      },
  { to: "/dashboard/menu", icon: UtensilsCrossed, labelKey: "sidebar.menu" },
  { to: "/dashboard/assistance", icon: BellRing, labelKey: "sidebar.assistance" },
];

let savedNavScroll = 0;

function NavLinks({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    el.scrollTop = savedNavScroll;
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      onScroll={(e) => { savedNavScroll = (e.target as HTMLElement).scrollTop; }}
      className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3"
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.titleKey} className="mt-4 first:mt-0">
          {expanded && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">{t(group.titleKey)}</p>
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
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground/40",
                      !expanded && "h-11 w-11 sm:h-12 sm:w-12 justify-center px-0 mx-auto",
                    )}
                  >
                    <item.icon className={expanded ? "h-[18px] w-[18px] shrink-0 sm:h-6 sm:w-6" : "h-5 w-5 shrink-0 sm:h-6 sm:w-6"} />
                    {expanded && t(item.labelKey)}
                  </div>
                );
              }
              const hasChildren = !!item.children;
              const submenuOpen = openSubmenu === item.to;
              return (
                <div key={item.to}>
                  <div className="flex items-center">
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      title={!expanded ? t(item.labelKey) : undefined}
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors sm:text-base sm:py-3",
                        !expanded && "h-11 w-11 sm:h-12 sm:w-12 justify-center px-0 mx-auto",
                        active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      <item.icon className={expanded ? "h-[18px] w-[18px] shrink-0 sm:h-6 sm:w-6" : "h-5 w-5 shrink-0 sm:h-6 sm:w-6"} />
                      {expanded && t(item.labelKey)}
                    </Link>
                    {expanded && hasChildren && (
                      <button
                        onClick={() => setOpenSubmenu(submenuOpen ? null : item.to)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Toggle submenu"
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", submenuOpen && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  {expanded && hasChildren && submenuOpen && (
                    <div className="ms-6 mt-0.5 space-y-0.5 border-s border-border ps-3">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.to || pathname.startsWith(child.to + "/");
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={onNavigate}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              childActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                            )}
                          >
                            {t(child.labelKey)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
  const [expanded, setExpandedState] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("name")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRestaurantName(data.name);
      });
  }, [user]);

  const setExpanded = (v: boolean | ((prev: boolean) => boolean)) => {
    setExpandedState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      setSidebarExpandedGlobal(next);
      return next;
    });
  };

  const onLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop: always-visible collapsible vertical sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-40 hidden lg:flex flex-col bg-surface text-foreground border-e border-border transition-all duration-200",
          dir === "rtl" ? "right-0" : "left-0",
          expanded ? "w-80" : "w-20",
        )}
      >
        <div className="flex items-center justify-between px-3 py-4">
          {expanded && (
            <p className="truncate text-base font-extrabold">{restaurantName ?? "…"}</p>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground", !expanded && "mx-auto")}
            aria-label={t("sidebar.open")}
          >
            {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <NavLinks expanded={expanded} />

        <div className="border-t border-border px-3 py-2">
          <ThemeToggle expanded={expanded} />
        </div>

        <div className="border-t border-border px-3 py-4">
          {expanded && (
            <div className="mb-3">
              <p className="truncate text-sm font-semibold">{user?.email?.split("@")[0] ?? ""}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
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
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_QUICK_ITEMS.map((item) => {
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-muted-foreground"
          >
            <MenuIcon className="h-5 w-5" />
            {t("sidebar.more")}
          </button>
        </div>
      </nav>

      {/* Mobile: slide-out full menu, triggered by "Plus" */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div
            className={cn(
              "relative flex h-full w-72 flex-col bg-surface text-foreground shadow-xl",
              dir === "rtl" ? "ms-auto" : "",
            )}
          >
            <div className="flex items-center justify-between px-4 py-4">
              <p className="truncate text-base font-extrabold">{restaurantName ?? "…"}</p>
              <button onClick={() => setMobileMenuOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks expanded onNavigate={() => setMobileMenuOpen(false)} />
            <div className="border-t border-border px-4 py-2">
              <ThemeToggle expanded />
            </div>
            <div className="border-t border-border px-4 py-4">
              <p className="truncate text-sm font-semibold">{user?.email?.split("@")[0] ?? ""}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
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