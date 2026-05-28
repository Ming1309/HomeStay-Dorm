import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { ContractLookupWorkspace } from "@/components/contract/ContractLookupWorkspace";

export const Route = createFileRoute("/accountant/tra-cuu-hop-dong")({
  component: AccountantContractLookupPage,
});

function AccountantContractLookupPage() {
  const allowed = useRoleGuard("accountant");
  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/tra-cuu-hop-dong">
      <ContractLookupWorkspace />
    </RoleShell>
  );
}
