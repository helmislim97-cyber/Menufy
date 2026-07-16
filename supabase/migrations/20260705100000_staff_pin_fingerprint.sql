-- ============================================================================
-- Migration — staff PIN fingerprint (hard per-restaurant uniqueness)
-- ----------------------------------------------------------------------------
-- Adds a deterministic HMAC fingerprint to staff_pins so "a PIN is unique within
-- a restaurant" becomes a DB-enforced guarantee (no set-time race). bcrypt stays
-- in pin_hash for verification; pin_fingerprint = HMAC-SHA256(pin, server_pepper)
-- exists ONLY for this unique index and as the O(1) lookup key at login time.
-- The pepper is a server-only secret (Edge Function env var), never in the DB.
--
-- Safe on an EMPTY staff_pins (pin_count = 0), so the NOT NULL add can't fail.
-- Idempotent (IF NOT EXISTS on both) — re-run safe.
--
-- Reuses : public.staff_pins (from M2)
-- Alters : staff_pins (+pin_fingerprint) + unique index
-- ============================================================================

ALTER TABLE public.staff_pins
  ADD COLUMN IF NOT EXISTS pin_fingerprint TEXT NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_pins_restaurant_fingerprint
  ON public.staff_pins (restaurant_id, pin_fingerprint);
