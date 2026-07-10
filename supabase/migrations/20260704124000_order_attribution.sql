-- ============================================================================
-- Migration 5 — order attribution + richer status set   (RE-VERIFIED for Option 1)
-- ----------------------------------------------------------------------------
-- Recap §3 / §11: orders carry a source (qr/manual), a fuller status lifecycle,
-- and created_by_staff_id for attribution. Order items snapshot their modifiers.
--
-- Converts orders.status from the enum `public.order_status` to text + CHECK,
-- because the status set will keep growing and enums can't remove/rename/reorder
-- values (and each ADD VALUE hits Postgres' same-transaction restriction).
--
-- ▶ ANTI-THEFT MODEL (the reason this migration exists):
--   The attribution snapshot is written SERVER-SIDE and AUTHORITATIVELY. The
--   trigger resolves the acting staff member from the SESSION identity
--   (team_members.user_id = auth.uid() — the SAME Option-1 model M9 uses), NOT
--   from anything the client sends. A client CANNOT omit its identity to create
--   an untracked "ghost" sale, and CANNOT forge someone else's id to frame them:
--   created_by_staff_id is overwritten from auth.uid() on every insert.
--     * A staff session (sami on /waiter)  -> stamped with sami's id/name/role.
--     * An anonymous QR customer            -> auth.uid() is NULL -> left NULL.
--     * The owner (no team_members row)     -> left NULL (owner isn't staff).
--
-- Reuses : public.orders, public.order_items, public.team_members, public.roles
-- Alters : orders.status (enum -> text +CHECK), +orders.source,
--          +orders.created_by_staff_id, +orders.created_by_name/created_by_role,
--          +order_items.modifiers
-- Creates: snapshot_order_creator() trigger fn (authoritative attribution)
--
-- ⚠️  PRE-CHECK — RUN ALL OF THESE IN THE SQL EDITOR BEFORE APPLYING.
--     The enum->text conversion touches every existing order row, and the new
--     CHECK will REJECT the whole migration if any existing row holds a status
--     value not in the list below. So checks (e) and (f) are MANDATORY.
--
--       -- (a) columns using the enum type (must be ONLY orders.status)
--       select table_schema, table_name, column_name
--       from information_schema.columns
--       where udt_name = 'order_status';
--
--       -- (b) functions referencing it (expected: empty)
--       select p.proname
--       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--       where pg_get_functiondef(p.oid) ilike '%order_status%';
--
--       -- (c) policies referencing it (expected: empty)
--       select pol.polname, c.relname
--       from pg_policy pol join pg_class c on c.oid = pol.polrelid
--       where coalesce(pg_get_expr(pol.polqual,     pol.polrelid),'') ilike '%order_status%'
--          or coalesce(pg_get_expr(pol.polwithcheck, pol.polrelid),'') ilike '%order_status%';
--
--       -- (d) views referencing it (expected: empty)
--       select table_name from information_schema.views
--       where view_definition ilike '%order_status%';
--
--       -- (e) the enum's actual values (so you know what exists today)
--       select enumlabel from pg_enum
--       where enumtypid = 'public.order_status'::regtype
--       order by enumsortorder;
--
--       -- (f) DISTINCT status values actually present in your orders, with counts.
--       --     EVERY value returned here MUST appear in the CHECK list in step 1.
--       --     If any doesn't (e.g. 'completed', 'confirmed', 'delivered'),
--       --     STOP and tell me — we add it to the CHECK before applying.
--       select status, count(*) from public.orders group by status order by 2 desc;
--
--       -- (g) sanity: confirm the new columns don't already exist (expected: empty)
--       select column_name from information_schema.columns
--       where table_schema='public' and table_name='orders'
--         and column_name in ('source','created_by_staff_id','created_by_name','created_by_role');
--
--     Expected clean result: (a) returns only orders/status; (b)(c)(d)(g) empty;
--     (f) shows only values already in the CHECK list below.
-- ============================================================================

-- ---------- 1. status: enum -> text + CHECK (values preserved exactly) ----------
-- Drop the default first (it is typed to the enum and can't auto-cast), convert,
-- then restore the default and add the full-set CHECK. Existing rows are
-- unchanged: every current value ('pending','preparing','ready','paid',
-- 'cancelled') is a member of the new set below.
ALTER TABLE public.orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.orders ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
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
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_source_check;
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

-- Authoritative attribution. The staff member is resolved from the SESSION
-- (auth.uid() -> team_members.user_id), NOT from client-sent values, so the
-- client can neither omit its identity (ghost sale) nor forge another's (frame).
-- auth.uid() works inside a SECURITY DEFINER trigger: it reads the request JWT
-- GUC, which is independent of the executing role (same basis as M9's helpers).
--
-- BEFORE INSERT ONLY: the ON DELETE SET NULL above fires an internal UPDATE that
-- must NOT re-run this, or a later staff deletion would erase the snapshot we
-- are keeping precisely to survive that deletion.
CREATE OR REPLACE FUNCTION public.snapshot_order_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_staff_id uuid;
  v_name     text;
  v_role     text;
BEGIN
  -- Who is acting? Resolve the staff row for this session, scoped to THIS
  -- order's restaurant (a staff of restaurant A can't attribute in B).
  IF v_uid IS NOT NULL THEN
    SELECT tm.id, tm.full_name, r.key
      INTO v_staff_id, v_name, v_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.user_id = v_uid
      AND tm.restaurant_id = NEW.restaurant_id
      AND tm.status = 'active'
    LIMIT 1;
  END IF;

  IF v_staff_id IS NOT NULL THEN
    -- Staff-created order: stamp attribution AUTHORITATIVELY (overwrite any
    -- client-sent value). A staff-entered order is a manual order by definition,
    -- never an anonymous QR scan — so also fix the source if it says 'qr'.
    NEW.created_by_staff_id := v_staff_id;
    NEW.created_by_name     := v_name;
    NEW.created_by_role     := v_role;
    IF NEW.source IS NULL OR NEW.source = 'qr' THEN
      NEW.source := 'manual';
    END IF;
  ELSE
    -- No staff identity (anonymous QR customer, or the owner who has no
    -- team_members row): never trust a client-sent creator. Leave it NULL.
    NEW.created_by_staff_id := NULL;
    NEW.created_by_name     := NULL;
    NEW.created_by_role     := NULL;
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
