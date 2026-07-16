-- ============================================================================
-- team_members anti-escalation guard (server-authoritative)
-- ----------------------------------------------------------------------------
-- The m9_team_members_manage RLS policy lets any MANAGER write team_members in
-- their restaurant (by design: managers manage people). But RLS can't compare
-- OLD vs NEW, so it can't stop a manager from ESCALATING — granting the manager
-- role to a confederate, editing permission_overrides, re-linking a staff row to
-- another auth account, promoting themselves, or touching the owner. This trigger
-- enforces those limits, resolving the actor from auth.uid() (same server-
-- authoritative pattern as the M6 void / M7 self-approval guards).
--
-- Actor model:
--   * auth.uid() IS NULL  -> trusted backend (service_role edge functions such as
--                            set-staff-pin provisioning user_id): NOT constrained.
--   * actor = restaurant owner -> may do anything.
--   * actor = a non-owner (manager) -> held to the rules below.
--
-- Rules for a non-owner (RAISE otherwise):
--   1. No elevation — cannot CREATE an elevated row, nor PROMOTE a row to
--      elevated (incl. themselves).
--   2. Cannot modify another elevated row (peer manager) or the owner's row.
--   3. permission_overrides are owner-only (default on insert, unchanged on update).
--   4. Cannot change their OWN role_id / roles / status (full_name is fine).
--   5. DELETE is owner-only — managers SUSPEND (preserves attribution FKs /
--      audit trail; matches the M6 void-only philosophy).
--   6. Cannot set/alter user_id — the auth-link field, set only by set-staff-pin
--      provisioning. (A manager rewriting it could re-link a staff row to another
--      auth account — the original account-linking bug, weaponised.)
--
-- "Elevated" = has escalation POWER, not just the name 'manager':
--   legacy roles[] overlaps {owner,manager}, OR role_id's role has
--   key in (owner,manager) OR permissions.actions.manage_roles/manage_staff true.
--
-- Reuses : public.team_members, public.roles, public.restaurants
-- Creates: tm_is_elevated(text[],uuid), guard_team_member_escalation() + trigger
--
-- ⚠️  PRE-CHECK — RUN BEFORE APPLYING (informational; the trigger only affects
--     FUTURE writes, so existing rows are never rewritten):
--
--       -- (a) the default the guard compares overrides against. expected: '{}'::jsonb
--       select column_default from information_schema.columns
--       where table_schema='public' and table_name='team_members'
--         and column_name='permission_overrides';
--
--       -- (b) the elevated rows the guard will protect — confirm these are your
--       --     real managers/owner and nothing unexpected.
--       select id, full_name, roles, role_id, status, user_id
--       from public.team_members where roles && array['owner','manager'];
--
--       -- (c) does the owner have a staff row? (rule 2 belt-and-braces). may be 0.
--       select tm.id from public.team_members tm
--       join public.restaurants r on r.id = tm.restaurant_id
--       where tm.user_id = r.owner_id;
--
--       -- (d) name clash check. expected: empty.
--       select tgname from pg_trigger where tgname = 'trg_team_members_guard_escalation';
-- ============================================================================

-- Does a (roles[], role_id) pair carry manager/owner-level power?
CREATE OR REPLACE FUNCTION public.tm_is_elevated(p_roles text[], p_role_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(p_roles && ARRAY['owner','manager'], false)
    OR EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.id = p_role_id
        AND (
          r.key IN ('owner','manager')
          OR COALESCE((r.permissions->'actions'->>'manage_roles')::boolean, false)
          OR COALESCE((r.permissions->'actions'->>'manage_staff')::boolean, false)
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.guard_team_member_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid  uuid := auth.uid();
  v_rest uuid := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
BEGIN
  -- Trusted backend (service_role: set-staff-pin, etc.) has no user context.
  IF v_uid IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- The restaurant owner may do anything.
  IF EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = v_rest AND r.owner_id = v_uid) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- ---------------- actor is a NON-OWNER (a manager) ----------------

  -- Rule 5: only the owner deletes; managers suspend.
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Only the owner can delete a staff member; suspend instead.';
  END IF;

  -- Rule 6: never set/alter the auth-link user_id (provisioning only).
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    RAISE EXCEPTION 'A manager cannot set a staff member''s auth link (user_id).';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'A manager cannot change a staff member''s auth link (user_id).';
  END IF;

  -- Rule 3: permission_overrides are owner-only.
  IF TG_OP = 'INSERT' AND NEW.permission_overrides IS DISTINCT FROM '{}'::jsonb THEN
    RAISE EXCEPTION 'A manager cannot set permission overrides.';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.permission_overrides IS DISTINCT FROM OLD.permission_overrides THEN
    RAISE EXCEPTION 'A manager cannot change permission overrides.';
  END IF;

  -- Rule 1: no elevation — cannot create an elevated row, nor promote to elevated.
  IF public.tm_is_elevated(NEW.roles, NEW.role_id)
     AND (TG_OP = 'INSERT' OR NOT public.tm_is_elevated(OLD.roles, OLD.role_id)) THEN
    RAISE EXCEPTION 'A manager cannot grant a manager/owner-level role.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Rule 2: cannot modify ANOTHER elevated row (peer manager) or the owner's row.
    IF OLD.user_id IS DISTINCT FROM v_uid THEN
      IF public.tm_is_elevated(OLD.roles, OLD.role_id) THEN
        RAISE EXCEPTION 'A manager cannot modify a manager/owner-level staff row.';
      END IF;
      IF EXISTS (SELECT 1 FROM public.restaurants r
                 WHERE r.id = OLD.restaurant_id AND r.owner_id = OLD.user_id) THEN
        RAISE EXCEPTION 'A manager cannot modify the owner''s staff row.';
      END IF;
    ELSE
      -- Rule 4: acting on OWN row — no role/status self-change (full_name is fine).
      IF NEW.role_id IS DISTINCT FROM OLD.role_id
         OR NEW.roles  IS DISTINCT FROM OLD.roles
         OR NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'A manager cannot change their own role or status.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_team_members_guard_escalation ON public.team_members;
CREATE TRIGGER trg_team_members_guard_escalation
  BEFORE INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.guard_team_member_escalation();
