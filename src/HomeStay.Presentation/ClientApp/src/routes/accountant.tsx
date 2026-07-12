import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleShell } from "@/app/layouts/RoleShell";

export const Route = createFileRoute('/accountant')({
  component: AccountantRoute,
});

function AccountantRoute() {
  return <RoleShell role="accountant"><Outlet /></RoleShell>;
}
