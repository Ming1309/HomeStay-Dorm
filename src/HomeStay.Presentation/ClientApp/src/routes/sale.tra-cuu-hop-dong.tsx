import { createFileRoute } from "@tanstack/react-router";

import { ContractLookupWorkspace } from "@/features/contracts/components/ContractLookupWorkspace";

export const Route = createFileRoute("/sale/tra-cuu-hop-dong")({
  component: SaleContractLookupPage,
});

function SaleContractLookupPage() {
  return <ContractLookupWorkspace />;
}
