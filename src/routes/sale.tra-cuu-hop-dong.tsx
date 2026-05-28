import { createFileRoute } from "@tanstack/react-router";

import { SaleShell } from "@/components/app/SaleShell";
import { ContractLookupWorkspace } from "@/components/contract/ContractLookupWorkspace";

export const Route = createFileRoute("/sale/tra-cuu-hop-dong")({
  component: SaleContractLookupPage,
});

function SaleContractLookupPage() {
  return (
    <SaleShell currentPath="/sale/tra-cuu-hop-dong" showWorkspaceNav>
      <ContractLookupWorkspace />
    </SaleShell>
  );
}
