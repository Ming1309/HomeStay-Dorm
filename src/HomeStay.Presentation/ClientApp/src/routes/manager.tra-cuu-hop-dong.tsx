import { createFileRoute } from "@tanstack/react-router";

import { ContractLookupWorkspace } from "@/features/contracts/components/ContractLookupWorkspace";

export const Route = createFileRoute("/manager/tra-cuu-hop-dong")({
  component: ManagerContractLookupPage,
});

function ManagerContractLookupPage() {
  return <ContractLookupWorkspace />;
}
