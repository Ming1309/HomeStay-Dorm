import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminShell } from "@/components/app/AdminShell";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
