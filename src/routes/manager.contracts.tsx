import { createFileRoute } from "@tanstack/react-router";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import { ContractLookupWorkspace } from "@/components/contract/ContractLookupWorkspace";

export const Route = createFileRoute("/manager/contracts")({
  component: ManagerContractsPage,
});

function ManagerContractsPage() {
  const allowed = useRoleGuard("manager");
  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath="/manager/contracts">
      <ContractLookupWorkspace />
    </RoleShell>
  );
}
