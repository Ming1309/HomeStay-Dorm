import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Users } from "lucide-react";

export const Route = createFileRoute("/sale")({
  component: SaleDashboard,
});

function SaleDashboard() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50/60 p-6">
      <div className="mx-auto w-full max-w-4xl pt-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển Sale</h1>
          <p className="text-sm text-gray-500 mt-1">Chọn nghiệp vụ bạn muốn thực hiện</p>
        </header>

        <div className="grid grid-cols-2 gap-6">
          <Link
            to="/residence"
            className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <Users className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Nhập hồ sơ lưu trú</h2>
            <p className="mt-2 text-sm text-gray-500">
              Nhập thông tin người ở và khách thuê từ phiếu cọc đã thanh toán.
            </p>
          </Link>

          <Link
            to="/contract"
            className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
              <FileText className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Lập hợp đồng thuê</h2>
            <p className="mt-2 text-sm text-gray-500">
              Tạo và xuất hợp đồng thuê phòng cho khách hàng sau khi duyệt.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
