import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute('/residence')({
  component: () => <Navigate to="/sale/ho-so-luu-tru" />,
});
