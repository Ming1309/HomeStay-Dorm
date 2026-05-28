import { createFileRoute } from "@tanstack/react-router";
import { AccountantPaymentsScreen } from "@/routes/accountant.payments";

export const Route = createFileRoute("/accountant/")({
  component: AccountantIndexPage,
});

function AccountantIndexPage() {
  return <AccountantPaymentsScreen currentPath="/accountant" />;
}
