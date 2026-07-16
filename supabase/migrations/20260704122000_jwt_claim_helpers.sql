-- ============================================================================
-- Migration 3 — JWT-claim RLS helper functions
-- ----------------------------------------------------------------------------
-- The PIN-login Edge Function mints a short-lived JWT carrying three custom
-- claims: restaurant_id, staff_id, staff_role. RLS policies (rewritten in the
-- hardening migration) read those claims through the helpers below.
--
-- Two kinds of caller must both resolve correctly:
--   * OWNER  — signs in normally (email/password). Their JWT has NO custom
--              claims; they are identified by restaurants.owner_id = auth.uid().
--   * STAFF  — a PIN JWT on a shared device. Identified purely by its claims.
--
-- All helpers are STABLE + SECURITY DEFINER with a pinned search_path, and read
-- claims via auth.jwt() (Supabase's wrapper over request.jwt.claims). They do
-- NOT depend on any table whose RLS calls them back, so there is no recursion.
--
-- Null-safety: auth.jwt() returns NULL when no token is present, so a missing
-- claim yields NULL (RLS then denies) rather than throwing. UUID claims are
-- format-checked with a regex BEFORE casting, so a malformed claim also returns
-- NULL instead of raising "invalid input syntax for type uuid". Boolean helpers
-- COALESCE to false so they never return NULL into a USING clause.
--
-- Reuses : auth.jwt(), auth.uid(), public.restaurants, public.user_restaurant_id()
-- Creates: current_restaurant_id(), current_staff_id(), current_staff_role(),
--          is_manager_or_owner()
-- Alters : nothing. No policies are changed here (that is the hardening step).
-- ============================================================================

-- ---------- the restaurant the caller is acting within ----------
-- Staff: the restaurant_id claim from the PIN JWT.
-- Owner/other auth users: the restaurant they own, else their profile's.
CREATE OR REPLACE FUNCTION public.current_restaurant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- format-check the claim before casting so a malformed value returns NULL
    -- instead of throwing:
    (CASE
       WHEN (auth.jwt() ->> 'restaurant_id')
              ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       THEN (auth.jwt() ->> 'restaurant_id')::uuid
     END),
    (SELECT r.id FROM public.restaurants r WHERE r.owner_id = auth.uid() LIMIT 1),
    public.user_restaurant_id(auth.uid())
  );
$$;

-- ---------- the staff member acting (NULL for owner / non-PIN sessions) ----------
CREATE OR REPLACE FUNCTION public.current_staff_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN (auth.jwt() ->> 'staff_id')
           ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN (auth.jwt() ->> 'staff_id')::uuid
  END;
$$;

-- ---------- the staff role slug from the PIN JWT (NULL for owner sessions) ----------
CREATE OR REPLACE FUNCTION public.current_staff_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(auth.jwt() ->> 'staff_role', '');
$$;

-- ---------- can the caller approve requests / manage the restaurant? ----------
-- True when the caller is the restaurant owner (real auth user) OR a PIN staff
-- whose role is owner/manager, always scoped to the current restaurant.
CREATE OR REPLACE FUNCTION public.is_manager_or_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = public.current_restaurant_id()
        AND r.owner_id = auth.uid()
    )
    -- COALESCE so a NULL staff_role (e.g. a legacy staff auth user) yields
    -- false, never NULL, into RLS USING clauses.
    OR COALESCE((auth.jwt() ->> 'staff_role') IN ('owner', 'manager'), false);
$$;

GRANT EXECUTE ON FUNCTION public.current_restaurant_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_staff_id()      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_staff_role()    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_owner()   TO anon, authenticated;
