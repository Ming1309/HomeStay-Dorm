import { createFileRoute } from "@tanstack/react-router";

import { SaleShell } from "@/components/app/SaleShell";
import { AppointmentLookupWorkspace } from "@/components/appointment/AppointmentLookupWorkspace";

export const Route = createFileRoute("/sale/tra-cuu-lich-hen")({
  component: SaleAppointmentLookupPage,
});

function SaleAppointmentLookupPage() {
  return (
    <SaleShell currentPath="/sale/tra-cuu-lich-hen" showWorkspaceNav>
      <AppointmentLookupWorkspace />
    </SaleShell>
  );
}
