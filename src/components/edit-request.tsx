import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export interface EditableItem { id: string; name: string; price: number; qty: number }
export interface EditableOrder { id: string; total: number; items: EditableItem[] }

// Shared "Request edit" control for the cashier + waiter table cards. MVP =
// quantity changes on existing line items (incl. ->0 remove). The client only
// PROPOSES requested_changes; the DB (apply_approved_change_request) applies the
// approved edit server-side, recomputing the total from stored prices. Prices
// here are display-only. Available to all floor staff; only manager/owner approve.
export function EditRequestButton({
  orders,
  restaurantId,
  className,
}: {
  orders: EditableOrder[];
  restaurantId: string | null;
  className?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("wrong_item");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (orders.length === 0) return null;

  const selected = orders.find((o) => o.id === orderId) ?? null;

  const pick = (o: EditableOrder) => {
    setOrderId(o.id);
    setDraft(Object.fromEntries(o.items.map((it) => [it.id, it.qty])));
  };

  const start = () => {
    setReason("wrong_item");
    setNote("");
    if (orders.length === 1) pick(orders[0]);
    else { setOrderId(null); setDraft({}); }
    setOpen(true);
  };

  const setQty = (itemId: string, q: number) =>
    setDraft((d) => ({ ...d, [itemId]: Math.max(0, q) }));

  const changedLines = selected
    ? selected.items
        .filter((it) => (draft[it.id] ?? it.qty) !== it.qty)
        .map((it) => ({
          order_item_id: it.id,
          name: it.name,
          price: it.price,
          from: it.qty,
          to: draft[it.id] ?? it.qty,
        }))
    : [];

  const newTotal = selected
    ? selected.items.reduce((s, it) => s + it.price * (draft[it.id] ?? it.qty), 0)
    : 0;

  const submit = async () => {
    if (!restaurantId || !selected || changedLines.length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("order_change_requests").insert({
      restaurant_id: restaurantId,
      order_id: selected.id,
      action: "edit",
      requested_changes: { kind: "line_quantities", lines: changedLines },
      reason,
      note: note.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || t("edit.error")); // e.g. paid-order block / duplicate
      return;
    }
    toast.success(t("edit.requested"));
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={start}
        variant="outline"
        className={className ?? "h-10 w-full gap-1.5 text-sm font-semibold"}
      >
        <Pencil className="h-4 w-4" /> {t("edit.request")}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => { if (!busy) setOpen(false); }}
        >
          <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-background p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-extrabold">{t("edit.modalTitle")}</h2>

            {orders.length > 1 && !selected && (
              <>
                <label className="mt-4 block text-xs font-semibold text-muted-foreground">{t("cancel.pickOrder")}</label>
                <div className="mt-1 space-y-1.5">
                  {orders.map((o, i) => (
                    <button
                      key={o.id}
                      onClick={() => pick(o)}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                    >
                      <span>{t("cancel.order")} {i + 1} · {o.items.reduce((s, it) => s + it.qty, 0)} {t("cancel.items")}</span>
                      <span className="font-bold">{Number(o.total).toFixed(2)} DT</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {selected && (
              <>
                <div className="mt-4 space-y-2">
                  {selected.items.map((it) => {
                    const q = draft[it.id] ?? it.qty;
                    return (
                      <div
                        key={it.id}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                          q === 0 ? "border-destructive/40 bg-destructive/5 opacity-70" : "border-border bg-surface"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${q === 0 ? "line-through" : ""}`}>{it.name}</p>
                          <p className="text-xs text-muted-foreground">{Number(it.price).toFixed(2)} DT</p>
                        </div>
                        <button onClick={() => setQty(it.id, q - 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-muted"><Minus className="h-4 w-4" /></button>
                        <span className="w-6 text-center font-bold">{q}</span>
                        <button onClick={() => setQty(it.id, q + 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t("edit.newTotal")}</span>
                  <span className="font-extrabold">{newTotal.toFixed(2)} DT</span>
                </div>

                <label className="mt-4 block text-xs font-semibold text-muted-foreground">{t("approvals.reason")}</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
                >
                  <option value="wrong_item">{t("editReason.wrong_item")}</option>
                  <option value="customer_changed">{t("editReason.customer_changed")}</option>
                  <option value="out_of_stock">{t("editReason.out_of_stock")}</option>
                  <option value="other">{t("editReason.other")}</option>
                </select>

                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("waiter.note")} className="mt-3" />
              </>
            )}

            <div className="mt-4 flex gap-2">
              <Button onClick={submit} disabled={busy || !selected || changedLines.length === 0} className="h-11 flex-1 font-bold">
                {t("cashier.confirm")}
              </Button>
              <Button onClick={() => setOpen(false)} disabled={busy} variant="outline" className="h-11 flex-1 font-bold">
                {t("cashier.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
