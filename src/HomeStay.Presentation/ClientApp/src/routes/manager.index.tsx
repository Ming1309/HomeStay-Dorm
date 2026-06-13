import { createFileRoute } from "@tanstack/react-router";
import { ManagerDashboardScreen } from "@/app/pages/ManagerDashboardPage";

export const Route = createFileRoute("/manager/")({
  component: ManagerIndexDashboardPage,
});

function ManagerIndexDashboardPage() {
  return <ManagerDashboardScreen currentPath="/manager" />;
}
