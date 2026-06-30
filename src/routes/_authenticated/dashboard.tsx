import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AccessGuard } from "@/components/access-guard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: () => (
    <AccessGuard area="dashboard">
      <Outlet />
    </AccessGuard>
  ),
  scrollRestoration: true,
});