import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { AssistanceBell } from "@/components/assistance-bell";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export function DashboardPage({
  children,
  headerExtra,
}: {
  children: ReactNode;
  headerExtra?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl sm:ps-80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:max-w-6xl">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <AssistanceBell />
            <LangSwitch />
            {headerExtra}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:max-w-6xl sm:ps-80">
        {children}
      </main>

      <DashboardSidebar />
    </div>
  );
}