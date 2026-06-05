import type { ReactNode } from "react";

import { AppShell } from "@/components/app/AppShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";

export function RoleShell({
  role,
  currentPath,
  children,
}: {
  role: "accountant" | "manager";
  currentPath: string;
  children: ReactNode;
}) {
  const allowed = useRoleGuard(role);
  if (!allowed) return null;

  return (
    <AppShell role={role} currentPath={currentPath}>
      {children}
    </AppShell>
  );
}
