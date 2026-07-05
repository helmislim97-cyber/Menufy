-- ============================================================================
-- Migration 9 — RLS hardening: reconcile BOTH legacy staff policy sets
-- ----------------------------------------------------------------------------
-- The live DB accumulated TWO overlapping staff-policy eras on most tables:
--   * newer {authenticated}: has_restaurant_access(auth.uid(), restaurant_id)
--   * older {public}:        user_restaurant_ids(auth.uid())  (team_members)
--                            user_owned_restaurant_ids(auth.uid())  (owner)
-- Because RLS OR's policies, rewriting only one era leaves the other live and
-- still granting access. So M9 drops BOTH legacy staff sets and installs ONE
-- clean claim-aware set per table.
--
-- Access today = union( owner , user_roles , team_members(active) ). The
-- reconciled current_restaurant_id() below reproduces exactly that union, so no
-- existing user's RESTAURANT SCOPE changes (proof in the review notes). The only
-- deliberate change is that menu/table-config WRITES tighten to manager/owner
-- (signed off) — floor staff editing the menu was the over-permission we close.
--
-- Customer/QR policies are NOT touched: they reference true/is_active/auth.uid()
-- and so never match the legacy-helper predicate the drop loop uses. That
-- includes the anon "Public read orders/order_items" USING(true) — deferred to
-- M10 on purpose.
--
-- Reuses : current_staff_role helpers (M3), is_manager_or_owner (M3),
--          user_roles, team_members, restaurants, products, orders
-- Alters : REPLACES current_restaurant_id() and is_manager_or_owner();
--          drops legacy staff policies and creates claim-aware ones on
--          orders, order_items, categories, products, tables,
--          product_supplements, reviews, assistance_requests, upsell_items,
--          team_members, table_zones
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Reconciled helpers
-- ---------------------------------------------------------------------------
-- current_restaurant_id(): union of the three live membership stores, priority
-- ordered. Supersedes M3's profiles-based fallback (never a live access path).
--   (1) PIN claim  (2) owner  (3) user_roles staff  (4) team_members(active)
CREATE OR REPLACE FUNCTION public.current_restaurant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (CASE WHEN (auth.jwt() ->> 'restaurant_id')
                 ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN (auth.jwt() ->> 'restaurant_id')::uuid END),
    (SELECT r.id  FROM public.restaurants  r  WHERE r.owner_id = auth.uid() LIMIT 1),
    (SELECT ur.restaurant_id FROM public.user_roles ur
       WHERE ur.user_id = auth.uid() AND ur.restaurant_id IS NOT NULL LIMIT 1),
    (SELECT tm.restaurant_id FROM public.team_members tm
       WHERE tm.user_id = auth.uid() AND tm.status = 'active' LIMIT 1)
  );
$$;

-- is_manager_or_owner(): owner, OR PIN role owner/manager, OR (transition) a
-- manager stored in team_members.roles — since manager/waiter live only there.
CREATE OR REPLACE FUNCTION public.is_manager_or_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.restaurants r
            WHERE r.id = public.current_restaurant_id() AND r.owner_id = auth.uid())
    OR COALESCE((auth.jwt() ->> 'staff_role') IN ('owner', 'manager'), false)
    OR EXISTS (SELECT 1 FROM public.team_members tm
               WHERE tm.user_id = auth.uid() AND tm.status = 'active'
                 AND tm.restaurant_id = public.current_restaurant_id()
                 AND 'manager' = ANY (tm.roles));
$$;

-- ---------------------------------------------------------------------------
-- 2. Drop BOTH legacy staff policy sets, by predicate (name-independent).
--    Run the preview query in the migration notes first to see exact names.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  pol RECORD;
  affected text[] := ARRAY[
    'orders','order_items','categories','products','tables',
    'product_supplements','reviews','assistance_requests','upsell_items',
    'team_members','table_zones'
  ];
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (affected)
      AND (
        COALESCE(qual, '')       ~* 'has_restaurant_access|user_restaurant_ids|user_owned_restaurant_ids'
        OR COALESCE(with_check, '') ~* 'has_restaurant_access|user_restaurant_ids|user_owned_restaurant_ids'
      )
  LOOP
    RAISE NOTICE 'M9 dropping legacy staff policy "%" on public.%', pol.policyname, pol.tablename;
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Reconciled claim-aware staff policies (idempotent: drop-if-exists first).
--    On every policy: "restaurant_id = current_restaurant_id()" lets the OWNER
--    through via branch (2), user_roles staff via (3), team_members staff via
--    (4) — identical scope to today. is_manager_or_owner() adds the write gate.
-- ---------------------------------------------------------------------------

-- ===== categories (menu) : public read kept; manage -> manager/owner =====
DROP POLICY IF EXISTS "m9_categories_manage" ON public.categories;
CREATE POLICY "m9_categories_manage" ON public.categories
  FOR ALL TO authenticated
  USING      (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- ===== products (menu) : public read kept; manage -> manager/owner =====
DROP POLICY IF EXISTS "m9_products_manage" ON public.products;
CREATE POLICY "m9_products_manage" ON public.products
  FOR ALL TO authenticated
  USING      (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- ===== tables (floor config) : public read kept; manage -> manager/owner =====
-- (waiter status flips go through a narrow RPC in a later migration, decision A)
DROP POLICY IF EXISTS "m9_tables_manage" ON public.tables;
CREATE POLICY "m9_tables_manage" ON public.tables
  FOR ALL TO authenticated
  USING      (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- ===== product_supplements (menu, scoped via product) : manage -> manager/owner =====
DROP POLICY IF EXISTS "m9_supplements_manage" ON public.product_supplements;
CREATE POLICY "m9_supplements_manage" ON public.product_supplements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p
                 WHERE p.id = product_supplements.product_id
                   AND p.restaurant_id = public.current_restaurant_id())
         AND public.is_manager_or_owner())
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p
                 WHERE p.id = product_supplements.product_id
                   AND p.restaurant_id = public.current_restaurant_id())
         AND public.is_manager_or_owner());

-- ===== upsell_items (menu) : manage -> manager/owner =====
DROP POLICY IF EXISTS "m9_upsell_manage" ON public.upsell_items;
CREATE POLICY "m9_upsell_manage" ON public.upsell_items
  FOR ALL TO authenticated
  USING      (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- ===== table_zones (floor config) : member read; manage -> manager/owner =====
-- Consistent with `tables` (decision 3): zones are floor-layout config edited on
-- the same screen, so a manager who configures tables can configure zones too.
-- The pre-existing "Owners manage their table zones" (inline owner_id subquery,
-- no helper -> not caught by the predicate loop) is now a redundant subset of the
-- manager/owner policy below, so we drop it explicitly by name for cleanliness.
-- (DROP ... IF EXISTS -> re-run safe.)
--   Owner path: reads via current_restaurant_id() branch (2); writes via
--   is_manager_or_owner() owner_id check.
DROP POLICY IF EXISTS "Owners manage their table zones" ON public.table_zones;
DROP POLICY IF EXISTS "m9_zones_read"   ON public.table_zones;
DROP POLICY IF EXISTS "m9_zones_manage" ON public.table_zones;
CREATE POLICY "m9_zones_read" ON public.table_zones
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());
CREATE POLICY "m9_zones_manage" ON public.table_zones
  FOR ALL TO authenticated
  USING      (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- ===== orders (operational) : member read + member update =====
-- Any floor member may read and update their restaurant's orders; per-role
-- status transitions are enforced in the app (decision 4). Customer
-- "Anyone can create order" INSERT and anon "Public read orders" are untouched.
DROP POLICY IF EXISTS "m9_orders_read"   ON public.orders;
DROP POLICY IF EXISTS "m9_orders_update" ON public.orders;
CREATE POLICY "m9_orders_read" ON public.orders
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());
CREATE POLICY "m9_orders_update" ON public.orders
  FOR UPDATE TO authenticated
  USING      (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

-- ===== order_items (operational, scoped via order) : member manage =====
-- Customer insert/read policies untouched.
DROP POLICY IF EXISTS "m9_order_items_manage" ON public.order_items;
CREATE POLICY "m9_order_items_manage" ON public.order_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o
                 WHERE o.id = order_items.order_id
                   AND o.restaurant_id = public.current_restaurant_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o
                 WHERE o.id = order_items.order_id
                   AND o.restaurant_id = public.current_restaurant_id()));

-- ===== team_members (staff) : member read; manage -> manager/owner =====
-- Read (names/roles/status; NOT pin_hash, which lives in staff_pins) lets the
-- PIN pad list staff and the app resolve access. Manage (add/remove, set role)
-- tightens from any-member (old has_restaurant_access) to manager/owner.
-- COEXISTENCE: the surviving "Staff sees own row" policy (user_id=auth.uid(),
-- SELECT) is NOT dropped (no helper reference). m9_team_members_read is a strict
-- SUPERSET of it, and SELECT policies OR together, so it is redundant-but-
-- harmless and deliberately left in place — no conflict, no duplication risk.
DROP POLICY IF EXISTS "m9_team_members_read"   ON public.team_members;
DROP POLICY IF EXISTS "m9_team_members_manage" ON public.team_members;
CREATE POLICY "m9_team_members_read" ON public.team_members
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());
CREATE POLICY "m9_team_members_manage" ON public.team_members
  FOR ALL TO authenticated
  USING      (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- ===== reviews : member read; manage -> manager/owner =====
-- Customer "create review" insert (and any public read) untouched.
DROP POLICY IF EXISTS "m9_reviews_read"   ON public.reviews;
DROP POLICY IF EXISTS "m9_reviews_manage" ON public.reviews;
CREATE POLICY "m9_reviews_read" ON public.reviews
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());
CREATE POLICY "m9_reviews_manage" ON public.reviews
  FOR ALL TO authenticated
  USING      (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- ===== assistance_requests (operational) : member read + member update =====
-- Floor staff handle assistance (mark handled). Customer insert untouched.
DROP POLICY IF EXISTS "m9_assist_read"   ON public.assistance_requests;
DROP POLICY IF EXISTS "m9_assist_update" ON public.assistance_requests;
CREATE POLICY "m9_assist_read" ON public.assistance_requests
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());
CREATE POLICY "m9_assist_update" ON public.assistance_requests
  FOR UPDATE TO authenticated
  USING      (restaurant_id = public.current_restaurant_id())
  WITH CHECK (restaurant_id = public.current_restaurant_id());

-- ---------------------------------------------------------------------------
-- 4. Verification — print the end-state policy set per affected table so the
--    migration output shows exactly what exists after M9 (surviving customer/QR
--    policies + the reconciled staff set). Read-only; changes nothing.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
  affected text[] := ARRAY[
    'orders','order_items','categories','products','tables',
    'product_supplements','reviews','assistance_requests','upsell_items',
    'team_members','table_zones'
  ];
BEGIN
  RAISE NOTICE '===== M9 end-state policies (per table) =====';
  FOR r IN
    SELECT tablename, policyname, cmd, roles,
           COALESCE(qual,'')       AS using_expr,
           COALESCE(with_check,'') AS check_expr
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY (affected)
    ORDER BY tablename, cmd, policyname
  LOOP
    RAISE NOTICE '  [%] % (%; roles=%)  USING(%) CHECK(%)',
      r.tablename, r.policyname, r.cmd, r.roles, r.using_expr, r.check_expr;
  END LOOP;
  RAISE NOTICE '===== end =====';
END $$;
