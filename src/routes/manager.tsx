import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manager")({
  component: ManagerDashboard,
});

function ManagerDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      <p className="text-gray-500 mt-2">Placeholder for Xét duyệt hồ sơ screen.</p>
    </div>
  );
}
