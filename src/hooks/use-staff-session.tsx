import { useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { RestaurantAccess } from "@/hooks/use-restaurant-access";

// Shared staff-device session behaviour for the operational screens
// (cashier / waiter / kitchen):
//   * endSession() — sign the staff out and return to the PIN pad, so the next
//     staff member can log in on a shared device.
//   * exit()       — the header "exit" action: owners go back to the dashboard;
//     staff end their session (switch user).
//   * idle timeout — staff only: after `idleMinutes` of no interaction, the
//     session is dropped back to the PIN pad. Owners are never auto-logged-out.
//
// Pass the screen's existing `useRestaurantAccess()` result so we don't resolve
// access twice.
export function useStaffSession(
  access: RestaurantAccess,
  opts?: { idleMinutes?: number },
) {
  const navigate = useNavigate();
  // TEMP (idle-timeout verification): 20 seconds. RESTORE the 5-minute line below.
  const idleMs = 20_000;
  // const idleMs = (opts?.idleMinutes ?? 5) * 60 * 1000;

  const endSession = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    // hard nav so all auth state is dropped and /pin loads clean
    window.location.href = "/pin";
  }, []);

  const exit = useCallback(() => {
    if (access.isOwner) navigate({ to: "/dashboard/orders" });
    else endSession();
  }, [access.isOwner, navigate, endSession]);

  useEffect(() => {
    if (access.loading || access.isOwner) return; // staff sessions only
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { endSession(); }, idleMs);
    };
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [access.loading, access.isOwner, idleMs, endSession]);

  return { exit, endSession };
}
