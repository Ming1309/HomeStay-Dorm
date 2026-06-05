import { createFileRoute } from "@tanstack/react-router";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
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
