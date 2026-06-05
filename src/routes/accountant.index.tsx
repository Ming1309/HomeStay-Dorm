import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bed,
  Calculator,
  ClipboardCheck,
  CreditCard,
  FileText,
  FileWarning,
  Receipt,
  Search,
  Undo2,
} from "lucide-react";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";

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
              to="/accountant/doi-soat"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <ClipboardCheck className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Phiếu đối soát</h2>
              <p className="mt-1 text-sm text-gray-500">
                Lập và xác nhận phiếu đối soát tiền cọc cho hợp đồng thuê.
              </p>
            </Link>

            <Link
              to="/accountant/thanh-toan-tra-phong"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <CreditCard className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Thanh toán trả phòng</h2>
              <p className="mt-1 text-sm text-gray-500">
                Xử lý thu tiền khách phải trả sau khi phiếu đối soát đã chốt.
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
              to="/accountant/compensation"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-rose-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                <FileWarning className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Hóa đơn bồi thường</h2>
              <p className="mt-1 text-sm text-gray-500">
                Lập hóa đơn bồi thường tài sản hư hỏng hoặc mất khi trả phòng.
              </p>
            </Link>

            <Link
              to="/accountant/receipts"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <Receipt className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Lập phiếu thu</h2>
              <p className="mt-1 text-sm text-gray-500">
                Thu khoản phát sinh khi chi phí trả phòng vượt quá tiền cọc.
              </p>
            </Link>

            <Link
              to="/accountant/refunds"
              className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                <Undo2 className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Lập phiếu hoàn cọc</h2>
              <p className="mt-1 text-sm text-gray-500">
                Hoàn trả phần cọc còn lại cho khách sau khi đối soát trả phòng.
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
