import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ComponentType } from "react";
import {
  Bed,
  Home,
  ScrollText,
  Search,
  ShieldCheck,
  ShieldHalf,
  ClipboardCheck,
} from "lucide-react";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";

export const Route = createFileRoute("/manager/dashboard")({
  component: ManagerDashboardPage,
});

function ManagerDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/manager" });
  }, [navigate]);

  return null;
}

const launchpadItems = [
  {
    to: "/manager/approval",
    title: "Xét duyệt hồ sơ",
    description:
      "Kiểm tra điều kiện lưu trú và duyệt/từ chối danh sách thành viên trước khi ký hợp đồng.",
    icon: ShieldCheck,
  },
  {
    to: "/manager/confirm-deposit",
    title: "Xác nhận tiền cọc",
    description: "Đối chiếu chứng từ giao dịch và xác nhận khoản tiền cọc của khách hàng.",
    icon: ShieldHalf,
  },
  {
    to: "/manager/handover",
    title: "Bàn giao phòng",
    description:
      "Kiểm tra hiện trạng trang thiết bị vật tư và lập biên bản bàn giao phòng cho khách dọn vào ở.",
    icon: Home,
  },
  {
    to: "/manager/termination",
    title: "Thanh lý hợp đồng",
    description:
      "Xác nhận thanh lý hợp đồng sau khi hoàn tất mọi nghĩa vụ tài chính và bàn giao phòng.",
    icon: ScrollText,
  },
  {
    to: "/manager/thu-hoi-tai-san",
    title: "Thu hồi tài sản",
    description: "Lập biên bản thu hồi tài sản khi khách trả phòng để Kế toán đối soát.",
    icon: ClipboardCheck,
  },
  {
    to: "/manager/contracts",
    title: "Tra cứu hợp đồng",
    description: "Tìm kiếm, tra cứu và in ấn thông tin chi tiết các hợp đồng thuê trong hệ thống.",
    icon: Search,
  },
  {
    to: "/manager/tra-cuu-phong",
    title: "Tra cứu phòng / giường",
    description: "Kiểm tra trạng thái thực tế và tính khả dụng của phòng hoặc giường.",
    icon: Bed,
  },
] as const;

export function ManagerDashboardScreen({ currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("manager");
  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath={currentPath}>
      <main className="h-full overflow-y-auto bg-gray-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <header className="mb-4 flex items-end justify-between gap-4 border-b border-gray-200 pb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển Quản lý</h1>
              <p className="mt-1 text-sm text-gray-500">
                Duyệt hồ sơ, bàn giao, trả phòng và tra cứu vận hành.
              </p>
            </div>
            <span className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600">
              {launchpadItems.length} chức năng
            </span>
          </header>

          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_96px] border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>Nghiệp vụ</span>
              <span className="text-right">Thao tác</span>
            </div>
            <div className="divide-y divide-gray-100">
              {launchpadItems.map((item) => (
                <LaunchpadRow key={item.to} {...item} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </RoleShell>
  );
}

function LaunchpadRow({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: (typeof launchpadItems)[number]["to"];
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-3 px-3 py-3 transition-colors hover:bg-gray-50"
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
      <span className="text-right text-xs font-semibold text-blue-700">Mở</span>
    </Link>
  );
}
