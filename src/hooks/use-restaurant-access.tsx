import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type RoleKey = "owner" | "manager" | "cashier" | "waiter" | "kitchen";

export interface RestaurantAccess {
  loading: boolean;
  restaurantId: string | null;
  restaurantName: string | null;
  isOwner: boolean;
  roles: RoleKey[];
  can: {
    dashboard: boolean;      // full owner dashboard
    kitchen: boolean;        // kitchen screen
    cashierScreen: boolean;  // waiter/cashier combined screen
    markPaid: boolean;       // mark orders as paid
    handleAssistance: boolean;
    manageSettings: boolean; // menu, settings, roles, etc.
  };
}

export function useRestaurantAccess(): RestaurantAccess {
  const { user } = useAuth();
  const [state, setState] = useState<RestaurantAccess>({
    loading: true,
    restaurantId: null,
    restaurantName: null,
    isOwner: false,
    roles: [],
    can: { dashboard: false, kitchen: false, cashierScreen: false, markPaid: false, handleAssistance: false, manageSettings: false },
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const resolve = async () => {
      // 1. Is the user an owner?
      const { data: owned } = await supabase.from("restaurants").select("id, name").eq("owner_id", user.id).maybeSingle();
      if (owned) {
        if (cancelled) return;
        setState({
          loading: false,
          restaurantId: owned.id,
          restaurantName: owned.name,
          isOwner: true,
          roles: ["owner"],
          can: { dashboard: true, kitchen: true, cashierScreen: true, markPaid: true, handleAssistance: true, manageSettings: true },
        });
        return;
      }

      // 2. Is the user a staff member?
      const { data: member, error: memberErr } = await supabase.from("team_members").select("restaurant_id, roles, status").eq("user_id", user.id).maybeSingle();
      console.log("ACCESS DEBUG — user.id:", user.id, "member:", member, "error:", memberErr);
      if (member && member.status === "active") {
        const { data: rest } = await supabase.from("restaurants").select("name").eq("id", member.restaurant_id).maybeSingle();
        const roles = (member.roles ?? []) as RoleKey[];
        if (cancelled) return;
        setState({
          loading: false,
          restaurantId: member.restaurant_id,
          restaurantName: rest?.name ?? null,
          isOwner: false,
          roles,
          can: {
            dashboard: roles.includes("manager"),
            kitchen: roles.includes("kitchen") || roles.includes("manager"),
            cashierScreen: roles.includes("waiter") || roles.includes("cashier") || roles.includes("manager"),
            markPaid: roles.includes("cashier") || roles.includes("manager"),
            handleAssistance: roles.includes("waiter") || roles.includes("cashier") || roles.includes("manager"),
            manageSettings: roles.includes("manager"),
          },
        });
        return;
      }

      // 3. Neither owner nor staff
      if (cancelled) return;
      setState((s) => ({ ...s, loading: false, restaurantId: null, isOwner: false, roles: [] }));
    };

    resolve();
    return () => { cancelled = true; };
  }, [user]);

  return state;
}

// Where should a user land after login, based on their access?
export function landingPathFor(access: RestaurantAccess): string {
  if (access.isOwner || access.can.dashboard) return "/dashboard";
  if (access.can.cashierScreen) return "/cashier";
  if (access.can.kitchen) return "/kitchen";
  return "/dashboard"; // fallback
}