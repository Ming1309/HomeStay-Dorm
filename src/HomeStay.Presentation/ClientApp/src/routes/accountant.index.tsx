import { createFileRoute } from "@tanstack/react-router";

import { AccountantDashboardPage } from "@/app/pages/AccountantDashboardPage";

export const Route = createFileRoute("/accountant/")({ component: AccountantDashboardPage });
