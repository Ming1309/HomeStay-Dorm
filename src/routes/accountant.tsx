import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/accountant")({
  component: AccountantDashboard,
});

function AccountantDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Accountant Dashboard</h1>
      <p className="text-gray-500 mt-2">Placeholder for Lập phiếu thu / Đối soát screen.</p>
    </div>
  );
}
