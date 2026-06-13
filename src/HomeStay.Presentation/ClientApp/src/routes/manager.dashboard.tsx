import { createFileRoute } from "@tanstack/react-router";

import { ManagerDashboardPage } from "@/app/pages/ManagerDashboardPage";

export const Route = createFileRoute("/manager/dashboard")({ component: ManagerDashboardPage });
