import { createFileRoute } from "@tanstack/react-router";
import { AdminAssetsPage } from "@/features/administration/pages/AdminAssetsPage";

export const Route = createFileRoute('/admin/assets')({
  component: AdminAssetsPage,
});
