import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BedDouble, Landmark, Package, ScrollText, Settings2, Users } from "lucide-react";
import { useEffect } from "react";

import { useWorkflowStore } from "@/lib/workflow-store";

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
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
            <p className="mt-1 text-sm text-gray-500">
              Chọn tính năng quản trị bạn muốn thực hiện.
            </p>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Link
              to="/admin/services"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Settings2 className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Quản lý Dịch vụ</h2>
              <p className="mt-2 text-sm text-gray-500">
                Quản trị danh mục dịch vụ, đơn vị tính, đơn giá và trạng thái áp dụng.
              </p>
            </Link>

            <Link
              to="/admin/rooms-beds"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <BedDouble className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Quản lý Phòng / Giường</h2>
              <p className="mt-2 text-sm text-gray-500">
                Quản trị danh mục phòng, giường, trạng thái và thông tin vận hành nội bộ.
              </p>
            </Link>

            <Link
              to="/admin/users"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <Users className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Quản trị người dùng</h2>
              <p className="mt-2 text-sm text-gray-500">
                Quản lý tài khoản nhân viên, vai trò, chi nhánh và trạng thái truy cập hệ thống.
              </p>
            </Link>

            <Link
              to="/admin/deposit-policy"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                <Landmark className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Cấu hình chính sách hoàn cọc</h2>
              <p className="mt-2 text-sm text-gray-500">
                Thiết lập mốc lưu trú và tỷ lệ hoàn trả tiền cọc áp dụng toàn hệ thống.
              </p>
            </Link>

            <Link
              to="/admin/assets"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white">
                <Package className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Quản lý danh mục tài sản</h2>
              <p className="mt-2 text-sm text-gray-500">
                Quản trị danh mục trang thiết bị, vật tư và định mức giá trị bồi thường toàn hệ
                thống.
              </p>
            </Link>

            <Link
              to="/admin/regulations"
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <ScrollText className="size-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Quản lý quy định lưu trú</h2>
              <p className="mt-2 text-sm text-gray-500">
                Quản lý nội quy, điều khoản và văn bản quy định áp dụng trong ký túc xá.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
