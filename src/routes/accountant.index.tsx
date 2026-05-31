import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, CreditCard, FileText, Search, Bed } from "lucide-react";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";

export const Route = createFileRoute("/accountant/")({
  component: AccountantDashboardPage,
});

function AccountantDashboardPage() {
  const allowed = useRoleGuard("accountant");
  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant">
      <main className="flex h-full items-center justify-center overflow-y-auto px-6 py-10">
        <div className="w-full max-w-6xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Kế toán</h1>
            <p className="mt-2 text-sm text-gray-500">Chọn nghiệp vụ bạn muốn thực hiện</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/accountant/payments"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <CreditCard className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Thu tiền hợp đồng</h2>
              <p className="mt-1 text-sm text-gray-500">
                Ghi nhận thanh toán và theo dõi công nợ hợp đồng thuê.
              </p>
            </Link>

            <Link
              to="/accountant/deposit-calc"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Calculator className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Tính tiền cọc</h2>
              <p className="mt-1 text-sm text-gray-500">
                Tính toán và xác nhận số tiền cọc cho khách thuê.
              </p>
            </Link>

            <Link
              to="/accountant/transactions"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <FileText className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Lịch sử giao dịch</h2>
              <p className="mt-1 text-sm text-gray-500">
                Xem nhật ký các khoản thu và giao dịch trong hệ thống.
              </p>
            </Link>

            <Link
              to="/accountant/tra-cuu-hop-dong"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <Search className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Tra cứu hợp đồng</h2>
              <p className="mt-1 text-sm text-gray-500">
                Tìm kiếm, tra cứu và xem chi tiết trạng thái các hợp đồng thuê.
              </p>
            </Link>

            <Link
              to="/accountant/tra-cuu-phong"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600 transition-colors group-hover:bg-slate-600 group-hover:text-white">
                <Bed className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Tra cứu phòng</h2>
              <p className="mt-1 text-sm text-gray-500">
                Kiểm tra trạng thái phòng, giường và giá thuê.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </RoleShell>
  );
}
