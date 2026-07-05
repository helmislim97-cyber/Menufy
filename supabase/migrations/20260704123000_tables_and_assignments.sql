-- ============================================================================
-- Migration 4 — table labels/status + waiter assignment
-- ----------------------------------------------------------------------------
-- Recap §9: link each table to its assigned waiter(s) so a waiter sees only
-- their tables/zone and orders attribute correctly. Tables already have
-- `number` and `zone_id`; this adds a human `label` and a live `status`, and a
-- `table_assignments` join for table <-> waiter(s).
--
-- Reuses : public.tables (already has zone_id), public.team_members,
--          public.current_restaurant_id(), public.is_manager_or_owner()
-- Alters : public.tables (+label, +status), and adds composite unique keys to
--          public.tables and public.team_members for referential integrity.
-- Creates: public.table_assignments
-- ============================================================================

-- ---------- 1. table label + live status ----------
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS label  TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'empty';

-- Allowed statuses (matches the app floor states we designed):
--   empty           — nobody seated
--   occupied        — guests seated / active order
--   bill_requested  — waiter flagged the table for the cashier
--   needs_attention — table needs staff (cleanup / assistance)
ALTER TABLE public.tables
  ADD CONSTRAINT tables_status_check
  CHECK (status IN ('empty', 'occupied', 'bill_requested', 'needs_attention'));

-- ---------- 2. integrity keys ----------
-- A table_assignments row must reference a table and a staff member that both
-- live in the SAME restaurant. We guarantee that declaratively with composite
-- foreign keys, which require these composite unique keys as their targets.
-- (id is already unique via each PK, so these never fail on existing data.)
ALTER TABLE public.tables
  ADD CONSTRAINT tables_id_restaurant_uk UNIQUE (id, restaurant_id);
ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_id_restaurant_uk UNIQUE (id, restaurant_id);

-- ---------- 3. table_assignments (table <-> waiter, many-to-many) ----------
CREATE TABLE public.table_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  table_id      UUID NOT NULL,
  staff_id      UUID NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (table_id, staff_id),
  -- composite FKs force table.restaurant_id = staff.restaurant_id = restaurant_id
  FOREIGN KEY (table_id, restaurant_id)
    REFERENCES public.tables (id, restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id, restaurant_id)
    REFERENCES public.team_members (id, restaurant_id) ON DELETE CASCADE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_assignments TO authenticated;
GRANT ALL ON public.table_assignments TO service_role;
ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_table_assignments_table      ON public.table_assignments (table_id);
CREATE INDEX idx_table_assignments_staff      ON public.table_assignments (staff_id);
CREATE INDEX idx_table_assignments_restaurant ON public.table_assignments (restaurant_id);

-- ---------- 4. policies (claim-aware; works for owner + PIN staff) ----------
-- Any member of the restaurant may READ assignments — a waiter needs them to
-- resolve which tables are theirs. Only manager/owner may create or change them.
CREATE POLICY "Members read table assignments" ON public.table_assignments
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());

CREATE POLICY "Managers manage table assignments" ON public.table_assignments
  FOR ALL TO authenticated
  USING (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());
