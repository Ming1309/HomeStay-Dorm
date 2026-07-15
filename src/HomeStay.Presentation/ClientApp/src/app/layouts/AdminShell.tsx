import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AppShell } from "@/app/layouts/AppShell";
import { useRoleGuard } from "@/app/router/useRoleGuard";

export function AdminShell({ children }: { children: ReactNode }) {
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const allowed = useRoleGuard("admin");
  if (!allowed) return null;

  return (
    <AppShell role="admin" currentPath={currentPath}>
      {children}
    </AppShell>
  );
}
