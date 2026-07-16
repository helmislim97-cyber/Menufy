import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { RestaurantAccess } from "@/hooks/use-restaurant-access";

// Shared staff-device session behaviour for the operational screens
// (cashier / waiter / kitchen):
//   * endSession() — sign the staff out and return to the PIN pad.
//   * exit()       — header action: owners -> dashboard; staff -> end session.
//   * idle timeout — PER ROLE, because devices are used differently:
//       waiter  -> 60s  (shared + mobile: tap in, fire an order, walk away —
//                        a short timeout protects order/payment attribution)
//       cashier -> off  (dedicated fixed station, one person, low risk)
//       kitchen -> off  (always-on display of the queue)
//       manager -> off
//     0 = no auto-logout. Owners are never auto-logged-out.
//
// Future: pass `idleSecondsByRole` loaded from restaurant_settings so an owner
// can tune these per restaurant — no change needed here beyond the prop.
const DEFAULT_IDLE_SECONDS: Record<string, number> = {
  waiter: 60,
  cashier: 0,
  kitchen: 0,
  manager: 0,
  owner: 0,
};

export function useStaffSession(
  access: RestaurantAccess,
  opts?: { idleSecondsByRole?: Record<string, number> },
) {
  const navigate = useNavigate();
  const table = opts?.idleSecondsByRole ?? DEFAULT_IDLE_SECONDS;

  // Most-restrictive (smallest non-zero) timeout among the staff's roles, so a
  // waiter-who-is-also-cashier still gets the short waiter timeout. 0 = off.
  const idleSeconds = useMemo(() => {
    const candidates = access.roles.map((r) => table[r] ?? 0).filter((s) => s > 0);
    return candidates.length ? Math.min(...candidates) : 0;
  }, [access.roles, table]);

  const endSession = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    window.location.href = "/pin"; // hard nav so all auth state is dropped
  }, []);

  const exit = useCallback(() => {
    if (access.isOwner) navigate({ to: "/dashboard/orders" });
    else endSession();
  }, [access.isOwner, navigate, endSession]);

  useEffect(() => {
    if (access.loading || access.isOwner || idleSeconds <= 0) return; // no timer
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { endSession(); }, idleSeconds * 1000);
    };
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [access.loading, access.isOwner, idleSeconds, endSession]);

  return { exit, endSession };
}
