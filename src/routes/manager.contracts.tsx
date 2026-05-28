import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
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
