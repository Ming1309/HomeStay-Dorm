import { createFileRoute } from "@tanstack/react-router";
import { ResidenceCheckInPage } from "@/components/residence/ResidenceCheckInPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nhập hồ sơ lưu trú — Quản lý lưu trú" },
      {
        name: "description",
        content:
          "Màn hình nghiệp vụ cho nhân viên sale nhập hồ sơ lưu trú từ phiếu cọc đã thanh toán.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <ResidenceCheckInPage />;
}
