// ============================================================================
// Edge Function: staff-pin-login   (Verify JWT: OFF — pre-session endpoint)
// ----------------------------------------------------------------------------
// A device sends { restaurantId, pin }. We:
//   1. enforce a per-(restaurant,bucket) lockout (brute-force protection);
//   2. compute the SAME fingerprint as set-staff-pin —
//        hmacHex(`${restaurantId}:${pin}`, STAFF_PIN_PEPPER)
//      — and look up staff_pins by (restaurant_id, pin_fingerprint) [O(1)];
//   3. bcrypt.compare(pin, pin_hash) to verify;
//   4. on success, mint a SHORT-LIVED HS256 JWT (signed with PROJECT_JWT_SECRET,
//      the project's JWT secret) carrying role=authenticated + restaurant_id /
//      staff_id / staff_role, which PostgREST accepts and the M3 RLS helpers read.
//
// Never reveals which part failed: unknown staff and wrong PIN both return the
// same generic "PIN incorrect." A correct-but-suspended account is the only
// distinct case (only reachable AFTER a correct PIN).
//
// Env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY injected automatically.
//      You set: STAFF_PIN_PEPPER (already set for set-staff-pin) and
//      PROJECT_JWT_SECRET (Dashboard → Settings → API → JWT Secret).
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";
import { SignJWT } from "https://esm.sh/jose@5.9.6";

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

// A well-formed bcrypt hash used for a dummy compare when no staff matches, so
// the response time doesn't reveal whether a PIN exists.
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;   // failures counted within a 15-min window
const LOCKOUT_MS = 5 * 60 * 1000;   // lock for 5 min once MAX_FAILS is hit
const TOKEN_TTL = "30m";            // short-lived session

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Méthode non autorisée." });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const PEPPER = Deno.env.get("STAFF_PIN_PEPPER");
    const JWT_SECRET = Deno.env.get("PROJECT_JWT_SECRET");
    if (!PEPPER || !JWT_SECRET) return json(500, { error: "Configuration serveur incomplète." });

    const { restaurantId, pin } = await req.json().catch(() => ({}));
    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return json(400, { error: "PIN invalide." });
    }
    if (typeof restaurantId !== "string" || !restaurantId) {
      return json(400, { error: "Restaurant manquant." });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const bucket = restaurantId; // TEST: per-restaurant. Real: per-device id.
    const now = Date.now();

    // 1. lockout gate
    const { data: att } = await admin.from("pin_login_attempts")
      .select("fail_count, first_fail_at, locked_until")
      .eq("restaurant_id", restaurantId).eq("bucket", bucket).maybeSingle();
    if (att?.locked_until && new Date(att.locked_until).getTime() > now) {
      return json(429, { error: "Trop de tentatives. Réessayez dans quelques minutes." });
    }

    // 2. fingerprint lookup (same formula as set-staff-pin)
    const fp = await hmacHex(`${restaurantId}:${pin}`, PEPPER);
    const { data: pinRow } = await admin.from("staff_pins")
      .select("staff_id, pin_hash")
      .eq("restaurant_id", restaurantId).eq("pin_fingerprint", fp).maybeSingle();

    // 3. verify (always run a bcrypt compare to avoid a timing signal)
    const ok = pinRow
      ? bcrypt.compareSync(pin, pinRow.pin_hash)
      : (bcrypt.compareSync(pin, DUMMY_HASH), false);

    if (!ok) {
      const locked = await registerFailure(admin, restaurantId, bucket, att, now);
      return locked
        ? json(429, { error: "Trop de tentatives. Réessayez dans quelques minutes." })
        : json(401, { error: "PIN incorrect." });
    }

    // 4. correct PIN — check the member is active, then reset the counter
    const { data: staff } = await admin.from("team_members")
      .select("status, role_id").eq("id", pinRow!.staff_id).maybeSingle();
    if (!staff || staff.status !== "active") {
      return json(403, { error: "Ce compte est suspendu." });
    }

    await admin.from("pin_login_attempts").upsert({
      restaurant_id: restaurantId, bucket,
      fail_count: 0, first_fail_at: null, locked_until: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "restaurant_id,bucket" });

    let staffRole: string | null = null;
    if (staff.role_id) {
      const { data: role } = await admin.from("roles").select("key").eq("id", staff.role_id).maybeSingle();
      staffRole = role?.key ?? null;
    }

    // 5. mint the short-lived session JWT
    const token = await new SignJWT({
      role: "authenticated",
      restaurant_id: restaurantId,
      staff_id: pinRow!.staff_id,
      staff_role: staffRole,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(pinRow!.staff_id)
      .setAudience("authenticated")
      .setIssuedAt()
      .setExpirationTime(TOKEN_TTL)
      .sign(new TextEncoder().encode(JWT_SECRET));

    return json(200, {
      access_token: token,
      staff_id: pinRow!.staff_id,
      staff_role: staffRole,
      restaurant_id: restaurantId,
    });
  } catch (_e) {
    return json(500, { error: "Erreur serveur." });
  }
});

// increments the failure counter; returns true if this failure triggers a lockout
async function registerFailure(
  admin: ReturnType<typeof createClient>,
  restaurantId: string, bucket: string,
  att: { fail_count: number; first_fail_at: string | null } | null,
  now: number,
): Promise<boolean> {
  let fc = att?.fail_count ?? 0;
  let ffa = att?.first_fail_at ? new Date(att.first_fail_at).getTime() : null;
  if (!ffa || now - ffa > WINDOW_MS) { fc = 0; ffa = now; } // new window
  fc += 1;
  const locked = fc >= MAX_FAILS;
  await admin.from("pin_login_attempts").upsert({
    restaurant_id: restaurantId, bucket,
    fail_count: fc,
    first_fail_at: new Date(ffa).toISOString(),
    locked_until: locked ? new Date(now + LOCKOUT_MS).toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "restaurant_id,bucket" });
  return locked;
}
