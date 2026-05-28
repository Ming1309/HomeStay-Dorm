import { createFileRoute } from "@tanstack/react-router";
import { ManagerDashboardScreen } from "@/routes/manager.dashboard";

export const Route = createFileRoute("/manager/")({
  component: ManagerIndexDashboardPage,
});

function ManagerIndexDashboardPage() {
  return <ManagerDashboardScreen currentPath="/manager" />;
}
