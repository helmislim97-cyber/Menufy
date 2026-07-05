-- ============================================================================
-- Migration 5 — order attribution + richer status set
-- ----------------------------------------------------------------------------
-- Recap §3 / §11: orders carry a source (qr/manual), a fuller status lifecycle,
-- and created_by_staff_id for attribution. Order items snapshot their modifiers.
--
-- Converts orders.status from the enum `public.order_status` to text + CHECK,
-- because the status set will keep growing and enums can't remove/rename/reorder
-- values (and each ADD VALUE hits Postgres' same-transaction restriction).
--
-- Reuses : public.orders, public.order_items, public.team_members, public.roles
-- Alters : orders.status (enum -> text +CHECK), +orders.source,
--          +orders.created_by_staff_id, +orders.created_by_name/created_by_role,
--          +order_items.modifiers
-- Creates: snapshot_order_creator() trigger fn (attribution snapshot on insert)
--
-- ⚠️  PRE-CHECK — RUN THIS IN THE SQL EDITOR BEFORE APPLYING THIS MIGRATION.
--     If anything OTHER THAN orders.status references the order_status enum,
--     converting the column to text breaks that reference at query time. This
--     migration assumes the check comes back clean (only orders.status).
--
--       -- (a) columns using the enum type
--       select table_schema, table_name, column_name
--       from information_schema.columns
--       where udt_name = 'order_status';
--
--       -- (b) functions referencing it
--       select p.proname
--       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--       where pg_get_functiondef(p.oid) ilike '%order_status%';
--
--       -- (c) policies referencing it
--       select pol.polname, c.relname
--       from pg_policy pol join pg_class c on c.oid = pol.polrelid
--       where coalesce(pg_get_expr(pol.polqual,     pol.polrelid),'') ilike '%order_status%'
--          or coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid),'') ilike '%order_status%';
--
--       -- (d) views referencing it
--       select table_name from information_schema.views
--       where view_definition ilike '%order_status%';
--
--     Expected clean result: (a) returns only orders/status; (b) (c) (d) empty.
-- ============================================================================

-- ---------- 1. status: enum -> text + CHECK (values preserved exactly) ----------
-- Drop the default first (it is typed to the enum and can't auto-cast), convert,
-- then restore the default and add the full-set CHECK. Existing rows are
-- unchanged: every current value ('pending','preparing','ready','paid',
-- 'cancelled') is a member of the new set below.
ALTER TABLE public.orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.orders ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',                -- placed, kitchen hasn't seen it (freely editable)
    'preparing',              -- kitchen cooking
    'ready',                  -- ready to serve
    'served',                 -- delivered to the table
    'cancellation_pending',   -- staff requested a cancel, awaiting owner/manager
    'edit_pending',           -- staff requested an edit, awaiting owner/manager
    'cancelled',              -- cancel approved
    'paid'                    -- settled
  ));

-- The old enum type public.order_status is now UNUSED by orders.status. It is
-- intentionally NOT dropped here (guards against any object the pre-check missed).
-- A later cleanup migration can `DROP TYPE public.order_status;` once confirmed.

-- ---------- 2. order source (how it was entered) ----------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'qr';
ALTER TABLE public.orders
  ADD CONSTRAINT orders_source_check CHECK (source IN ('qr', 'manual'));

-- ---------- 3. attribution: who created the order (NULL for pure QR) ----------
-- Two layers, on purpose (anti-theft audit trail must survive staff deletion):
--   * created_by_staff_id — live FK link. ON DELETE SET NULL so deleting a staff
--     member never blocks; joins to the staff row while it exists.
--   * created_by_name / created_by_role — permanent text SNAPSHOT captured at
--     insert. A fired waiter (possibly fired FOR theft) getting hard-deleted
--     nulls the FK, but the snapshot preserves who did it, forever.
-- Preferred flow is to SUSPEND staff (team_members.status='suspended') rather
-- than delete, which keeps the FK too; the snapshot is the fallback for deletes.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS created_by_staff_id uuid
  REFERENCES public.team_members(id) ON DELETE SET NULL;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS created_by_name text,
  ADD COLUMN IF NOT EXISTS created_by_role text;
CREATE INDEX IF NOT EXISTS idx_orders_created_by_staff ON public.orders (created_by_staff_id);

-- Fill the snapshot authoritatively from created_by_staff_id, so it always
-- matches the referenced staff and can't be spoofed by client-sent values.
-- BEFORE INSERT ONLY: the ON DELETE SET NULL above triggers an internal UPDATE
-- that must NOT touch the snapshot, or we'd erase the very audit trail we want.
CREATE OR REPLACE FUNCTION public.snapshot_order_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by_staff_id IS NOT NULL THEN
    SELECT tm.full_name, r.key
      INTO NEW.created_by_name, NEW.created_by_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.id = NEW.created_by_staff_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_snapshot_creator ON public.orders;
CREATE TRIGGER trg_orders_snapshot_creator
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_order_creator();

-- ---------- 4. order item modifiers snapshot ----------
-- name/price/notes already snapshot on order_items; add the modifiers array
-- (e.g. [{"name":"Extra cheese","price":1.5}, ...]) captured at order time.
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS modifiers jsonb NOT NULL DEFAULT '[]'::jsonb;
