import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Delete, Loader2 } from "lucide-react";

export const Route = createFileRoute("/pin")({ component: PinPad });

// landing_screen (from the role) -> app route
const LANDING_ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  waiter: "/cashier", // no dedicated waiter screen yet; the floor screen is /cashier
  cashier: "/cashier",
  kitchen: "/kitchen",
};
const DEVICE_KEY = "menufy_device_restaurant";

function PinPad() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [setupValue, setSetupValue] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // resolve the device's restaurant from ?restaurant=... (persisted) or storage
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("restaurant");
    const rid = fromQuery || localStorage.getItem(DEVICE_KEY);
    if (rid) {
      if (fromQuery) localStorage.setItem(DEVICE_KEY, fromQuery);
      setRestaurantId(rid);
    }
  }, []);

  const submit = async (code: string) => {
    if (!restaurantId) return;
    setBusy(true);
    setError(null);
    const { data, error: fnErr } = await supabase.functions.invoke("staff-pin-login", {
      body: { restaurantId, pin: code },
    });
    if (fnErr) {
      let msg = "PIN incorrect";
      try {
        const b = await (fnErr as any).context?.json?.();
        if (b?.error) msg = b.error;
      } catch { /* ignore */ }
      setError(msg);
      setPin("");
      setBusy(false);
      return;
    }
    const sess = data as {
      access_token: string; refresh_token: string;
      landing_screen?: string; staff_role?: string;
    };
    const { error: setErr } = await supabase.auth.setSession({
      access_token: sess.access_token,
      refresh_token: sess.refresh_token,
    });
    if (setErr) {
      setError("Impossible d'ouvrir la session.");
      setPin("");
      setBusy(false);
      return;
    }
    const dest =
      LANDING_ROUTES[sess.landing_screen ?? ""] ??
      LANDING_ROUTES[sess.staff_role ?? ""] ??
      "/dashboard";
    // hard navigation so all auth-dependent state re-reads under the new session
    window.location.href = dest;
  };

  const press = (d: string) => {
    if (busy) return;
    setError(null);
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) submit(next);
  };
  const backspace = () => { if (!busy) setPin((p) => p.slice(0, -1)); };

  // ---- device not configured yet ----
  if (!restaurantId) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-extrabold">Configurer l'appareil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Collez l'identifiant du restaurant pour lier cette tablette.
          </p>
          <Input
            value={setupValue}
            onChange={(e) => setSetupValue(e.target.value)}
            placeholder="restaurant_id (UUID)"
            className="mt-4"
          />
          <Button
            className="mt-3 w-full"
            disabled={!setupValue.trim()}
            onClick={() => {
              const v = setupValue.trim();
              localStorage.setItem(DEVICE_KEY, v);
              setRestaurantId(v);
            }}
          >
            Lier cet appareil
          </Button>
        </div>
      </div>
    );
  }

  // ---- PIN pad ----
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-2xl font-extrabold">Entrez votre PIN</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personnel · code à 4 chiffres</p>

        {/* dots */}
        <div className="mt-6 flex justify-center gap-3" aria-live="polite">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-colors ${
                i < pin.length ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        <div className="mt-3 h-5 text-sm font-medium text-destructive">
          {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" /> : error}
        </div>

        {/* keypad */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              disabled={busy}
              className="h-16 rounded-2xl bg-muted text-2xl font-bold text-foreground active:scale-95 transition-transform disabled:opacity-50"
            >
              {k}
            </button>
          ))}
          <div />
          <button
            onClick={() => press("0")}
            disabled={busy}
            className="h-16 rounded-2xl bg-muted text-2xl font-bold text-foreground active:scale-95 transition-transform disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={backspace}
            disabled={busy || pin.length === 0}
            className="h-16 rounded-2xl grid place-items-center text-muted-foreground active:scale-95 transition-transform disabled:opacity-30"
            aria-label="Effacer"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
