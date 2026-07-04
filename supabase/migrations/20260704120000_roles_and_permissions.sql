-- ============================================================================
-- Migration 1 — Roles & granular permissions
-- ----------------------------------------------------------------------------
-- Adds a per-restaurant `roles` table. Each restaurant gets 5 built-in system
-- roles (owner, manager, cashier, waiter, kitchen) plus any custom roles the
-- owner creates. Every role carries:
--   * landing_screen  — where a staff PIN opens directly into
--   * permissions      — a jsonb tree (see contract below)
--
-- The 5 system roles are seeded automatically whenever a restaurant is created
-- (trigger on public.restaurants) and backfilled for every existing restaurant.
--
-- Reuses : public.restaurants, public.update_updated_at_column()
-- Creates: public.roles, seed_default_roles(), on_restaurant_created()
-- Alters : nothing (fully additive)
--
-- ----------------------------------------------------------------------------
-- PERMISSIONS CONTRACT (read by the frontend Roles screen + staff overrides)
-- ----------------------------------------------------------------------------
-- The stable identifier the code compares against is `key` (english slug).
-- `name` is only a display label (French here; move to i18n freely later).
--
-- permissions = {
--   "screens": {            -- section -> item -> boolean (mirrors the sidebar)
--     "activity":   { "home", "orders", "assistance", "loyalty" },
--     "management": { "menu", "tables", "appearance", "info", "notifications", "roles" },
--     "statistics": { "recap", "daily_report", "orders_stats", "sales" },
--     "account":    { "profile", "password", "contact", "help" }
--   },
--   "actions": {            -- capability toggles (the PDF permissions matrix)
--     "view_menu_prices", "edit_menu", "place_manual_order",
--     "edit_order_before_kitchen", "request_committed_change",
--     "mark_paid", "move_ticket", "view_payment_totals", "view_analytics",
--     "approve_requests",
--     "manage_staff",       -- add/remove people, set PIN, assign an existing role
--     "manage_roles"        -- create/edit/delete role DEFINITIONS & their toggles
--   }
-- }
--
-- A staff member's per-person `permission_overrides` (added in M2) uses the
-- SAME paths and is deep-merged per leaf over their role's permissions, so any
-- single item (e.g. screens.management.roles, or actions.mark_paid) can be
-- flipped for one person without affecting the role or other staff.
-- ============================================================================

-- ---------- roles table ----------
CREATE TABLE public.roles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  key            TEXT NOT NULL,                  -- STABLE identifier: 'owner'|'manager'|'cashier'|'waiter'|'kitchen' or a custom slug
  name           TEXT NOT NULL,                  -- display label only (editable / i18n)
  is_system      BOOLEAN NOT NULL DEFAULT false, -- built-ins cannot be deleted
  landing_screen TEXT NOT NULL DEFAULT 'dashboard'
                 CHECK (landing_screen IN ('dashboard','waiter','cashier','kitchen')),
  permissions    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_roles_restaurant ON public.roles (restaurant_id);

-- ---------- policies ----------
-- Any member of the restaurant (owner or staff) may read its roles — the UI
-- needs them to resolve what each person can see.
CREATE POLICY "Restaurant members read roles" ON public.roles
  FOR SELECT TO authenticated
  USING (public.has_restaurant_access(auth.uid(), restaurant_id));

-- Only the restaurant owner may create / edit / delete role DEFINITIONS.
-- (Managers manage *people*, not role definitions — enforced via the
--  `manage_roles` action, which only the owner role has by default.)
-- Refined in the RLS-hardening migration once JWT-claim helpers exist.
CREATE POLICY "Owner manages roles" ON public.roles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));

-- ============================================================================
-- Default-role seeding
-- ============================================================================
-- Idempotent: safe to call repeatedly (ON CONFLICT DO NOTHING on the unique
-- (restaurant_id, key)). Called by the trigger below and by the backfill.
CREATE OR REPLACE FUNCTION public.seed_default_roles(_restaurant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.roles (restaurant_id, key, name, is_system, landing_screen, permissions)
  VALUES
    -- ----- OWNER : full control -----
    (_restaurant_id, 'owner', 'Propriétaire', true, 'dashboard', '{
      "screens": {
        "activity":   {"home": true, "orders": true, "assistance": true, "loyalty": true},
        "management": {"menu": true, "tables": true, "appearance": true, "info": true, "notifications": true, "roles": true},
        "statistics": {"recap": true, "daily_report": true, "orders_stats": true, "sales": true},
        "account":    {"profile": true, "password": true, "contact": true, "help": true}
      },
      "actions": {
        "view_menu_prices": true, "edit_menu": true, "place_manual_order": true,
        "edit_order_before_kitchen": true, "request_committed_change": true,
        "mark_paid": true, "move_ticket": true, "view_payment_totals": true,
        "view_analytics": true, "approve_requests": true,
        "manage_staff": true, "manage_roles": true
      }
    }'::jsonb),

    -- ----- MANAGER (Gérant) : full access except billing.
    --        CAN manage staff (sees the Team/Roles screen, manage_staff = true);
    --        CANNOT edit role definitions (manage_roles = false). -----
    (_restaurant_id, 'manager', 'Gérant', true, 'dashboard', '{
      "screens": {
        "activity":   {"home": true, "orders": true, "assistance": true, "loyalty": true},
        "management": {"menu": true, "tables": true, "appearance": true, "info": true, "notifications": true, "roles": true},
        "statistics": {"recap": true, "daily_report": true, "orders_stats": true, "sales": true},
        "account":    {"profile": true, "password": true, "contact": true, "help": true}
      },
      "actions": {
        "view_menu_prices": true, "edit_menu": true, "place_manual_order": true,
        "edit_order_before_kitchen": true, "request_committed_change": true,
        "mark_paid": false, "move_ticket": true, "view_payment_totals": true,
        "view_analytics": true, "approve_requests": true,
        "manage_staff": true, "manage_roles": false
      }
    }'::jsonb),

    -- ----- CASHIER : payment & checkout, opens straight to the cashier screen -----
    (_restaurant_id, 'cashier', 'Caissier', true, 'cashier', '{
      "screens": {
        "activity":   {"home": false, "orders": false, "assistance": false, "loyalty": false},
        "management": {"menu": false, "tables": false, "appearance": false, "info": false, "notifications": false, "roles": false},
        "statistics": {"recap": false, "daily_report": false, "orders_stats": false, "sales": false},
        "account":    {"profile": false, "password": false, "contact": false, "help": false}
      },
      "actions": {
        "view_menu_prices": true, "edit_menu": false, "place_manual_order": true,
        "edit_order_before_kitchen": true, "request_committed_change": true,
        "mark_paid": true, "move_ticket": false, "view_payment_totals": true,
        "view_analytics": false, "approve_requests": false,
        "manage_staff": false, "manage_roles": false
      }
    }'::jsonb),

    -- ----- WAITER : tables & order entry, opens straight to the waiter screen -----
    -- mark_paid defaults OFF = central-cashier model. It is a plain jsonb leaf,
    -- so the owner can flip it ON for THIS role (waiter=cashier beach-bar model)
    -- or ON for a single person via their permission_overrides (M2).
    (_restaurant_id, 'waiter', 'Serveur', true, 'waiter', '{
      "screens": {
        "activity":   {"home": false, "orders": false, "assistance": false, "loyalty": false},
        "management": {"menu": false, "tables": false, "appearance": false, "info": false, "notifications": false, "roles": false},
        "statistics": {"recap": false, "daily_report": false, "orders_stats": false, "sales": false},
        "account":    {"profile": false, "password": false, "contact": false, "help": false}
      },
      "actions": {
        "view_menu_prices": true, "edit_menu": false, "place_manual_order": true,
        "edit_order_before_kitchen": true, "request_committed_change": true,
        "mark_paid": false, "move_ticket": false, "view_payment_totals": false,
        "view_analytics": false, "approve_requests": false,
        "manage_staff": false, "manage_roles": false
      }
    }'::jsonb),

    -- ----- KITCHEN : ticket queue only, no prices, no other screen -----
    (_restaurant_id, 'kitchen', 'Cuisine', true, 'kitchen', '{
      "screens": {
        "activity":   {"home": false, "orders": false, "assistance": false, "loyalty": false},
        "management": {"menu": false, "tables": false, "appearance": false, "info": false, "notifications": false, "roles": false},
        "statistics": {"recap": false, "daily_report": false, "orders_stats": false, "sales": false},
        "account":    {"profile": false, "password": false, "contact": false, "help": false}
      },
      "actions": {
        "view_menu_prices": false, "edit_menu": false, "place_manual_order": false,
        "edit_order_before_kitchen": false, "request_committed_change": false,
        "mark_paid": false, "move_ticket": true, "view_payment_totals": false,
        "view_analytics": false, "approve_requests": false,
        "manage_staff": false, "manage_roles": false
      }
    }'::jsonb)
  ON CONFLICT (restaurant_id, key) DO NOTHING;
END;
$$;

-- ---------- seed on every new restaurant ----------
CREATE OR REPLACE FUNCTION public.on_restaurant_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_default_roles(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_restaurant_seed_roles
AFTER INSERT ON public.restaurants
FOR EACH ROW EXECUTE FUNCTION public.on_restaurant_created();

-- ---------- backfill existing restaurants ----------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.restaurants LOOP
    PERFORM public.seed_default_roles(r.id);
  END LOOP;
END;
$$;
