import { createFileRoute } from "@tanstack/react-router";
import { AdminDepositPolicyPage } from "@/features/administration/pages/AdminDepositPolicyPage";

export const Route = createFileRoute('/admin/deposit-policy')({
  component: AdminDepositPolicyPage,
});
