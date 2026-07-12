import { createFileRoute } from "@tanstack/react-router";
import { ContractLookupWorkspace } from "@/features/contracts/components/ContractLookupWorkspace";

export const Route = createFileRoute('/accountant/tra-cuu-hop-dong')({
  component: ContractLookupWorkspace,
});
