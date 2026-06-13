import { createFileRoute } from "@tanstack/react-router";

import { SaleAppointmentPage } from "@/features/appointments/pages/SaleAppointmentPage";

export const Route = createFileRoute("/sale/lich-hen")({ component: SaleAppointmentPage });
