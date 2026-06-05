import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app/AppShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";

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
