-- ============================================================================
-- Migration 7 — approval-gated change requests
-- ----------------------------------------------------------------------------
-- Recap §3: staff edit orders freely BEFORE the kitchen starts (status pending).
-- Once preparing/served/paid, a cancel/edit/void becomes a REQUEST needing
-- owner/manager approval. Any active staff can REQUEST; only manager/owner can
-- DECIDE. Everything is logged: who requested, who decided, when, why.
--
-- Attribution uses the same session-derived, spoof-proof snapshot pattern as
-- M5/M6 for both requested_by and decided_by.
--
-- Reuses : public.orders, public.payments, public.team_members, public.roles,
--          public.profiles, public.current_restaurant_id(),
--          public.current_staff_id(), public.is_manager_or_owner()
-- Alters : adds order_change_requests to the realtime publication
-- Creates: public.order_change_requests (+ 3 trigger functions)
-- ============================================================================

CREATE TABLE public.order_change_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  order_id      UUID NOT NULL,

  action        TEXT NOT NULL CHECK (action IN ('cancel', 'edit', 'void_payment')),
  -- void_payment targets a specific payment; edit carries the proposed changes
  payment_id    UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  requested_changes JSONB,                    -- for 'edit': proposed new items/qty/etc.
  reason        TEXT,                          -- dropdown reason
  note          TEXT,                          -- free-text note

  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),

  -- the order's status the moment a cancel/edit request was raised, so a REJECT
  -- can restore it (a cancellation_pending order no longer remembers 'preparing')
  order_prior_status TEXT,

  -- who raised it (session-derived snapshot)
  requested_by_staff_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  requested_by_name     TEXT,
  requested_by_role     TEXT,

  -- who decided it (session-derived snapshot)
  decided_by_staff_id   UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  decided_by_name       TEXT,
  decided_by_role       TEXT,
  decided_at            TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- a void_payment request must name the payment it voids
  CONSTRAINT ocr_void_needs_payment
    CHECK (action <> 'void_payment' OR payment_id IS NOT NULL),

  -- the request's order must live in the same restaurant
  CONSTRAINT ocr_order_fk FOREIGN KEY (order_id, restaurant_id)
    REFERENCES public.orders (id, restaurant_id) ON DELETE CASCADE
);

-- Requests are audit records: no DELETE for anon/authenticated.
GRANT SELECT, INSERT, UPDATE ON public.order_change_requests TO authenticated;
GRANT ALL ON public.order_change_requests TO service_role;
ALTER TABLE public.order_change_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_ocr_restaurant ON public.order_change_requests (restaurant_id);
CREATE INDEX idx_ocr_order      ON public.order_change_requests (order_id);
CREATE INDEX idx_ocr_status     ON public.order_change_requests (status);

-- ============================================================================
-- trigger 1 (BEFORE INSERT): stamp the requester, force pending, run the
--                            auto-approval hook.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.stamp_change_request_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- a request always starts pending & undecided; decided_* filled only on decision
  NEW.status            := 'pending';
  NEW.decided_by_staff_id := NULL;
  NEW.decided_by_name   := NULL;
  NEW.decided_by_role   := NULL;
  NEW.decided_at        := NULL;

  -- authoritative requester from the session (not client input)
  NEW.requested_by_staff_id := public.current_staff_id();
  IF NEW.requested_by_staff_id IS NOT NULL THEN
    SELECT tm.full_name, r.key
      INTO NEW.requested_by_name, NEW.requested_by_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.id = NEW.requested_by_staff_id;
  ELSE
    -- owner raising a request (rare — they can usually just act)
    SELECT p.full_name, 'owner'
      INTO NEW.requested_by_name, NEW.requested_by_role
    FROM public.profiles p WHERE p.id = auth.uid();
  END IF;

  -- capture the order's current status for cancel/edit so a reject can restore
  -- it. (Null it out if the order is already in a transient/terminal state — a
  -- redundant second request; the app enforces one open request per order.)
  IF NEW.action IN ('cancel', 'edit') THEN
    SELECT o.status INTO NEW.order_prior_status
    FROM public.orders o WHERE o.id = NEW.order_id;
    IF NEW.order_prior_status IN ('cancellation_pending', 'edit_pending', 'cancelled') THEN
      NEW.order_prior_status := NULL;
    END IF;
  END IF;

  -- ┌── AUTO-APPROVAL HOOK (wired in M8) ────────────────────────────────────┐
  -- │ When restaurant_settings.auto_approval exists, evaluate it HERE against  │
  -- │ this request (e.g. action='cancel' AND the order is unpaid AND total <   │
  -- │ threshold) and, if it qualifies, set NEW.status := 'approved' and stamp  │
  -- │ decided_by as a system decision, so the AFTER-trigger executes it        │
  -- │ immediately without a manager. Deliberately NOT hardcoded here.          │
  -- └─────────────────────────────────────────────────────────────────────────┘

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ocr_stamp_creator ON public.order_change_requests;
CREATE TRIGGER trg_ocr_stamp_creator
  BEFORE INSERT ON public.order_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.stamp_change_request_creator();

-- ============================================================================
-- trigger 1b (AFTER INSERT): move the order into its pending state so the
-- kitchen sees it and stops committing resources while approval is pending.
--   cancel -> cancellation_pending    edit -> edit_pending
-- Only transitions an order that is still active (not already pending/terminal).
-- void_payment does not touch the order status.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_order_pending_on_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.action = 'cancel' THEN
    UPDATE public.orders
       SET status = 'cancellation_pending'
     WHERE id = NEW.order_id
       AND status NOT IN ('cancellation_pending', 'edit_pending', 'cancelled');
  ELSIF NEW.action = 'edit' THEN
    UPDATE public.orders
       SET status = 'edit_pending'
     WHERE id = NEW.order_id
       AND status NOT IN ('cancellation_pending', 'edit_pending', 'cancelled');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ocr_set_pending ON public.order_change_requests;
CREATE TRIGGER trg_ocr_set_pending
  AFTER INSERT ON public.order_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_order_pending_on_request();

-- ============================================================================
-- trigger 2 (BEFORE UPDATE): enforce final decisions + no self-approval, and
--                            stamp the decider from the session.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.decide_change_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff    uuid;
  v_is_owner boolean;
BEGIN
  NEW.updated_at := now();

  -- decisions are final: once approved/rejected, the outcome can't change
  IF OLD.status <> 'pending' AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Change request % was already %; decisions are final.',
      OLD.id, OLD.status;
  END IF;

  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    v_staff := public.current_staff_id();
    v_is_owner := EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = OLD.restaurant_id AND r.owner_id = auth.uid()
    );

    -- no self-approval: a manager can't decide their own request; owner always may
    IF NOT v_is_owner
       AND v_staff IS NOT NULL
       AND v_staff = OLD.requested_by_staff_id THEN
      RAISE EXCEPTION 'You cannot decide your own change request.';
    END IF;

    -- stamp the decider authoritatively from the session
    NEW.decided_at         := now();
    NEW.decided_by_staff_id := v_staff;
    IF v_staff IS NOT NULL THEN
      SELECT tm.full_name, r.key
        INTO NEW.decided_by_name, NEW.decided_by_role
      FROM public.team_members tm
      LEFT JOIN public.roles r ON r.id = tm.role_id
      WHERE tm.id = v_staff;
    ELSE
      SELECT p.full_name, 'owner'
        INTO NEW.decided_by_name, NEW.decided_by_role
      FROM public.profiles p WHERE p.id = auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ocr_decide ON public.order_change_requests;
CREATE TRIGGER trg_ocr_decide
  BEFORE UPDATE ON public.order_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.decide_change_request();

-- ============================================================================
-- trigger 3 (AFTER UPDATE): resolve a decided request atomically.
--   APPROVE:
--     void_payment -> flip the payment to 'voided' (M6's trigger then records
--                     the approver as the voider)
--     cancel       -> flip the order to 'cancelled'
--     edit         -> applied by the app/edge (rebuilds order_items from
--                     requested_changes, recomputes totals, re-notifies kitchen);
--                     the app MUST re-verify status='approved' server-side first.
--   REJECT:
--     cancel/edit  -> restore the order to its captured prior status (the recap's
--                     "rejected returns the order to active with the reason").
-- All updates are idempotent (guarded), so a belt-and-braces app re-apply is safe.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.apply_approved_change_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    IF NEW.action = 'void_payment' AND NEW.payment_id IS NOT NULL THEN
      UPDATE public.payments
         SET status = 'voided'
       WHERE id = NEW.payment_id
         AND status <> 'voided';
    ELSIF NEW.action = 'cancel' THEN
      UPDATE public.orders
         SET status = 'cancelled'
       WHERE id = NEW.order_id
         AND status <> 'cancelled';
    END IF;
    -- 'edit' is intentionally left to the app/edge layer. The order stays in
    -- 'edit_pending' until the app applies the change and sets the final status.

  ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    -- return the order to how it was before the request (only if still parked in
    -- the transient state and we captured a prior status).
    IF NEW.action IN ('cancel', 'edit') AND NEW.order_prior_status IS NOT NULL THEN
      UPDATE public.orders
         SET status = NEW.order_prior_status
       WHERE id = NEW.order_id
         AND status IN ('cancellation_pending', 'edit_pending');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ocr_apply ON public.order_change_requests;
CREATE TRIGGER trg_ocr_apply
  AFTER UPDATE ON public.order_change_requests
  FOR EACH ROW EXECUTE FUNCTION public.apply_approved_change_request();

-- ============================================================================
-- policies (claim-aware)
-- ============================================================================
-- Read: any member of the restaurant (a requester sees their request's status;
-- managers see the whole approval queue).
CREATE POLICY "Members read change requests" ON public.order_change_requests
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());

-- Request: any active staff in the restaurant may insert. (requested_by and
-- status are overwritten by the insert trigger, so client values can't lie.)
CREATE POLICY "Staff raise change requests" ON public.order_change_requests
  FOR INSERT TO authenticated
  WITH CHECK (restaurant_id = public.current_restaurant_id());

-- Decide: manager/owner only.
CREATE POLICY "Managers decide change requests" ON public.order_change_requests
  FOR UPDATE TO authenticated
  USING (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner())
  WITH CHECK (restaurant_id = public.current_restaurant_id() AND public.is_manager_or_owner());

-- Realtime: the approval queue updates live for the owner/manager (reuses the
-- existing notification/subscription system).
ALTER TABLE public.order_change_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_change_requests;
