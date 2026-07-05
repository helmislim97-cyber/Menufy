-- ============================================================================
-- Migration 6 — payments as full events (not a boolean)
-- ----------------------------------------------------------------------------
-- Recap §11: payment is stored as an event capturing method, amounts, the
-- cashier who settled it and the waiter who carried the cash, plus timestamp —
-- the data that makes end-of-shift reconciliation and anti-theft possible.
--
-- Audit-survival design (same philosophy as M5):
--   * settled_by / handled_by / voided_by each keep a live FK (ON DELETE SET
--     NULL) AND a permanent name+role SNAPSHOT, filled authoritatively by a
--     trigger from the staff_id — survives a hard-delete and can't be spoofed.
--   * Payments are NEVER hard-deleted: no DELETE grant. A void is a status
--     change to 'voided' (who/when stamped), and voids are irreversible.
--
-- Reuses : public.orders, public.team_members, public.roles, public.profiles,
--          public.current_restaurant_id(), public.current_staff_id(),
--          public.is_manager_or_owner()
-- Alters : public.orders (adds composite UNIQUE(id, restaurant_id))
-- Creates: public.payments (+ two trigger functions)
-- ============================================================================

-- Composite unique key so payments.(order_id, restaurant_id) can be a composite
-- FK — guaranteeing a payment's restaurant matches its order's restaurant.
-- (id is already unique via the PK, so this never fails on existing data.)
ALTER TABLE public.orders
  ADD CONSTRAINT orders_id_restaurant_uk UNIQUE (id, restaurant_id);

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

  -- who settled it (cashier): FK link + permanent snapshot
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

CREATE INDEX idx_payments_restaurant ON public.payments (restaurant_id);
CREATE INDEX idx_payments_order      ON public.payments (order_id);
CREATE INDEX idx_payments_settled_by ON public.payments (settled_by_staff_id);
CREATE INDEX idx_payments_handled_by ON public.payments (handled_by_staff_id);

-- ---------- trigger 1: snapshot handlers on insert (authoritative) ----------
CREATE OR REPLACE FUNCTION public.snapshot_payment_handlers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- payments always start 'completed'; voiding is a separate, gated UPDATE
  NEW.status := 'completed';

  IF NEW.settled_by_staff_id IS NOT NULL THEN
    SELECT tm.full_name, r.key
      INTO NEW.settled_by_name, NEW.settled_by_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.id = NEW.settled_by_staff_id;
  END IF;

  IF NEW.handled_by_staff_id IS NOT NULL THEN
    SELECT tm.full_name, r.key
      INTO NEW.handled_by_name, NEW.handled_by_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.id = NEW.handled_by_staff_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payments_snapshot_handlers ON public.payments;
CREATE TRIGGER trg_payments_snapshot_handlers
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_payment_handlers();

-- ---------- trigger 2: stamp + protect the void on update ----------
CREATE OR REPLACE FUNCTION public.stamp_payment_void()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff uuid;
BEGIN
  NEW.updated_at := now();

  -- voids are permanent — never allow reversing back to completed
  IF OLD.status = 'voided' AND NEW.status <> 'voided' THEN
    RAISE EXCEPTION 'A voided payment cannot be un-voided (payment %).', OLD.id;
  END IF;

  -- on the completed -> voided transition, stamp who/when authoritatively
  IF NEW.status = 'voided' AND OLD.status <> 'voided' THEN
    v_staff := public.current_staff_id();
    NEW.voided_at := now();
    NEW.voided_by_staff_id := v_staff;              -- session-derived, not client-set
    IF v_staff IS NOT NULL THEN
      SELECT tm.full_name, r.key
        INTO NEW.voided_by_name, NEW.voided_by_role
      FROM public.team_members tm
      LEFT JOIN public.roles r ON r.id = tm.role_id
      WHERE tm.id = v_staff;
    ELSE
      -- the owner (a real auth user, no staff row)
      SELECT p.full_name, 'owner'
        INTO NEW.voided_by_name, NEW.voided_by_role
      FROM public.profiles p
      WHERE p.id = auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payments_stamp_void ON public.payments;
CREATE TRIGGER trg_payments_stamp_void
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.stamp_payment_void();

-- ---------- policies (claim-aware) ----------
-- Read: any member of the restaurant.
CREATE POLICY "Members read payments" ON public.payments
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());

-- Record a payment: any active staff in the restaurant.
CREATE POLICY "Staff record payments" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = public.current_restaurant_id());

-- Update (i.e. void): manager/owner only — mirrors the approval model.
CREATE POLICY "Managers void payments" ON public.payments
  FOR UPDATE TO authenticated
  USING (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());
