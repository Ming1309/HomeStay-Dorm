import { createFileRoute } from "@tanstack/react-router";

import { AdminRegulationsPage } from "@/features/administration/pages/AdminRegulationsPage";

export const Route = createFileRoute("/admin/regulations")({ component: AdminRegulationsPage });
