import { createFileRoute } from "@tanstack/react-router";

import { AccountantSettlementPage } from "@/features/settlements/pages/CheckoutSettlementPage";

export const Route = createFileRoute("/accountant/thanh-toan-tra-phong")({ component: AccountantSettlementPage });
