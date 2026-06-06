import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BedDouble, Landmark, Package, ScrollText, Settings2, Users } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect } from "react";

import { useWorkflowStore } from "@/lib/workflow-store";

const adminWorkItems = [
  {
    to: "/admin/services",
    title: "Quản lý Dịch vụ",
    description: "Quản trị danh mục dịch vụ, đơn vị tính, đơn giá và trạng thái áp dụng.",
    group: "Danh mục",
    icon: Settings2,
  },
  {
    to: "/admin/rooms-beds",
    title: "Quản lý Phòng / Giường",
    description: "Quản trị danh mục phòng, giường, trạng thái và thông tin vận hành nội bộ.",
    group: "Danh mục",
    icon: BedDouble,
  },
  {
    to: "/admin/assets",
    title: "Quản lý danh mục tài sản",
    description: "Quản trị trang thiết bị, vật tư và định mức bồi thường toàn hệ thống.",
    group: "Danh mục",
    icon: Package,
  },
  {
    to: "/admin/regulations",
    title: "Quản lý quy định lưu trú",
    description: "Quản lý nội quy, điều khoản và văn bản quy định áp dụng trong ký túc xá.",
    group: "Danh mục",
    icon: ScrollText,
  },
  {
    to: "/admin/users",
    title: "Quản trị người dùng",
    description: "Quản lý tài khoản nhân viên, vai trò, chi nhánh và trạng thái truy cập.",
    group: "Người dùng",
    icon: Users,
  },
  {
    to: "/admin/deposit-policy",
    title: "Cấu hình chính sách hoàn cọc",
    description: "Thiết lập mốc lưu trú và tỷ lệ hoàn trả tiền cọc áp dụng toàn hệ thống.",
    group: "Chính sách",
    icon: Landmark,
  },
] as const;

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  if (!isHydrated || role !== "admin") return null;

  return (
    <div className="h-full w-full overflow-hidden bg-gray-50">
      <main className="flex h-full flex-col overflow-hidden">
        <section className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto w-full max-w-6xl">
            <header className="mb-4 flex items-end justify-between gap-4 border-b border-gray-200 pb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Quản trị danh mục, người dùng và chính sách hệ thống.
                </p>
              </div>
              <span className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600">
                {adminWorkItems.length} cấu hình
              </span>
            </header>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="grid grid-cols-[minmax(0,1fr)_128px_96px] border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span>Cấu hình</span>
                <span>Nhóm</span>
                <span className="text-right">Thao tác</span>
              </div>
              <div className="divide-y divide-gray-100">
                {adminWorkItems.map((item) => (
                  <AdminWorkItemRow key={item.to} {...item} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminWorkItemRow({
  to,
  title,
  description,
  group,
  icon: Icon,
}: {
  to: (typeof adminWorkItems)[number]["to"];
  title: string;
  description: string;
  group: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="grid grid-cols-[minmax(0,1fr)_128px_96px] items-center gap-3 px-3 py-3 transition-colors hover:bg-gray-50"
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
