import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { ContractLookupWorkspace } from "@/components/contract/ContractLookupWorkspace";

export const Route = createFileRoute("/manager/tra-cuu-hop-dong")({
  component: ManagerContractLookupPage,
});

function ManagerContractLookupPage() {
  const allowed = useRoleGuard("manager");
  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath="/manager/tra-cuu-hop-dong">
      <ContractLookupWorkspace />
    </RoleShell>
  );
}
