import { createFileRoute } from "@tanstack/react-router";
import { AccountantPaymentsScreen } from "@/routes/accountant.payments";

export const Route = createFileRoute("/accountant")({
  component: AccountantRouteIndex,
});

function AccountantRouteIndex() {
  return <AccountantPaymentsScreen currentPath="/accountant" />;
}
