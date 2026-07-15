import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute('/accountant/receipts')({
  component: () => <Navigate to="/accountant/payments" />,
});
