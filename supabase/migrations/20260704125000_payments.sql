-- ============================================================================
-- Migration 6 — payments as full events (not a boolean)   (RE-VERIFIED for Option 1)
-- ----------------------------------------------------------------------------
-- Recap §11: payment is stored as an event capturing method, amounts, the
-- cashier who settled it and the waiter who carried the cash, plus timestamp —
-- the data that makes end-of-shift reconciliation and anti-theft possible.
--
-- Audit-survival + anti-spoof design (same philosophy as M5):
--   * settled_by (the ACTOR recording the payment) and voided_by (the ACTOR
--     voiding it) are stamped AUTHORITATIVELY from the SESSION identity
--     (team_members.user_id = auth.uid() — the Option-1 model M9/M5 use), NOT
--     from client-sent values. A cashier can't attribute a payment to someone
--     else, can't record an unattributed one, and can't forge who voided one.
--   * handled_by (the waiter COURIER who physically carried the cash) is a claim
--     ABOUT another staff member, so it stays client-supplied — but the name/role
--     snapshot is taken server-side and only for an id in THIS restaurant.
--   * Each of the three keeps a live FK (ON DELETE SET NULL) AND a permanent
--     name+role snapshot, so attribution survives a hard-delete.
--   * Payments are NEVER hard-deleted: no DELETE grant. A void is a one-way
--     status change to 'voided' (who/when stamped); voids are irreversible; and
--     a completed payment is otherwise IMMUTABLE (amounts/method can't be edited).
--
-- ⚠️  IMPORTANT — the claim-based helper public.current_staff_id() (defined only
--     in the UN-APPLIED M3) is NO LONGER used here; the triggers resolve the
--     acting staff inline from auth.uid(). Applying M3 is not required.
--
-- Reuses : public.orders, public.team_members, public.roles, public.profiles,
--          public.current_restaurant_id(), public.is_manager_or_owner()  [M9]
-- Alters : public.orders (adds composite UNIQUE(id, restaurant_id))
-- Creates: public.payments (+ two trigger functions, three policies)
--
-- ⚠️  PRE-CHECK — RUN THESE IN THE SQL EDITOR BEFORE APPLYING.
--     M6 touches MONEY records. If a payments table already exists with data,
--     this migration's CREATE TABLE will ERROR (by design — it will NOT clobber
--     it); stop and tell me so we reconcile instead.
--
--       -- (a) does a payments table already exist? expected: NULL
--       select to_regclass('public.payments');
--       -- (a2) if (a) is NOT null, how many rows? (skip if NULL)
--       -- select count(*) from public.payments;
--
--       -- (b) does the composite unique already exist on orders? expected: empty
--       select conname from pg_constraint where conname = 'orders_id_restaurant_uk';
--
--       -- (c) confirm the Option-1 helpers M6 depends on exist. expected: BOTH.
--       select proname from pg_proc
--       where proname in ('current_restaurant_id','is_manager_or_owner');
--
--       -- (d) sanity: profiles has full_name (owner-name snapshot). expected: 1 row
--       select column_name from information_schema.columns
--       where table_schema='public' and table_name='profiles' and column_name='full_name';
-- ============================================================================

-- Composite unique key so payments.(order_id, restaurant_id) can be a composite
-- FK — guaranteeing a payment's restaurant matches its order's restaurant.
-- (id is already unique via the PK, so this never fails on existing data.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_id_restaurant_uk') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_id_restaurant_uk UNIQUE (id, restaurant_id);
  END IF;
END $$;

-- NOTE: CREATE TABLE (no IF NOT EXISTS) on purpose — if a payments table already
-- exists this fails LOUDLY rather than silently diverging from your data.
CREATE TABLE public.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id       UUID NOT NULL,
  order_id            UUID NOT NULL,

  method              TEXT NOT NULL CHECK (method IN ('cash', 'card', 'online')),
  amount_due          NUMERIC(10,3) NOT NULL,
  amount_tendered     NUMERIC(10,3),           -- cash: what the customer handed over
  change_given        NUMERIC(10,3),           -- cash: change returned

  status              TEXT NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('completed', 'voided')),

  -- who settled it (the actor / cashier): FK link + permanent snapshot
  settled_by_staff_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  settled_by_name     TEXT,
  settled_by_role     TEXT,

  -- who physically carried the cash (waiter courier): FK link + permanent snapshot
  handled_by_staff_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  handled_by_name     TEXT,
  handled_by_role     TEXT,

  -- void audit (stamped by trigger on the completed -> voided transition)
  voided_at           TIMESTAMPTZ,
  voided_by_staff_id  UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  voided_by_name      TEXT,
  voided_by_role      TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- a payment's order must live in the same restaurant. RESTRICT (not CASCADE)
  -- so an order that has payments cannot be hard-deleted out from under the
  -- trail — orders are soft-cancelled (status), never deleted.
  CONSTRAINT payments_order_fk FOREIGN KEY (order_id, restaurant_id)
    REFERENCES public.orders (id, restaurant_id) ON DELETE RESTRICT
);

-- NOTE: intentionally NO DELETE granted to anon/authenticated. Only service_role
-- may delete; floor and management can insert, read, and void (update) only.
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payments_restaurant ON public.payments (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order      ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_settled_by ON public.payments (settled_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_payments_handled_by ON public.payments (handled_by_staff_id);

-- ---------- trigger 1: snapshot handlers on insert (authoritative) ----------
CREATE OR REPLACE FUNCTION public.snapshot_payment_handlers()
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
  -- payments always start 'completed'; voiding is a separate, gated UPDATE
  NEW.status := 'completed';

  -- settled_by = the ACTOR recording this payment, resolved AUTHORITATIVELY from
  -- the session (Option 1), scoped to this restaurant. Overwrites any client
  -- value so a cashier can't attribute a payment to someone else or leave it
  -- unattributed.
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
    NEW.settled_by_staff_id := v_staff_id;
    NEW.settled_by_name     := v_name;
    NEW.settled_by_role     := v_role;
  ELSIF v_uid IS NOT NULL THEN
    -- the owner: real auth user with a profile but no team_members row
    NEW.settled_by_staff_id := NULL;
    SELECT p.full_name, 'owner' INTO NEW.settled_by_name, NEW.settled_by_role
    FROM public.profiles p WHERE p.id = v_uid;
  ELSE
    NEW.settled_by_staff_id := NULL;
    NEW.settled_by_name     := NULL;
    NEW.settled_by_role     := NULL;
  END IF;

  -- handled_by = the waiter COURIER who carried the cash. A claim ABOUT another
  -- staff member (not the actor), so client-supplied — but snapshot server-side
  -- and only trust an id that belongs to THIS restaurant (no cross-tenant leak).
  IF NEW.handled_by_staff_id IS NOT NULL THEN
    SELECT tm.full_name, r.key
      INTO NEW.handled_by_name, NEW.handled_by_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.id = NEW.handled_by_staff_id
      AND tm.restaurant_id = NEW.restaurant_id;
    IF NEW.handled_by_name IS NULL THEN     -- id not in this restaurant: drop it
      NEW.handled_by_staff_id := NULL;
      NEW.handled_by_role     := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payments_snapshot_handlers ON public.payments;
CREATE TRIGGER trg_payments_snapshot_handlers
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_payment_handlers();

-- ---------- trigger 2: enforce immutability + stamp the one-way void ----------
CREATE OR REPLACE FUNCTION public.stamp_payment_void()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_staff uuid;
BEGIN
  -- Anti-tamper: a payment is immutable after insert. The ONLY legitimate update
  -- is the one-way void (status completed -> voided). Reject edits to the money
  -- and attribution fields so a settled payment can't be quietly rewritten.
  IF NEW.order_id      <> OLD.order_id
     OR NEW.restaurant_id <> OLD.restaurant_id
     OR NEW.method        <> OLD.method
     OR NEW.amount_due       IS DISTINCT FROM OLD.amount_due
     OR NEW.amount_tendered  IS DISTINCT FROM OLD.amount_tendered
     OR NEW.change_given     IS DISTINCT FROM OLD.change_given
     OR NEW.settled_by_staff_id IS DISTINCT FROM OLD.settled_by_staff_id
     OR NEW.handled_by_staff_id IS DISTINCT FROM OLD.handled_by_staff_id THEN
    RAISE EXCEPTION 'A payment record is immutable except for voiding (payment %).', OLD.id;
  END IF;

  -- voids are permanent — never allow reversing back to completed
  IF OLD.status = 'voided' AND NEW.status <> 'voided' THEN
    RAISE EXCEPTION 'A voided payment cannot be un-voided (payment %).', OLD.id;
  END IF;

  NEW.updated_at := now();

  -- on the completed -> voided transition, stamp who/when authoritatively
  IF NEW.status = 'voided' AND OLD.status <> 'voided' THEN
    -- resolve the acting staff from the SESSION (Option 1), scoped to the
    -- payment's restaurant. Never client-set.
    IF v_uid IS NOT NULL THEN
      SELECT tm.id, tm.full_name, r.key
        INTO v_staff, NEW.voided_by_name, NEW.voided_by_role
      FROM public.team_members tm
      LEFT JOIN public.roles r ON r.id = tm.role_id
      WHERE tm.user_id = v_uid
        AND tm.restaurant_id = OLD.restaurant_id
        AND tm.status = 'active'
      LIMIT 1;
    END IF;

    NEW.voided_at := now();
    NEW.voided_by_staff_id := v_staff;              -- session-derived, not client-set
    IF v_staff IS NULL AND v_uid IS NOT NULL THEN
      -- the owner (a real auth user, no staff row)
      SELECT p.full_name, 'owner'
        INTO NEW.voided_by_name, NEW.voided_by_role
      FROM public.profiles p
      WHERE p.id = v_uid;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payments_stamp_void ON public.payments;
CREATE TRIGGER trg_payments_stamp_void
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.stamp_payment_void();

-- ---------- policies (Option-1: DB-lookup helpers from M9) ----------
-- Read: any member of the restaurant.
DROP POLICY IF EXISTS "Members read payments" ON public.payments;
CREATE POLICY "Members read payments" ON public.payments
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());

-- Record a payment: any active staff in the restaurant.
DROP POLICY IF EXISTS "Staff record payments" ON public.payments;
CREATE POLICY "Staff record payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = public.current_restaurant_id());

-- Update (i.e. void): manager/owner only — mirrors the approval model.
DROP POLICY IF EXISTS "Managers void payments" ON public.payments;
CREATE POLICY "Managers void payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());
