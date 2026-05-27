import { createFileRoute } from "@tanstack/react-router";
import { ProfileApprovalPage } from "@/components/approval/ProfileApprovalPage";

export const Route = createFileRoute("/approval")({
  head: () => ({
    meta: [
      { title: "Xét duyệt hồ sơ nhận phòng — Quản lý lưu trú" },
      {
        name: "description",
        content:
          "Màn hình xét duyệt hồ sơ lưu trú dành cho Manager. Xem xét và duyệt hoặc từ chối hồ sơ do Sale nhập.",
      },
    ],
  }),
  component: Approval,
});

function Approval() {
  return <ProfileApprovalPage />;
}
