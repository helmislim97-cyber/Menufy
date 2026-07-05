-- ============================================================================
-- Migration 8 — restaurant_settings + auto-approval wiring
-- ----------------------------------------------------------------------------
-- Recap §8/§3: the owner chooses how the kitchen receives orders (screen vs
-- printer) and can set auto-approval thresholds so small, low-risk changes skip
-- the approval queue. This migration creates restaurant_settings, seeds/backfills
-- it, and finally WIRES the auto-approval hook that M7 left as a placeholder.
--
-- Reuses : public.restaurants, public.orders, public.on_restaurant_created(),
--          public.update_updated_at_column(), M7's change-request triggers,
--          public.current_restaurant_id()
-- Alters : public.on_restaurant_created() (also seed settings);
--          REPLACES three M7 trigger fns to add the auto-approval hook + a
--          shared executor.
-- Creates: public.restaurant_settings, qualifies_for_auto_approval(),
--          execute_change_request()
-- ============================================================================

-- ---------- 1. restaurant_settings (one row per restaurant) ----------
CREATE TABLE public.restaurant_settings (
  restaurant_id UUID PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,

  -- how the kitchen receives orders
  kitchen_mode  TEXT NOT NULL DEFAULT 'screen'
                  CHECK (kitchen_mode IN ('screen', 'printer')),
  -- printer wiring/endpoint (IP, cloud endpoint, paper width, ...). NOTE: do not
  -- store printer *credentials* here — this is readable by staff; secrets belong
  -- in a service-role-only store like staff_pins.
  printer_config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- auto-approval thresholds, e.g.:
  --   {"enabled": true, "cancel": {"enabled": true, "max_unpaid_total": 20}}
  -- Empty/absent => everything needs manual approval (safe default).
  auto_approval  JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.restaurant_settings TO authenticated;
GRANT ALL ON public.restaurant_settings TO service_role;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_restaurant_settings_updated ON public.restaurant_settings;
CREATE TRIGGER trg_restaurant_settings_updated BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- read: any member of the restaurant (kitchen staff need kitchen_mode, etc.)
CREATE POLICY "Members read settings" ON public.restaurant_settings
  FOR SELECT TO authenticated
  USING (restaurant_id = public.current_restaurant_id());

-- write: OWNER ONLY. auto_approval bypasses the theft controls, so it must not
-- be manager-editable — a manager could raise their own threshold. Owner is the
-- real auth user (restaurants.owner_id), not a PIN role.
CREATE POLICY "Owner manages settings" ON public.restaurant_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));

-- ---------- 2. seed on restaurant creation + backfill ----------
-- Extend the M1 trigger fn so a new restaurant also gets a settings row.
CREATE OR REPLACE FUNCTION public.on_restaurant_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_default_roles(NEW.id);
  INSERT INTO public.restaurant_settings (restaurant_id)
  VALUES (NEW.id)
  ON CONFLICT (restaurant_id) DO NOTHING;
  RETURN NEW;
END;
$$;

INSERT INTO public.restaurant_settings (restaurant_id)
SELECT id FROM public.restaurants
ON CONFLICT (restaurant_id) DO NOTHING;

-- ============================================================================
-- 3. auto-approval wiring
-- ============================================================================

-- Does a freshly-raised request qualify to skip manual approval? Configurable
-- per restaurant via auto_approval. void_payment NEVER auto-approves (highest
-- theft-risk action). Only unpaid orders under the configured threshold qualify.
CREATE OR REPLACE FUNCTION public.qualifies_for_auto_approval(
  _restaurant_id uuid, _action text, _order_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cfg    jsonb;
  v_total  numeric;
  v_status text;
  v_thresh numeric;
BEGIN
  IF _action = 'void_payment' THEN
    RETURN false;                       -- never auto-approve a payment void
  END IF;

  SELECT auto_approval INTO v_cfg
  FROM public.restaurant_settings WHERE restaurant_id = _restaurant_id;

  IF v_cfg IS NULL OR COALESCE((v_cfg->>'enabled')::boolean, false) = false THEN
    RETURN false;
  END IF;

  IF COALESCE((v_cfg->_action->>'enabled')::boolean, false) = false THEN
    RETURN false;
  END IF;

  SELECT o.total, o.status INTO v_total, v_status
  FROM public.orders o WHERE o.id = _order_id;

  v_thresh := (v_cfg->_action->>'max_unpaid_total')::numeric;

  -- only unpaid orders strictly under the threshold
  RETURN v_status <> 'paid'
         AND v_thresh IS NOT NULL
         AND v_total < v_thresh;
END;
$$;

-- Shared executor for an APPROVED request (called from both the auto-approval
-- path at insert and the manual-approval path at update). Idempotent.
CREATE OR REPLACE FUNCTION public.execute_change_request(
  _action text, _order_id uuid, _payment_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _action = 'void_payment' AND _payment_id IS NOT NULL THEN
    UPDATE public.payments SET status = 'voided'
     WHERE id = _payment_id AND status <> 'voided';
  ELSIF _action = 'cancel' THEN
    UPDATE public.orders SET status = 'cancelled'
     WHERE id = _order_id AND status <> 'cancelled';
  END IF;
  -- 'edit' is applied by the app/edge (after re-verifying approval server-side).
END;
$$;

-- Replace M7's BEFORE INSERT stamp fn: same requester-stamping + prior-status
-- capture, now with the auto-approval hook actually wired in.
CREATE OR REPLACE FUNCTION public.stamp_change_request_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.status              := 'pending';
  NEW.decided_by_staff_id := NULL;
  NEW.decided_by_name     := NULL;
  NEW.decided_by_role     := NULL;
  NEW.decided_at          := NULL;

  NEW.requested_by_staff_id := public.current_staff_id();
  IF NEW.requested_by_staff_id IS NOT NULL THEN
    SELECT tm.full_name, r.key
      INTO NEW.requested_by_name, NEW.requested_by_role
    FROM public.team_members tm
    LEFT JOIN public.roles r ON r.id = tm.role_id
    WHERE tm.id = NEW.requested_by_staff_id;
  ELSE
    SELECT p.full_name, 'owner'
      INTO NEW.requested_by_name, NEW.requested_by_role
    FROM public.profiles p WHERE p.id = auth.uid();
  END IF;

  IF NEW.action IN ('cancel', 'edit') THEN
    SELECT o.status INTO NEW.order_prior_status
    FROM public.orders o WHERE o.id = NEW.order_id;
    IF NEW.order_prior_status IN ('cancellation_pending', 'edit_pending', 'cancelled') THEN
      NEW.order_prior_status := NULL;
    END IF;
  END IF;

  -- AUTO-APPROVAL HOOK (now wired): if it qualifies, mark approved + system-stamp.
  -- Execution happens in the AFTER INSERT trigger (which sees status='approved').
  IF public.qualifies_for_auto_approval(NEW.restaurant_id, NEW.action, NEW.order_id) THEN
    NEW.status             := 'approved';
    NEW.decided_at         := now();
    NEW.decided_by_staff_id := NULL;
    NEW.decided_by_name    := 'Auto-approval';
    NEW.decided_by_role    := 'system';
  END IF;

  RETURN NEW;
END;
$$;

-- Replace M7's AFTER INSERT fn: auto-approved requests execute immediately;
-- otherwise the order is parked in its pending state.
CREATE OR REPLACE FUNCTION public.set_order_pending_on_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    -- auto-approved at creation: execute now, don't park in a pending state
    PERFORM public.execute_change_request(NEW.action, NEW.order_id, NEW.payment_id);
  ELSIF NEW.action = 'cancel' THEN
    UPDATE public.orders SET status = 'cancellation_pending'
     WHERE id = NEW.order_id
       AND status NOT IN ('cancellation_pending', 'edit_pending', 'cancelled');
  ELSIF NEW.action = 'edit' THEN
    UPDATE public.orders SET status = 'edit_pending'
     WHERE id = NEW.order_id
       AND status NOT IN ('cancellation_pending', 'edit_pending', 'cancelled');
  END IF;
  RETURN NEW;
END;
$$;

-- Replace M7's AFTER UPDATE fn to use the shared executor (behaviour unchanged).
CREATE OR REPLACE FUNCTION public.apply_approved_change_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    PERFORM public.execute_change_request(NEW.action, NEW.order_id, NEW.payment_id);
  ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    IF NEW.action IN ('cancel', 'edit') AND NEW.order_prior_status IS NOT NULL THEN
      UPDATE public.orders SET status = NEW.order_prior_status
       WHERE id = NEW.order_id
         AND status IN ('cancellation_pending', 'edit_pending');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
