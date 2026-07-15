import { createFileRoute } from "@tanstack/react-router";
import { ManagerApprovalPage } from "@/features/contracts/pages/ManagerApprovalPage";

export const Route = createFileRoute('/manager/approval')({
  component: ManagerApprovalPage,
});
