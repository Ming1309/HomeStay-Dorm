import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute('/approval')({
  component: () => <Navigate to="/manager/approval" />,
});
