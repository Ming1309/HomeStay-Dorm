import { createFileRoute } from "@tanstack/react-router";
import { AdminServicePage } from "@/features/administration/pages/AdminServicesPage";

export const Route = createFileRoute('/admin/services')({
  component: AdminServicePage,
});
