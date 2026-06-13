import { createFileRoute } from "@tanstack/react-router";

import { AdminDashboardPage } from "@/features/administration/pages/AdminDashboardPage";

export const Route = createFileRoute("/admin/")({ component: AdminDashboardPage });
