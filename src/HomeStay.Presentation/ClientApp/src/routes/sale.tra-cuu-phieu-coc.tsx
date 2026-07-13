import { createFileRoute } from "@tanstack/react-router";
import { DepositLookupWorkspace } from "@/features/deposits/components/DepositLookupWorkspace";

export const Route = createFileRoute("/sale/tra-cuu-phieu-coc")({
  component: DepositLookupWorkspace,
});
