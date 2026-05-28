import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manager")({
  component: ManagerRouteIndex,
});

function ManagerRouteIndex() {
  return <Outlet />;
}
