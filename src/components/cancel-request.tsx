import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban } from "lucide-react";
import { toast } from "sonner";

// One active order eligible for a cancel request.
export interface CancelOrder {
  id: string;
  total: number;
  createdAt?: string | null;
  itemCount: number;
}

function timeShort(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Shared "Request cancellation" control for the cashier + waiter table cards.
// A cancel request targets ONE order; when a table holds several, the modal
// shows a picker. The client sends minimal data — trg_ocr_stamp_creator stamps
// requested_by from the session, and ocr_one_open_cancel_per_order (DB index)
// blocks a concurrent duplicate. Available to any floor staff (not markPaid-
// gated): a waiter or cashier noticing a mistake can request; only a
// manager/owner approves (M7).
export function CancelRequestButton({
  orders,
  restaurantId,
  className,
}: {
  orders: CancelOrder[];
  restaurantId: string | null;
  className?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("wrong_order");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (orders.length === 0) return null;

  const start = () => {
    setSelected(orders.length === 1 ? orders[0].id : null);
    setReason("wrong_order");
    setNote("");
    setOpen(true);
  };

  const submit = async () => {
    if (!restaurantId || !selected) return;
    setBusy(true);
    const { error } = await supabase.from("order_change_requests").insert({
      restaurant_id: restaurantId,
      order_id: selected,
      action: "cancel",
      reason,
      note: note.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || t("cancel.error")); // e.g. duplicate blocked by the index
      return;
    }
    toast.success(t("cancel.requested"));
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={start}
        variant="outline"
        className={className ?? "h-10 w-full gap-1.5 text-sm font-semibold"}
      >
        <Ban className="h-4 w-4" /> {t("cancel.request")}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => { if (!busy) setOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-extrabold">{t("cancel.modalTitle")}</h2>

            {orders.length > 1 && (
              <>
                <label className="mt-4 block text-xs font-semibold text-muted-foreground">{t("cancel.pickOrder")}</label>
                <div className="mt-1 space-y-1.5">
                  {orders.map((o, i) => (
                    <button
                      key={o.id}
                      onClick={() => setSelected(o.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                        selected === o.id ? "border-primary bg-primary/5" : "border-border bg-surface"
                      }`}
                    >
                      <span>
                        {t("cancel.order")} {i + 1}
                        {o.createdAt ? ` · ${timeShort(o.createdAt)}` : ""} · {o.itemCount} {t("cancel.items")}
                      </span>
                      <span className="font-bold">{Number(o.total).toFixed(2)} DT</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <label className="mt-4 block text-xs font-semibold text-muted-foreground">{t("approvals.reason")}</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
            >
              <option value="wrong_order">{t("cancelReason.wrong_order")}</option>
              <option value="customer_left">{t("cancelReason.customer_left")}</option>
              <option value="duplicate">{t("cancelReason.duplicate")}</option>
              <option value="out_of_stock">{t("cancelReason.out_of_stock")}</option>
              <option value="other">{t("cancelReason.other")}</option>
            </select>

            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("waiter.note")}
              className="mt-3"
            />

            <div className="mt-4 flex gap-2">
              <Button onClick={submit} disabled={busy || !selected} className="h-11 flex-1 font-bold">
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
