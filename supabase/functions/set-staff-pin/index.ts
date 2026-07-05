// ============================================================================
// Edge Function: set-staff-pin
// ----------------------------------------------------------------------------
// The OWNER sets/updates a staff member's 4-digit PIN.
//   * bcrypt(pin)                                 -> staff_pins.pin_hash (verify)
//   * HMAC-SHA256(`${restaurant_id}:${pin}`, PEPPER) -> staff_pins.pin_fingerprint
//     Restaurant-scoped on purpose: the same PIN in different restaurants yields
//     different fingerprints (no cross-restaurant correlation / precompute).
// The pepper is a server-only secret (STAFF_PIN_PEPPER), never in the DB/client.
//
// FINGERPRINT FORMULA CONTRACT — staff-pin-login (2b) MUST compute it identically:
//     hmacHex(`${restaurant_id}:${pin}`, STAFF_PIN_PEPPER)
// or logins will never match. The login device supplies the restaurant_id.
//
// Auth: caller is identified from their JWT; the write only proceeds if that
// caller OWNS the restaurant the staff member belongs to. The privileged write
// uses the service-role key (staff_pins is service-role-only), so the bcrypt
// hash never touches the browser.
//
// Env (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by Supabase — do NOT set them yourself). You set STAFF_PIN_PEPPER.
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Méthode non autorisée." });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PEPPER = Deno.env.get("STAFF_PIN_PEPPER");
    if (!PEPPER) return json(500, { error: "Configuration serveur incomplète (pepper manquant)." });

    const { staffId, pin } = await req.json().catch(() => ({}));
    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return json(400, { error: "Le PIN doit contenir exactement 4 chiffres." });
    }
    if (typeof staffId !== "string" || !staffId) {
      return json(400, { error: "Membre manquant." });
    }

    // 1. identify the caller from their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Non autorisé." });
    const asUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await asUser.auth.getUser();
    if (userErr || !user) return json(401, { error: "Session invalide." });

    // 2. service-role client for the privileged work
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 3. resolve the staff member -> restaurant, and verify the caller OWNS it
    const { data: staff } = await admin
      .from("team_members").select("id, restaurant_id").eq("id", staffId).maybeSingle();
    if (!staff) return json(404, { error: "Membre introuvable." });

    const { data: owned } = await admin
      .from("restaurants").select("id")
      .eq("id", staff.restaurant_id).eq("owner_id", user.id).maybeSingle();
    if (!owned) return json(403, { error: "Seul le propriétaire peut définir un PIN." });

    // 4. hash + restaurant-scoped fingerprint (formula must match staff-pin-login)
    const pin_hash = bcrypt.hashSync(pin, 10);
    const pin_fingerprint = await hmacHex(`${staff.restaurant_id}:${pin}`, PEPPER);

    // 5. upsert (one row per staff); the unique (restaurant_id, pin_fingerprint)
    //    index blocks two staff in the same restaurant sharing a PIN.
    const { error: upErr } = await admin.from("staff_pins").upsert({
      staff_id: staff.id,
      restaurant_id: staff.restaurant_id,
      pin_hash,
      pin_fingerprint,
      updated_at: new Date().toISOString(),
    }, { onConflict: "staff_id" });

    if (upErr) {
      if ((upErr as { code?: string }).code === "23505") {
        return json(409, { error: "Ce PIN est déjà utilisé par un autre membre." });
      }
      return json(500, { error: "Échec de l'enregistrement du PIN." });
    }

    return json(200, { ok: true });
  } catch (_e) {
    return json(500, { error: "Erreur serveur." });
  }
});
