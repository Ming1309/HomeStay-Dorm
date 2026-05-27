import { createFileRoute } from "@tanstack/react-router";
import { ContractCreationPage } from "@/components/contract/ContractCreationPage";

export const Route = createFileRoute("/contract")({
  head: () => ({
    meta: [
      { title: "Lập hợp đồng thuê — Quản lý lưu trú" },
      {
        name: "description",
        content: "Màn hình lập hợp đồng thuê dành cho bộ phận Sale.",
      },
    ],
  }),
  component: Contract,
});

function Contract() {
  return <ContractCreationPage />;
}
