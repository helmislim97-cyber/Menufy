import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/lang-switch";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, QrCode, ExternalLink, Download } from "lucide-react";
import { AssistanceBell } from "@/components/assistance-bell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/tables")({
  component: TablesPage,
});

interface RestaurantTable {
  id: string;
  number: number;
  is_active: boolean;
}

function TablesPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [adding, setAdding] = useState(false);
  const [qrTable, setQrTable] = useState<RestaurantTable | null>(null);

  const loadTables = async (rid: string) => {
    const { data } = await supabase
      .from("tables")
      .select("id, number, is_active")
      .eq("restaurant_id", rid)
      .order("number");
    setTables(data ?? []);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          setRestaurantId(data.id);
          await loadTables(data.id);
        }
        setLoading(false);
      });
  }, [user]);

  const addTable = async () => {
    if (!restaurantId) return;
    const num = parseInt(newTableNumber, 10);
    if (!num || num <= 0) return;
    setAdding(true);
    const { error } = await supabase.from("tables").insert({ restaurant_id: restaurantId, number: num });
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.tableAdded"));
    setNewTableNumber("");
    loadTables(restaurantId);
  };

  const toggleTable = async (table: RestaurantTable) => {
    setTables((prev) => prev.map((tb) => (tb.id === table.id ? { ...tb, is_active: !tb.is_active } : tb)));
    await supabase.from("tables").update({ is_active: !table.is_active }).eq("id", table.id);
  };

  const deleteTable = async (table: RestaurantTable) => {
    if (!restaurantId) return;
    if (!window.confirm(t("settings.confirmDeleteTable"))) return;
    const { error } = await supabase.from("tables").delete().eq("id", table.id);
    if (error) return toast.error(error.message);
    toast.success(t("settings.tableDeleted"));
    loadTables(restaurantId);
  };

  const menuUrl = (tableNumber: number) =>
    `${window.location.origin}/menu/${restaurantId}/${tableNumber}`;

  const qrImageUrl = (tableNumber: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(menuUrl(tableNumber) + "?qr=1")}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl sm:ps-80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:max-w-6xl">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <AssistanceBell />
            <LangSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:max-w-6xl sm:ps-80">
        <h1 className="text-2xl font-extrabold">{t("settings.tables")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.tablesSubtitle")}</p>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
        ) : !restaurantId ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.noRestaurant")}</p>
        ) : (
          <section className="mt-6">
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder={t("settings.tableNumberPlaceholder")}
                className="max-w-[140px]"
              />
              <Button onClick={addTable} disabled={adding || !newTableNumber} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t("settings.addTable")}
              </Button>
            </div>

            {tables.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-border bg-surface/40 p-4 text-center text-sm text-muted-foreground">
                {t("settings.noTables")}
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {tables.map((table) => (
                  <div key={table.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-sm font-extrabold">
                      {table.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">
                        {t("settings.table")} {table.number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {table.is_active ? t("settings.active") : t("settings.inactive")}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setQrTable(table)} className="gap-1.5">
                      <QrCode className="h-3.5 w-3.5" />
                      {t("settings.viewQr")}
                    </Button>
                    <Switch checked={table.is_active} onCheckedChange={() => toggleTable(table)} />
                    <button
                      onClick={() => deleteTable(table)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <DashboardSidebar />

      <Dialog open={!!qrTable} onOpenChange={(open) => !open && setQrTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("settings.qrTitle")} — {t("settings.table")} {qrTable?.number}
            </DialogTitle>
          </DialogHeader>
          {qrTable && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={qrImageUrl(qrTable.number)}
                alt={`QR table ${qrTable.number}`}
                className="h-64 w-64 rounded-xl border border-border bg-white p-2"
              />
              <p className="text-center text-xs text-muted-foreground">{t("settings.qrHint")}</p>
              <p className="break-all rounded-lg bg-surface px-3 py-2 text-center text-xs text-muted-foreground">
                {menuUrl(qrTable.number)}
              </p>
            </div>
          )}
          <DialogFooter className="flex-row gap-2 sm:justify-center">
            {qrTable && (
              <>
                <a href={menuUrl(qrTable.number) + "?qr=1"} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="gap-1.5">
                    <ExternalLink className="h-4 w-4" />
                    {t("settings.openLink")}
                  </Button>
                </a>
                <a href={qrImageUrl(qrTable.number)} target="_blank" rel="noreferrer" download={`table-${qrTable.number}-qr.png`}>
                  <Button className="gap-1.5">
                    <Download className="h-4 w-4" />
                    {t("settings.downloadQr")}
                  </Button>
                </a>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}