import { createFileRoute } from "@tanstack/react-router";
import { ManagerHandoverPage } from "@/features/handovers/pages/ManagerHandoverPage";

export const Route = createFileRoute('/manager/handover')({
  component: ManagerHandoverPage,
});
