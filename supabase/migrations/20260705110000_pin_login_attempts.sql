-- ============================================================================
-- Migration — pin_login_attempts (staff PIN brute-force lockout)
-- ----------------------------------------------------------------------------
-- 4-digit PINs = only 10k combos, so staff-pin-login must throttle. In-memory
-- counters don't survive across Edge Function invocations, so failures are
-- tracked here. Service-role only (the login function is the sole reader/writer);
-- RLS is on with no client policies, so anon/authenticated can't touch it.
--
-- bucket = the rate-limit key. For now the login function uses restaurant_id
-- (one shared device per restaurant in testing); the device-account model will
-- switch it to a per-device id.
--
-- Reuses : public.restaurants
-- Creates: public.pin_login_attempts
-- ============================================================================

CREATE TABLE public.pin_login_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  bucket        TEXT NOT NULL,
  fail_count    INT NOT NULL DEFAULT 0,
  first_fail_at TIMESTAMPTZ,
  locked_until  TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, bucket)
);

-- service_role only — deliberately no GRANT to anon or authenticated.
GRANT ALL ON public.pin_login_attempts TO service_role;
ALTER TABLE public.pin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_pin_login_attempts_restaurant ON public.pin_login_attempts (restaurant_id);
