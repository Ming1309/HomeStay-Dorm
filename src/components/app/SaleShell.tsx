import type { ReactNode } from "react";

import { AppShell } from "@/components/app/AppShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";

export function SaleShell({
  currentPath,
  showWorkspaceNav,
  children,
}: {
  currentPath: string;
  showWorkspaceNav: boolean;
  children: ReactNode;
}) {
  const allowed = useRoleGuard("sale");
  if (!allowed) return null;

  return (
    <AppShell role="sale" currentPath={currentPath} showWorkspaceNav={showWorkspaceNav}>
      {children}
    </AppShell>
  );
}
