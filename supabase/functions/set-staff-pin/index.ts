// ============================================================================
// Edge Function: set-staff-pin   (Verify JWT: ON — owner action)
// ----------------------------------------------------------------------------
// The OWNER sets/updates a staff member's 4-digit PIN. It also PROVISIONS the
// staff member's hidden auth user on first PIN (Plan A: staff log in by PIN, but
// under the hood each is a normal Supabase auth user so GoTrue can issue a real
// session). The staff never sees these credentials.
//
//   PIN:   bcrypt(pin) -> staff_pins.pin_hash  (verify)
//          HMAC-SHA256(`${restaurant_id}:${pin}`, STAFF_PIN_PEPPER) -> pin_fingerprint
//   User:  email    = `${staffId}@staff.menufy.app`   (deterministic, no mail sent)
//          password = HMAC-SHA256(`pw:${staffId}`, STAFF_AUTH_SECRET)  (derived)
//          team_members.user_id = the created auth user's id
//
// The email + password derivation MUST match staff-pin-login exactly.
//
// Env: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY injected.
//      You set: STAFF_PIN_PEPPER (already set) and STAFF_AUTH_SECRET (new).
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
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---- shared derivation contract (must equal staff-pin-login) ----
function staffEmail(staffId: string): string { return `${staffId}@staff.menufy.app`; }
function derivePassword(staffId: string, secret: string): Promise<string> {
  return hmacHex(`pw:${staffId}`, secret);
}

async function findUserIdByEmail(
  admin: ReturnType<typeof createClient>, email: string,
): Promise<string | null> {
  for (let page = 1; page <= 5; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    const u = data?.users?.find((x: { email?: string }) => x.email === email);
    if (u) return u.id;
    if (!data || data.users.length < 200) break;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Méthode non autorisée." });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PEPPER = Deno.env.get("STAFF_PIN_PEPPER");
    const AUTH_SECRET = Deno.env.get("STAFF_AUTH_SECRET");
    if (!PEPPER || !AUTH_SECRET) return json(500, { error: "Configuration serveur incomplète." });

    const { staffId, pin } = await req.json().catch(() => ({}));
    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return json(400, { error: "Le PIN doit contenir exactement 4 chiffres." });
    }
    if (typeof staffId !== "string" || !staffId) return json(400, { error: "Membre manquant." });

    // 1. identify the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Non autorisé." });
    const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userErr } = await asUser.auth.getUser();
    if (userErr || !user) return json(401, { error: "Session invalide." });

    // 2. service-role client
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 3. resolve staff -> restaurant, verify caller OWNS it
    const { data: staff } = await admin.from("team_members")
      .select("id, restaurant_id, user_id").eq("id", staffId).maybeSingle();
    if (!staff) return json(404, { error: "Membre introuvable." });
    const { data: owned } = await admin.from("restaurants")
      .select("id").eq("id", staff.restaurant_id).eq("owner_id", user.id).maybeSingle();
    if (!owned) return json(403, { error: "Seul le propriétaire peut définir un PIN." });

    // 4. provision the hidden auth user on first PIN (idempotent + SAFE).
    // Only trust an existing user_id if it points at a DEDICATED hidden staff
    // user (email @staff.menufy.app). Anything else (a legacy link from the old
    // team flow, e.g. a real Gmail or even the OWNER's account) is refused and
    // replaced with a fresh dedicated user — so a PIN can never map to a real
    // login account.
    const email = staffEmail(staffId);
    let userId: string | null = staff.user_id;

    if (userId) {
      const { data: linked } = await admin.auth.admin.getUserById(userId);
      const linkedEmail = linked?.user?.email ?? "";
      if (linkedEmail !== email) {
        userId = null; // foreign/legacy/dangling link — do NOT trust it
      }
    }

    if (!userId) {
      const password = await derivePassword(staffId, AUTH_SECRET);
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { staff_id: staffId, restaurant_id: staff.restaurant_id, kind: "pin_staff" },
      });
      if (cErr) {
        // recover only via our exact dedicated email (never a foreign account)
        userId = await findUserIdByEmail(admin, email);
        if (!userId) return json(500, { error: "Échec de provisionnement du compte." });
      } else if (created?.user?.email === email) {
        userId = created.user.id;
      } else {
        // defensive: createUser returned something unexpected — refuse to link
        return json(500, { error: "Provisionnement incohérent, annulé." });
      }
      await admin.from("team_members").update({ user_id: userId }).eq("id", staffId);
    }

    // 5. hash + restaurant-scoped fingerprint (formula must match staff-pin-login)
    const pin_hash = bcrypt.hashSync(pin, 10);
    const pin_fingerprint = await hmacHex(`${staff.restaurant_id}:${pin}`, PEPPER);

    // 6. upsert the PIN; unique (restaurant_id, pin_fingerprint) blocks dup PINs
    const { error: upErr } = await admin.from("staff_pins").upsert({
      staff_id: staff.id, restaurant_id: staff.restaurant_id,
      pin_hash, pin_fingerprint, updated_at: new Date().toISOString(),
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
