-- ============================================================================
-- Slice 4 — server-authoritative apply for 'edit' change requests
-- ----------------------------------------------------------------------------
-- M7 deliberately left 'edit' apply "to the app". That's an anti-theft hole:
-- a client could apply changes that differ from what was approved, or apply
-- with no approval at all. This migration moves the apply INTO the DB (the
-- client only PROPOSES; the trigger ENFORCES) — the same principle as every
-- other guarantee in this system.
--
-- MVP edit = line-item QUANTITY changes on existing items, incl. to<=0 = remove.
-- No new items (needs a menu picker — later), no price edits (impossible here:
-- the total is recomputed from the stored snapshot prices, never client input).
--
-- requested_changes shape (client proposes; only `to` is applied):
--   { "kind":"line_quantities",
--     "lines":[ {"order_item_id":"…","name":"Pizza","price":12.5,"from":3,"to":1},
--               {"order_item_id":"…","name":"Coke","price":3.0,"from":2,"to":0} ] }
--
-- Anti-theft:
--   * A PAID / settled order can NEVER be edited — blocked at REQUEST time
--     (stamp_change_request_creator) AND re-checked at APPLY time. To change a
--     paid order you void the payment first (its own approval-gated action).
--   * Quantities only; total = SUM(order_items.product_price * quantity) from the
--     table, so prices/totals can't be forged.
--   * Every order_item write is scoped to the request's order_id (no touching
--     another order's items via a forged id).
--   * Full attribution (requested_by / decided_by / reason / before→after lines)
--     and no self-approval — unchanged from M7.
--
-- This migration CREATE-OR-REPLACEs two existing M7 functions (adds behaviour,
-- preserves the rest) and swaps the Slice-3 cancel-only duplicate index for a
-- combined cancel+edit one (an order can't be both cancel- and edit-pending).
--
-- ⚠️  PRE-CHECK — RUN BEFORE APPLYING:
--       -- (a) no order already has two open cancel/edit requests (would break the
--       --     combined unique index). expected: 0 rows.
--       select order_id, count(*) from public.order_change_requests
--       where action in ('cancel','edit') and status='pending'
--       group by order_id having count(*) > 1;
--
--       -- (b) the two M7 functions exist to be replaced. expected: both.
--       select proname from pg_proc
--       where proname in ('apply_approved_change_request','stamp_change_request_creator');
--
--       -- (c) any pre-existing edit requests (UI not built yet). expected: empty.
--       select id, status, order_id from public.order_change_requests where action='edit';
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. request-time guard: reject an 'edit' on a settled order (+ existing logic)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.stamp_change_request_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_staff_id uuid;
BEGIN
  -- a request always starts pending & undecided
  NEW.status              := 'pending';
  NEW.decided_by_staff_id := NULL;
  NEW.decided_by_name     := NULL;
  NEW.decided_by_role     := NULL;
  NEW.decided_at          := NULL;

  -- authoritative requester from the session (Option 1), scoped to this restaurant
  IF v_uid IS NOT NULL THEN
    SELECT tm.id INTO v_staff_id
    FROM public.team_members tm
    WHERE tm.user_id = v_uid
      AND tm.restaurant_id = NEW.restaurant_id
      AND tm.status = 'active'
    LIMIT 1;
  END IF;

  NEW.requested_by_staff_id := v_staff_id;
  IF v_staff_id IS NOT NULL THEN
    SELECT tm.full_name, r.key
      INTO NEW.requested_by_name, NEW.requested_by_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.id = v_staff_id;
  ELSIF v_uid IS NOT NULL THEN
    SELECT p.full_name, 'owner'
      INTO NEW.requested_by_name, NEW.requested_by_role
    FROM public.profiles p WHERE p.id = v_uid;
  END IF;

  -- HARD-BLOCK editing a settled order (anti-theft): to change a paid order you
  -- void the payment first. Checked here at request time and again at apply.
  IF NEW.action = 'edit' THEN
    IF EXISTS (SELECT 1 FROM public.orders o WHERE o.id = NEW.order_id AND o.status = 'paid')
       OR EXISTS (SELECT 1 FROM public.payments p WHERE p.order_id = NEW.order_id AND p.status = 'completed') THEN
      RAISE EXCEPTION 'Cannot edit a paid order. Void the payment first.';
    END IF;
  END IF;

  -- capture prior status for cancel/edit so a reject (or edit apply) can restore it
  IF NEW.action IN ('cancel', 'edit') THEN
    SELECT o.status INTO NEW.order_prior_status
    FROM public.orders o WHERE o.id = NEW.order_id;
    IF NEW.order_prior_status IN ('cancellation_pending', 'edit_pending', 'cancelled') THEN
      NEW.order_prior_status := NULL;
    END IF;
  END IF;

  -- ┌── AUTO-APPROVAL HOOK (wired in M8) — unchanged placeholder ─────────────┐
  -- └─────────────────────────────────────────────────────────────────────────┘

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. apply: add the server-authoritative 'edit' branch (+ existing logic)
-- ---------------------------------------------------------------------------
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

    ELSIF NEW.action = 'edit' THEN
      -- Belt-and-braces: never apply an edit to a settled order.
      IF EXISTS (SELECT 1 FROM public.orders o WHERE o.id = NEW.order_id AND o.status = 'paid')
         OR EXISTS (SELECT 1 FROM public.payments p WHERE p.order_id = NEW.order_id AND p.status = 'completed') THEN
        RAISE EXCEPTION 'Cannot apply an edit to a paid order.';
      END IF;

      -- remove lines whose target quantity is <= 0 (scoped to THIS order)
      DELETE FROM public.order_items oi
      USING jsonb_array_elements(COALESCE(NEW.requested_changes->'lines', '[]'::jsonb)) AS l
      WHERE oi.order_id = NEW.order_id
        AND oi.id = (l->>'order_item_id')::uuid
        AND COALESCE((l->>'to')::int, 0) <= 0;

      -- set the new quantity on lines with target > 0 (scoped to THIS order)
      UPDATE public.order_items oi
         SET quantity = (l->>'to')::int
      FROM jsonb_array_elements(COALESCE(NEW.requested_changes->'lines', '[]'::jsonb)) AS l
      WHERE oi.order_id = NEW.order_id
        AND oi.id = (l->>'order_item_id')::uuid
        AND (l->>'to')::int > 0;

      -- recompute the total from SNAPSHOT prices and restore the order to its
      -- pre-edit status so the floor/kitchen see the updated order again.
      UPDATE public.orders o
         SET total = COALESCE(
               (SELECT SUM(oi.product_price * oi.quantity)
                  FROM public.order_items oi WHERE oi.order_id = o.id), 0),
             status = COALESCE(NEW.order_prior_status, 'pending')
       WHERE o.id = NEW.order_id;
    END IF;

  ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    -- restore the order to how it was before the request
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

-- ---------------------------------------------------------------------------
-- 3. duplicate guard: one open cancel-OR-edit request per order
--    (replaces the Slice-3 cancel-only index; void_payment keeps its own index)
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS public.ocr_one_open_cancel_per_order;
CREATE UNIQUE INDEX IF NOT EXISTS ocr_one_open_orderchange_per_order
  ON public.order_change_requests (order_id)
  WHERE action IN ('cancel', 'edit') AND status = 'pending';
