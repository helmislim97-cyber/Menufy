import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, QrCode, ExternalLink, Download, Pencil, GripVertical } from "lucide-react";
import { DashboardPage } from "@/components/dashboard-page";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/_authenticated/dashboard/tables")({
  component: TablesPage,
});

interface RestaurantTable {
  id: string;
  number: number;
  is_active: boolean;
  zone_id: string | null;
}

interface TableZone {
  id: string;
  name: string;
  position: number;
}

const UNZONED = "__unzoned__";

function SortableTableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex min-w-0 items-center gap-2">
      <button {...attributes} {...listeners} className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-muted-foreground active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function TablesPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [zones, setZones] = useState<TableZone[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableZone, setNewTableZone] = useState<string>(UNZONED);
  const [adding, setAdding] = useState(false);
  const [qrTable, setQrTable] = useState<RestaurantTable | null>(null);

  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<TableZone | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [savingZone, setSavingZone] = useState(false);

  const loadData = async (rid: string) => {
    const [{ data: tbls }, { data: zns }] = await Promise.all([
      supabase.from("tables").select("id, number, is_active, zone_id").eq("restaurant_id", rid).order("number"),
      supabase.from("table_zones").select("id, name, position").eq("restaurant_id", rid).order("position"),
    ]);
    setTables(tbls ?? []);
    setZones(zns ?? []);
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
          await loadData(data.id);
        }
        setLoading(false);
      });
  }, [user]);

  const addTable = async () => {
    if (!restaurantId) return;
    const num = parseInt(newTableNumber, 10);
    if (!num || num <= 0) return;
    setAdding(true);
    const { error } = await supabase.from("tables").insert({
      restaurant_id: restaurantId,
      number: num,
      zone_id: newTableZone === UNZONED ? null : newTableZone,
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    toast.success(t("settings.tableAdded"));
    setNewTableNumber("");
    loadData(restaurantId);
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
    loadData(restaurantId);
  };

  const openNewZone = () => {
    setEditingZone(null);
    setZoneName("");
    setZoneDialogOpen(true);
  };

  const openEditZone = (z: TableZone) => {
    setEditingZone(z);
    setZoneName(z.name);
    setZoneDialogOpen(true);
  };

  const saveZone = async () => {
    if (!restaurantId || !zoneName.trim()) return;
    setSavingZone(true);
    if (editingZone) {
      const { error } = await supabase.from("table_zones").update({ name: zoneName.trim() }).eq("id", editingZone.id);
      setSavingZone(false);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase
        .from("table_zones")
        .insert({ restaurant_id: restaurantId, name: zoneName.trim(), position: zones.length });
      setSavingZone(false);
      if (error) return toast.error(error.message);
    }
    setZoneDialogOpen(false);
    loadData(restaurantId);
  };

  const deleteZone = async (zoneId: string) => {
    if (!restaurantId) return;
    if (!window.confirm(t("settings.confirmDeleteZone"))) return;
    const { error } = await supabase.from("table_zones").delete().eq("id", zoneId);
    if (error) return toast.error(error.message);
    loadData(restaurantId);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleTableDragEnd = async (groupTables: RestaurantTable[], event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = groupTables.findIndex((tb) => tb.id === active.id);
    const newIndex = groupTables.findIndex((tb) => tb.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(groupTables, oldIndex, newIndex);
    const reorderedIds = reordered.map((tb) => tb.id);
    setTables((prev) => {
      const others = prev.filter((tb) => !reorderedIds.includes(tb.id));
      return [...others, ...reordered];
    });
  };

  const moveTableToZone = async (table: RestaurantTable, zoneId: string | null) => {
    setTables((prev) => prev.map((tb) => (tb.id === table.id ? { ...tb, zone_id: zoneId } : tb)));
    await supabase.from("tables").update({ zone_id: zoneId }).eq("id", table.id);
  };

  const menuUrl = (tableNumber: number) => `${window.location.origin}/menu/${restaurantId}/${tableNumber}`;
  const qrImageUrl = (tableNumber: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(menuUrl(tableNumber) + "?qr=1")}`;

  const groups: { id: string; name: string; tables: RestaurantTable[] }[] = [
    ...zones.map((z) => ({ id: z.id, name: z.name, tables: tables.filter((tb) => tb.zone_id === z.id) })),
    { id: UNZONED, name: t("settings.unzoned"), tables: tables.filter((tb) => tb.zone_id === null) },
  ];

  return (
    <DashboardPage>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{t("settings.tables")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("settings.tablesSubtitle")}</p>
        </div>
        <Button onClick={openNewZone} size="sm" variant="outline" className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          {t("settings.addZone")}
        </Button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
      ) : !restaurantId ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.noRestaurant")}</p>
      ) : (
        <>
          <section className="mt-6 rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold">{t("settings.addTable")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder={t("settings.tableNumberPlaceholder")}
                className="max-w-[140px]"
              />
              <Select value={newTableZone} onValueChange={setNewTableZone}>
                <SelectTrigger className="w-auto min-w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNZONED}>{t("settings.unzoned")}</SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addTable} disabled={adding || !newTableNumber} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t("settings.addTable")}
              </Button>
            </div>
          </section>

          <div className="mt-6 space-y-6">
            {groups.map((group) => {
              if (group.id === UNZONED && group.tables.length === 0) return null;
              const zone = zones.find((z) => z.id === group.id);
              return (
                <div key={group.id} className="rounded-2xl border border-border bg-surface/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold">{group.name}</h2>
                      <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        {group.tables.length}
                      </span>
                    </div>
                    {zone && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditZone(zone)}
                          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteZone(zone.id)}
                          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {group.tables.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-background/60 p-4 text-center text-sm text-muted-foreground">
                      {t("settings.noTables")}
                    </p>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleTableDragEnd(group.tables, e)}>
                      <SortableContext items={group.tables.map((tb) => tb.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {group.tables.map((table) => (
                            <SortableTableRow key={table.id} id={table.id}>
                              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-nowrap">
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background text-sm font-extrabold">
                                  {table.number}
                                </div>
                                <div className="min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-0">
                                  <p className="text-sm font-bold">
                                    {t("settings.table")} {table.number}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {table.is_active ? t("settings.active") : t("settings.inactive")}
                                  </p>
                                </div>
                                <div className="ms-auto flex w-full items-center justify-end gap-2 sm:ms-0 sm:w-auto">
                                  <Select value={table.zone_id ?? UNZONED} onValueChange={(v) => moveTableToZone(table, v === UNZONED ? null : v)}>
                                    <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={UNZONED}>{t("settings.unzoned")}</SelectItem>
                                      {zones.map((z) => (
                                        <SelectItem key={z.id} value={z.id}>
                                          {z.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                              </div>
                            </SortableTableRow>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

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

      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZone ? t("settings.editZone") : t("settings.addZone")}</DialogTitle>
          </DialogHeader>
          <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder={t("settings.zoneNamePlaceholder")} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoneDialogOpen(false)}>
              {t("menu.cancel")}
            </Button>
            <Button onClick={saveZone} disabled={savingZone || !zoneName.trim()}>
              {t("menu.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardPage>
  );
}