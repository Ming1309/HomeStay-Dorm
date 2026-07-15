import { createFileRoute } from "@tanstack/react-router";
import { AccountantReconciliationPage } from "@/features/settlements/pages/AccountantReconciliationPage";

export const Route = createFileRoute('/accountant/doi-soat')({
  component: AccountantReconciliationPage,
});
