import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminShell } from "@/app/layouts/AdminShell";

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
