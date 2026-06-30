import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRestaurantAccess } from "@/hooks/use-restaurant-access";

type Area = "dashboard" | "kitchen" | "cashier";

// Wraps a screen and only renders it if the user's role allows that area.
// Otherwise redirects to the user's correct home screen (no flash).
export function AccessGuard({ area, children }: { area: Area; children: ReactNode }) {
  const access = useRestaurantAccess();
  const navigate = useNavigate();

  const allowed =
    area === "dashboard" ? (access.isOwner || access.can.dashboard) :
    area === "kitchen" ? access.can.kitchen :
    area === "cashier" ? access.can.cashierScreen :
    false;

  useEffect(() => {
    if (access.loading) return;
    if (!allowed) {
      // Send them to their correct home
      if (access.isOwner || access.can.dashboard) navigate({ to: "/dashboard", replace: true });
      else if (access.can.cashierScreen) navigate({ to: "/cashier", replace: true });
      else if (access.can.kitchen) navigate({ to: "/kitchen", replace: true });
      else navigate({ to: "/dashboard", replace: true });
    }
  }, [access.loading, allowed]);

  // While resolving or redirecting, show a neutral loading screen (no flash of content)
  if (access.loading || !allowed) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}