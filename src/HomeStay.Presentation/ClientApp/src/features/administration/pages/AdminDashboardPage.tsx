import {
  BedDouble,
  CheckCircle2,
  Landmark,
  Package,
  ScrollText,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  BedStatusChart,
  DashboardErrorState,
  DashboardKpiGrid,
  DashboardLoadingState,
  DashboardPageShell,
  DashboardQuickActions,
  DashboardStaleBanner,
  DashboardTaskPanel,
  toneClass,
} from "@/features/dashboards/components/DashboardShell";
import { useAdminDashboard } from "@/features/dashboards/hooks/use-role-dashboards";
import { cn } from "@/shared/lib/utils";

const adminWorkItems = [
  {
    to: "/admin/services",
    title: "Dịch vụ",
    description: "Đơn vị tính, đơn giá và trạng thái áp dụng",
    icon: Settings2,
  },
  {
    to: "/admin/rooms-beds",
    title: "Phòng / Giường",
    description: "Sức chứa, giá thuê và trạng thái vận hành",
    icon: BedDouble,
  },
  {
    to: "/admin/assets",
    title: "Tài sản",
    description: "Thiết bị, vật tư và định mức bồi thường",
    icon: Package,
  },
  {
    to: "/admin/regulations",
    title: "Quy định",
    description: "Nội quy và điều khoản lưu trú",
    icon: ScrollText,
  },
  {
    to: "/admin/users",
    title: "Người dùng",
    description: "Tài khoản nhân viên, vai trò và chi nhánh",
    icon: Users,
  },
  {
    to: "/admin/deposit-policy",
    title: "Chính sách hoàn cọc",
    description: "Tỷ lệ hoàn trả và mốc lưu trú áp dụng",
    icon: Landmark,
  },
] as const;

const kpiIcons = {
  "phong-giuong": BedDouble,
  "giuong-trong": CheckCircle2,
  "tai-khoan": Users,
  "cau-hinh": ShieldCheck,
};

const configRouteMap: Record<string, (typeof adminWorkItems)[number]["to"]> = {
  "rooms-beds": "/admin/rooms-beds",
  "deposit-policy": "/admin/deposit-policy",
  users: "/admin/users",
};

export function AdminDashboardPage() {
  const query = useAdminDashboard();

  if (query.isLoading && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Admin"
        description="Theo dõi danh mục, người dùng và chính sách hệ thống."
      >
        <DashboardLoadingState />
      </DashboardPageShell>
    );
  }

  if (query.isError && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Admin"
        description="Theo dõi danh mục, người dùng và chính sách hệ thống."
      >
        <DashboardErrorState
          message={query.error instanceof Error ? query.error.message : "Không thể tải dữ liệu."}
          onRetry={() => void query.refetch()}
        />
      </DashboardPageShell>
    );
  }

  const data = query.data!;

  return (
    <DashboardPageShell
      title="Tổng quan Admin"
      description="Theo dõi danh mục, người dùng và chính sách hệ thống."
      asOf={data.meta.asOf}
      scopeLabel={data.meta.scopeLabel}
      isFetching={query.isFetching}
      onRefresh={() => void query.refetch()}
    >
      {query.isError ? (
        <DashboardStaleBanner message="Không làm mới được dữ liệu. Đang hiển thị snapshot gần nhất." />
      ) : null}
      <DashboardKpiGrid items={data.kpis} icons={kpiIcons} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
        <DashboardTaskPanel
          description="Các cấu hình cần theo dõi để hệ thống ổn định"
          tasks={data.tasks}
        />
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Cấu hình nổi bật</h2>
              <p className="mt-1 text-sm text-gray-500">
                Các cấu hình ảnh hưởng trực tiếp vận hành
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Cấu hình</th>
                  <th className="px-3 py-2">Nhóm</th>
                  <th className="px-3 py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.configRows.map((item) => {
                  const to = configRouteMap[item.id] ?? "/admin/services";
                  const tone =
                    item.tone === "green" || item.tone === "orange" || item.tone === "red"
                      ? item.tone
                      : "blue";
                  return (
                    <tr key={item.id} className="align-top">
                      <td className="px-3 py-3">
                        <Link to={to} className="font-semibold text-gray-900 hover:text-blue-700">
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{item.extra}</td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded px-2 py-1 text-xs font-semibold",
                            toneClass[tone].badge,
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <BedStatusChart items={data.bedStatusBreakdown} />
      <DashboardQuickActions actions={adminWorkItems} />
    </DashboardPageShell>
  );
}
