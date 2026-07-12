import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute('/manager/dashboard')({
  component: () => <Navigate to="/manager" />,
});
