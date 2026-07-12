import { createFileRoute } from "@tanstack/react-router";
import { AppointmentLookupWorkspace } from "@/features/appointments/components/AppointmentLookupWorkspace";

export const Route = createFileRoute('/sale/tra-cuu-lich-hen')({
  component: AppointmentLookupWorkspace,
});
