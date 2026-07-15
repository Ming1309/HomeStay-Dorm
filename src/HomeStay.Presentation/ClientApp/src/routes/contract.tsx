import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute('/contract')({
  component: () => <Navigate to="/manager/contracts" />,
});
