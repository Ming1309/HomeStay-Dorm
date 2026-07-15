import { createFileRoute } from "@tanstack/react-router";
import { ManagerAssetRecoveryPage } from "@/features/handovers/pages/AssetRecoveryPage";

export const Route = createFileRoute('/manager/thu-hoi-tai-san')({
  component: ManagerAssetRecoveryPage,
});
