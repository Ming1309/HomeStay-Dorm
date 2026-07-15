import type { ReactNode } from "react";

import { useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/app/layouts/AppShell";
import { useRoleGuard } from "@/app/router/useRoleGuard";

export function RoleShell({
  role,
  children,
}: {
  role: "accountant" | "manager";
  children: ReactNode;
}) {
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const allowed = useRoleGuard(role);
  if (!allowed) return null;

  return (
    <AppShell role={role} currentPath={currentPath}>
      {children}
    </AppShell>
  );
}
