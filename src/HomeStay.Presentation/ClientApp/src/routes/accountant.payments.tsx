import { createFileRoute } from "@tanstack/react-router";

import { AccountantPaymentsPage } from "@/features/payments/pages/AccountantPaymentsPage";

export const Route = createFileRoute("/accountant/payments")({ component: AccountantPaymentsPage });
