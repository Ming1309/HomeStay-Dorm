import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute('/manager/tra-cuu-hop-dong')({
  component: () => <Navigate to="/manager/contracts" />,
});
