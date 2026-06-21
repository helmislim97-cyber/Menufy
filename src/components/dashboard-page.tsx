import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { AssistanceBell } from "@/components/assistance-bell";
import { DashboardSidebar, useSidebarExpanded } from "@/components/dashboard-sidebar";

export function DashboardPage({
  children,
  headerExtra,
}: {
  children: ReactNode;
  headerExtra?: ReactNode;
}) {
  const expanded = useSidebarExpanded();
  const sidebarPad = expanded ? "lg:ps-80" : "lg:ps-20";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl ${sidebarPad}`}>
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 lg:max-w-6xl">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <AssistanceBell />
            <LangSwitch />
            {headerExtra}
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-3xl px-4 py-6 lg:max-w-6xl ${sidebarPad}`}>
        {children}
      </main>

      <DashboardSidebar />
    </div>
  );
}