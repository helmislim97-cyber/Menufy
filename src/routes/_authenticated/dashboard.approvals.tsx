import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurantAccess } from "@/hooks/use-restaurant-access";
import { useI18n } from "@/lib/i18n";
import { DashboardPage } from "@/components/dashboard-page";
import { Button } from "@/components/ui/button";
import { Check, X, ClipboardCheck, Clock, Ban, Pencil, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/approvals")({
  component: ApprovalsPage,
});

type Action = "cancel" | "edit" | "void_payment";

interface ChangeRequest {
  id: string;
  action: Action;
  reason: string | null;
  note: string | null;
  requested_by_name: string | null;
  requested_by_role: string | null;
  created_at: string;
  order_id: string;
  payment_id: string | null;
}
interface OrderCtx { id: string; table_number: number | null; total: number }
interface PaymentCtx { id: string; amount_due: number; method: string }

const ACTION_ICON: Record<Action, typeof Ban> = {
  cancel: Ban,
  edit: Pencil,
  void_payment: Wallet,
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "0 min";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h`;
}

function ApprovalsPage() {
  const { t } = useI18n();
  const access = useRestaurantAccess();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [orders, setOrders] = useState<Record<string, OrderCtx>>({});
  const [payments, setPayments] = useState<Record<string, PaymentCtx>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async (rid: string) => {
    const { data } = await supabase
      .from("order_change_requests")
      .select("id, action, reason, note, requested_by_name, requested_by_role, created_at, order_id, payment_id")
      .eq("restaurant_id", rid)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    const list = (data as ChangeRequest[]) ?? [];
    setRequests(list);

    // Pull order + payment context in two id-scoped queries (robust to the
    // composite FK; no reliance on PostgREST embed detection).
    const orderIds = [...new Set(list.map((r) => r.order_id).filter(Boolean))];
    const paymentIds = [...new Set(list.map((r) => r.payment_id).filter(Boolean) as string[])];
    const [ord, pay] = await Promise.all([
      orderIds.length
        ? supabase.from("orders").select("id, table_number, total").in("id", orderIds)
        : Promise.resolve({ data: [] as OrderCtx[] }),
      paymentIds.length
        ? supabase.from("payments").select("id, amount_due, method").in("id", paymentIds)
        : Promise.resolve({ data: [] as PaymentCtx[] }),
    ]);
    setOrders(Object.fromEntries(((ord.data as OrderCtx[]) ?? []).map((o) => [o.id, o])));
    setPayments(Object.fromEntries(((pay.data as PaymentCtx[]) ?? []).map((p) => [p.id, p])));
    setLoading(false);
  };

  useEffect(() => {
    if (access.loading || !access.restaurantId) return;
    load(access.restaurantId);
  }, [access.loading, access.restaurantId]);

  // Realtime: the queue updates live as requests are raised or decided.
  useEffect(() => {
    if (!access.restaurantId) return;
    const rid = access.restaurantId;
    const ch = supabase
      .channel(`approvals-${rid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_change_requests", filter: `restaurant_id=eq.${rid}` },
        () => load(rid),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [access.restaurantId]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    // The client only sends the new status. decide_change_request() stamps the
    // decider from the session and RAISES on self-approval; apply_approved_
    // change_request() then executes (e.g. voids the payment via M6).
    const { error } = await supabase.from("order_change_requests").update({ status }).eq("id", id);
    setBusy(null);
    if (error) {
      toast.error(error.message || t("approvals.error")); // e.g. self-approval block
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success(status === "approved" ? t("approvals.approved") : t("approvals.rejected"));
  };

  return (
    <DashboardPage>
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold">{t("approvals.title")}</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t("approvals.subtitle")}</p>

      {access.loading || loading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">{t("menu.loading")}</p>
      ) : requests.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 py-10">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-surface text-muted-foreground">
            <ClipboardCheck className="h-8 w-8" />
          </div>
          <p className="text-sm text-muted-foreground">{t("approvals.empty")}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {requests.map((r) => {
            const order = orders[r.order_id];
            const payment = r.payment_id ? payments[r.payment_id] : null;
            const Icon = ACTION_ICON[r.action];
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      <Icon className="h-3.5 w-3.5" />
                      {t(`approvals.action.${r.action}`)}
                    </span>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">{t("approvals.table")} {order?.table_number ?? "—"}</span>
                      {payment ? (
                        <span className="text-muted-foreground"> · {t("approvals.amount")} {Number(payment.amount_due).toFixed(2)} DT ({payment.method})</span>
                      ) : order ? (
                        <span className="text-muted-foreground"> · {Number(order.total).toFixed(2)} DT</span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("approvals.requestedBy")} {r.requested_by_name ?? "—"}
                      {r.requested_by_role ? ` (${r.requested_by_role})` : ""}
                    </p>
                    {r.reason && <p className="mt-1 text-xs text-muted-foreground">{t("approvals.reason")}: {r.reason}</p>}
                    {r.note && <p className="mt-0.5 text-xs text-muted-foreground">{t("approvals.note")}: {r.note}</p>}
                  </div>
                  <span className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {timeAgo(r.created_at)}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => decide(r.id, "approved")}
                    disabled={busy === r.id}
                    className="h-10 flex-1 gap-1.5 font-bold"
                  >
                    <Check className="h-4 w-4" /> {t("approvals.approve")}
                  </Button>
                  <Button
                    onClick={() => decide(r.id, "rejected")}
                    disabled={busy === r.id}
                    variant="outline"
                    className="h-10 flex-1 gap-1.5 font-bold"
                  >
                    <X className="h-4 w-4" /> {t("approvals.reject")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardPage>
  );
}
