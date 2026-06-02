import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, FileText, Search, Users, CalendarDays } from "lucide-react";

import { SaleShell } from "@/components/app/SaleShell";

export const Route = createFileRoute("/sale/dashboard")({
  component: SaleDashboardPortalPage,
});

function SaleDashboardPortalPage() {
  return (
    <SaleShell currentPath="/sale/dashboard" showWorkspaceNav={false}>
      <div className="flex h-full items-start justify-center overflow-y-auto bg-gray-50/60 p-6">
        <div className="w-full max-w-4xl pt-10">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển Sale</h1>
            <p className="mt-1 text-sm text-gray-500">Chọn nghiệp vụ bạn muốn thực hiện</p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Link
              to="/sale/lap-phieu-dang-ky"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <ClipboardList className="size-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Lập phiếu đăng ký</h2>
              <p className="mt-2 text-sm text-gray-500">
                Tạo phiếu đăng ký dịch vụ cho khách hàng mới với thông tin chi tiết.
              </p>
            </Link>

            <Link
              to="/sale/ho-so-luu-tru"
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
              to="/sale/lap-hop-dong"
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

            <Link
              to="/sale/tra-cuu-hop-dong"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <Search className="size-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tra cứu hợp đồng</h2>
              <p className="mt-2 text-sm text-gray-500">
                Tìm kiếm, tra cứu và xem chi tiết các hợp đồng thuê trong hệ thống.
              </p>
            </Link>

            <Link
              to="/sale/tra-cuu-phieu-dang-ky"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <Search className="size-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tra cứu phiếu đăng ký</h2>
              <p className="mt-2 text-sm text-gray-500">
                Tìm kiếm và xem chi tiết phiếu đăng ký khách hàng để hỗ trợ tư vấn.
              </p>
            </Link>

            <Link
              to="/sale/lich-hen"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-sky-300 hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                <CalendarDays className="size-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tạo lịch hẹn</h2>
              <p className="mt-2 text-sm text-gray-500">
                Tạo lịch hẹn với khách hàng, liên kết chứng từ và lên lịch nhắc tự động.
              </p>
            </Link>

            <Link
              to="/sale/tra-cuu-lich-hen"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-violet-300 hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <Search className="size-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tra cứu lịch hẹn</h2>
              <p className="mt-2 text-sm text-gray-500">
                Xem lại các lịch hẹn đã tạo và tìm nhanh theo thời gian, chi nhánh hoặc khách hàng.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </SaleShell>
  );
}
