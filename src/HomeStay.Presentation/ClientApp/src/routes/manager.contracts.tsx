import { createFileRoute } from "@tanstack/react-router";

import { ContractLookupWorkspace } from "@/features/contracts/components/ContractLookupWorkspace";

export const Route = createFileRoute("/manager/contracts")({
  component: ManagerContractsPage,
});

function ManagerContractsPage() {
  return <ContractLookupWorkspace />;
}
