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
import type { ComponentType } from "react";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";

const accountantWorkItems = [
  {
    to: "/accountant/payments",
    title: "Thu tiền hợp đồng",
    description: "Ghi nhận thanh toán và theo dõi công nợ hợp đồng thuê.",
    group: "Thu tiền",
    icon: CreditCard,
  },
  {
    to: "/accountant/receipts",
    title: "Lập phiếu thu",
    description: "Thu khoản phát sinh khi chi phí trả phòng vượt quá tiền cọc.",
    group: "Thu tiền",
    icon: Receipt,
  },
  {
    to: "/accountant/deposit-calc",
    title: "Tính tiền cọc",
    description: "Tính toán và xác nhận số tiền cọc cho khách thuê.",
    group: "Cọc / đối soát",
    icon: Calculator,
  },
  {
    to: "/accountant/doi-soat",
    title: "Phiếu đối soát",
    description: "Lập và xác nhận phiếu đối soát tiền cọc cho hợp đồng thuê.",
    group: "Cọc / đối soát",
    icon: ClipboardCheck,
  },
  {
    to: "/accountant/refunds",
    title: "Lập phiếu hoàn cọc",
    description: "Hoàn trả phần cọc còn lại cho khách sau khi đối soát trả phòng.",
    group: "Cọc / đối soát",
    icon: Undo2,
  },
  {
    to: "/accountant/thanh-toan-tra-phong",
    title: "Thanh toán trả phòng",
    description: "Xử lý thu tiền khách phải trả sau khi phiếu đối soát đã chốt.",
    group: "Trả phòng",
    icon: CreditCard,
  },
  {
    to: "/accountant/compensation",
    title: "Hóa đơn bồi thường",
    description: "Lập hóa đơn bồi thường tài sản hư hỏng hoặc mất khi trả phòng.",
    group: "Trả phòng",
    icon: FileWarning,
  },
  {
    to: "/accountant/transactions",
    title: "Lịch sử giao dịch",
    description: "Xem nhật ký các khoản thu và giao dịch trong hệ thống.",
    group: "Tra cứu",
    icon: FileText,
  },
  {
    to: "/accountant/tra-cuu-hop-dong",
    title: "Tra cứu hợp đồng",
    description: "Tìm kiếm, tra cứu và xem chi tiết trạng thái các hợp đồng thuê.",
    group: "Tra cứu",
    icon: Search,
  },
  {
    to: "/accountant/tra-cuu-phong",
    title: "Tra cứu phòng / giường",
    description: "Kiểm tra trạng thái phòng, giường và giá thuê.",
    group: "Tra cứu",
    icon: Bed,
  },
] as const;

export const Route = createFileRoute("/accountant/")({
  component: AccountantDashboardPage,
});

function AccountantDashboardPage() {
  const allowed = useRoleGuard("accountant");
  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant">
      <main className="h-full overflow-y-auto bg-gray-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <header className="mb-4 flex items-end justify-between gap-4 border-b border-gray-200 pb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển Kế toán</h1>
              <p className="mt-1 text-sm text-gray-500">
                Danh sách nghiệp vụ và tra cứu tài chính.
              </p>
            </div>
            <span className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600">
              {accountantWorkItems.length} chức năng
            </span>
          </header>

          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_140px_96px] border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>Nghiệp vụ</span>
              <span>Nhóm</span>
              <span className="text-right">Thao tác</span>
            </div>
            <div className="divide-y divide-gray-100">
              {accountantWorkItems.map((item) => (
                <WorkItemRow key={item.to} {...item} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </RoleShell>
  );
}

function WorkItemRow({
  to,
  title,
  description,
  group,
  icon: Icon,
}: {
  to: (typeof accountantWorkItems)[number]["to"];
  title: string;
  description: string;
  group: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="grid grid-cols-[minmax(0,1fr)_140px_96px] items-center gap-3 px-3 py-3 transition-colors hover:bg-gray-50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-600">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">{title}</div>
          <div className="mt-0.5 truncate text-xs text-gray-500">{description}</div>
        </div>
      </div>
      <span className="truncate text-xs font-medium text-gray-500">{group}</span>
      <span className="text-right text-xs font-semibold text-blue-700">Mở</span>
    </Link>
  );
}
