-- ============================================================================
-- Migration — handle_new_user() must skip hidden PIN-staff users
-- ----------------------------------------------------------------------------
-- BUG: the signup trigger on auth.users creates a restaurant + profile + owner
-- role for EVERY new auth user. set-staff-pin creates a hidden auth user per
-- staff member, so each staffer was being made the OWNER of a new empty
-- restaurant. useRestaurantAccess then matched them as isOwner=true (guard leak)
-- and resolved their restaurant to that empty one (orders showed nowhere).
--
-- FIX: skip provisioning for PIN-staff users, identified by the metadata
-- set at creation (kind='pin_staff') or the dedicated @staff.menufy.app email.
-- Owner signups (real users) are unaffected.
--
-- Reuses : public.restaurants, public.profiles, public.user_roles
-- Alters : public.handle_new_user() (adds the skip guard)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restaurant_id UUID;
  v_restaurant_name TEXT;
  v_full_name TEXT;
BEGIN
  -- Hidden PIN-staff users are NOT restaurant owners — do not provision them.
  IF (NEW.raw_user_meta_data->>'kind') = 'pin_staff'
     OR NEW.email LIKE '%@staff.menufy.app' THEN
    RETURN NEW;
  END IF;

  v_restaurant_name := COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'Mon restaurant');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  INSERT INTO public.restaurants (owner_id, name)
  VALUES (NEW.id, v_restaurant_name)
  RETURNING id INTO v_restaurant_id;

  INSERT INTO public.profiles (id, full_name, restaurant_id)
  VALUES (NEW.id, v_full_name, v_restaurant_id);

  INSERT INTO public.user_roles (user_id, role, restaurant_id)
  VALUES (NEW.id, 'owner', v_restaurant_id);

  RETURN NEW;
END;
$$;
