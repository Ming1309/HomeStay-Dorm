import { createFileRoute } from "@tanstack/react-router";

import { SaleDashboardPortalPage } from "@/app/pages/SaleDashboardPage";

export const Route = createFileRoute("/sale/dashboard")({ component: SaleDashboardPortalPage });
