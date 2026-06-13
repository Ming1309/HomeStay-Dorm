import { createFileRoute, Outlet } from "@tanstack/react-router";

import { RoleShell } from "@/app/layouts/RoleShell";

export const Route = createFileRoute("/manager")({
  component: ManagerRouteIndex,
});

function ManagerRouteIndex() {
  return (
    <RoleShell role="manager">
      <Outlet />
    </RoleShell>
  );
}
