import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";

export const Route = createFileRoute("/menu/$restaurantId/$tableNumber")({
  head: () => ({
    meta: [
      { title: "Menu — Menufy" },
      { name: "description", content: "Commandez directement depuis votre table." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { restaurantId, tableNumber } = Route.useParams();
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-4">
        <Logo size="sm" />
        <LangSwitch />
      </header>
      <main className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Table {tableNumber}</p>
        <h1 className="mt-2 text-2xl font-extrabold">Menu client</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Cette page sera disponible en Phase 2 — flux de commande client.
        </p>
        <p className="mt-6 text-xs text-muted-foreground/60">restaurantId: <span className="font-mono">{restaurantId.slice(0, 8)}…</span></p>
      </main>
    </div>
  );
}
