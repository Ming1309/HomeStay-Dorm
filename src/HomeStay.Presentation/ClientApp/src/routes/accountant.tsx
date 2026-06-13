import { createFileRoute, Outlet } from "@tanstack/react-router";

import { RoleShell } from "@/app/layouts/RoleShell";

export const Route = createFileRoute("/accountant")({
  component: AccountantRouteIndex,
});

function AccountantRouteIndex() {
  return (
    <RoleShell role="accountant">
      <Outlet />
    </RoleShell>
  );
}
