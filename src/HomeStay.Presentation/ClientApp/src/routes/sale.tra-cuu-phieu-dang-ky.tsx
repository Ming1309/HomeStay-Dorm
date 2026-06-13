import { createFileRoute } from "@tanstack/react-router";
import { RegistrationLookupWorkspace } from "@/features/registrations/components/RegistrationLookupWorkspace";

export const Route = createFileRoute("/sale/tra-cuu-phieu-dang-ky")({
  component: SaleRegistrationLookupPage,
});

function SaleRegistrationLookupPage() {
  return <RegistrationLookupWorkspace />;
}
