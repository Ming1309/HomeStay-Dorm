import { createFileRoute } from "@tanstack/react-router";
import { DepositCancellationWorkspace } from "@/features/deposits/components/DepositCancellationWorkspace";

export const Route = createFileRoute("/sale/huy-phieu-coc")({
  component: DepositCancellationWorkspace,
});
