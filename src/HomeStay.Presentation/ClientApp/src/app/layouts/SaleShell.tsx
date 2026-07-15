import type { ReactNode } from "react";

import { useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/app/layouts/AppShell";
import { useRoleGuard } from "@/app/router/useRoleGuard";

export function SaleShell({ children }: { children: ReactNode }) {
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const allowed = useRoleGuard("sale");
  if (!allowed) return null;

  const showWorkspaceNav = currentPath !== "/sale/dashboard";

  return (
    <AppShell role="sale" currentPath={currentPath} showWorkspaceNav={showWorkspaceNav}>
      {children}
    </AppShell>
  );
}
