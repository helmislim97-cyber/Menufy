-- ============================================================================
-- Migration 2 — team_members become PIN-based staff identities
-- ----------------------------------------------------------------------------
-- Repurposes the existing `team_members` table (do NOT create a new one) into
-- the staff model from the recap: staff are NOT auth users, they are PIN
-- identities tied to a restaurant and a single role, with optional per-person
-- permission overrides.
--
-- This migration is the DB layer only. The bcrypt hashing + short-lived-JWT
-- minting live in a later Edge Function step; here we just add the columns and
-- a locked-down table to hold the hashes.
--
-- Reuses : public.team_members, public.roles, public.restaurants,
--          public.update_updated_at_column()
-- Alters : public.team_members (+role_id, +permission_overrides, +updated_at)
-- Creates: public.staff_pins (service-role only)
--
-- Non-breaking on purpose: legacy columns `roles` (text[]), `user_id` and
-- `email` are kept so the current dashboard.roles.tsx flow keeps working while
-- the frontend is migrated. They are deprecated under the PIN model and will be
-- retired in a later migration once the UI no longer reads them.
-- ============================================================================

-- ---------- 1. new columns on team_members ----------
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS role_id              UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS permission_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members (role_id);

-- keep updated_at fresh
DROP TRIGGER IF EXISTS trg_team_members_updated ON public.team_members;
CREATE TRIGGER trg_team_members_updated BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- 2. backfill role_id from the legacy roles[] ----------
-- Map each existing member to a single system role. Highest privilege wins when
-- a member carried several legacy roles (manager > cashier > waiter > kitchen).
UPDATE public.team_members tm
SET role_id = r.id
FROM public.roles r
WHERE r.restaurant_id = tm.restaurant_id
  AND tm.role_id IS NULL
  AND r.key = CASE
                WHEN 'manager' = ANY (tm.roles) THEN 'manager'
                WHEN 'cashier' = ANY (tm.roles) THEN 'cashier'
                WHEN 'waiter'  = ANY (tm.roles) THEN 'waiter'
                WHEN 'kitchen' = ANY (tm.roles) THEN 'kitchen'
                ELSE NULL
              END;

-- ---------- 2b. mark deprecated columns (for the future drop migration) ----------
-- These are the EXACT columns to remove once the frontend no longer reads them.
-- Under the PIN model staff are not auth users and do not sign in by email.
COMMENT ON COLUMN public.team_members.roles   IS 'DEPRECATED (PIN model): legacy text[] roles, superseded by role_id. DROP in a later migration once the UI no longer reads it.';
COMMENT ON COLUMN public.team_members.user_id IS 'DEPRECATED (PIN model): staff are no longer auth users. Kept only for the legacy smooth-action flow. DROP once retired.';
COMMENT ON COLUMN public.team_members.email   IS 'DEPRECATED (PIN model): staff sign in by PIN, not email. Kept during transition. DROP once retired.';

-- ============================================================================
-- 3. staff_pins — hashed PINs, isolated from all client access
-- ============================================================================
-- The hash never needs to reach a browser: the owner SETS a PIN and the device
-- VERIFIES a PIN, both through Edge Functions running with the service role.
-- So this table grants NOTHING to anon/authenticated and enables RLS with no
-- policies for them => fully locked. Only service_role (Edge Functions) can
-- read or write it.
--
-- restaurant_id is denormalised here so the login function can load a
-- restaurant's candidate hashes in one query.
--
-- ┌── TODO for the Edge Functions that will use this table ────────────────────┐
-- │ set-staff-pin (owner sets a staff PIN):                                    │
-- │   * Store bcrypt(pin) in pin_hash (for verification).                      │
-- │   * ALSO compute a deterministic pin_fingerprint = HMAC-SHA256(pin,        │
-- │     server_pepper) and add a UNIQUE index on (restaurant_id,               │
-- │     pin_fingerprint). This makes "PIN unique per restaurant" a HARD DB     │
-- │     guarantee with no set-time race condition. bcrypt stays for verify;    │
-- │     the HMAC fingerprint exists only for the unique index. The pepper is a │
-- │     server-only secret (env var), never stored in the DB.                  │
-- │     -> add the pin_fingerprint column + unique index in the migration that │
-- │        ships alongside that function.                                      │
-- │                                                                            │
-- │ staff-pin-login (device verifies a PIN, mints the short-lived JWT):        │
-- │   * Rate-limit / lockout after N failed attempts per device (4-digit PIN   │
-- │     = only 10k combos, so brute-force protection is required). Track       │
-- │     failed attempts + a lockout window (per device, and/or per restaurant).│
-- └────────────────────────────────────────────────────────────────────────────┘
CREATE TABLE public.staff_pins (
  staff_id      UUID PRIMARY KEY REFERENCES public.team_members(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  pin_hash      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- service_role only — deliberately no GRANT to anon or authenticated.
GRANT ALL ON public.staff_pins TO service_role;
ALTER TABLE public.staff_pins ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_staff_pins_restaurant ON public.staff_pins (restaurant_id);

DROP TRIGGER IF EXISTS trg_staff_pins_updated ON public.staff_pins;
CREATE TRIGGER trg_staff_pins_updated BEFORE UPDATE ON public.staff_pins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
