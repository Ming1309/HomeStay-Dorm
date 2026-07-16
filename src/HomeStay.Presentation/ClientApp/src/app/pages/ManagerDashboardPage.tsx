import { useNavigate } from "@tanstack/react-router";
import {
  ClipboardCheck,
  DoorOpen,
  Home,
  ScrollText,
  ShieldCheck,
  ShieldHalf,
} from "lucide-react";
import { useEffect } from "react";

import {
  DashboardErrorState,
  DashboardKpiGrid,
  DashboardLoadingState,
  DashboardPageShell,
  DashboardQueueTable,
  DashboardQuickActions,
  DashboardStaleBanner,
  DashboardTaskPanel,
} from "@/features/dashboards/components/DashboardShell";
import { useManagerDashboard } from "@/features/dashboards/hooks/use-role-dashboards";
import { useRoleGuard } from "@/app/router/useRoleGuard";

export function ManagerDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/manager" });
  }, [navigate]);

  return null;
}

const quickActions = [
  {
    to: "/manager/approval",
    title: "Xét duyệt hồ sơ",
    description: "Duyệt điều kiện lưu trú",
    icon: ShieldCheck,
  },
  {
    to: "/manager/confirm-deposit",
    title: "Xác nhận tiền cọc",
    description: "Đối chiếu chứng từ cọc",
    icon: ShieldHalf,
  },
  {
    to: "/manager/handover",
    title: "Bàn giao phòng",
    description: "Ghi nhận tài sản bàn giao",
    icon: Home,
  },
  {
    to: "/manager/thu-hoi-tai-san",
    title: "Thu hồi tài sản",
    description: "Kiểm tra tài sản trả phòng",
    icon: ClipboardCheck,
  },
  {
    to: "/manager/termination",
    title: "Thanh lý hợp đồng",
    description: "Xác nhận hoàn tất trả phòng",
    icon: ScrollText,
  },
] as const;

const kpiIcons = {
  "ho-so-cho-duyet": ShieldCheck,
  "coc-cho-xac-nhan": ShieldHalf,
  "phong-cho-ban-giao": DoorOpen,
  "hop-dong-cho-thanh-ly": ScrollText,
};

export function ManagerDashboardScreen({ currentPath: _currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("manager");
  const query = useManagerDashboard();

  if (!allowed) return null;

  if (query.isLoading && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Quản lý"
        description="Theo dõi duyệt hồ sơ, xác nhận cọc, bàn giao và trả phòng."
      >
        <DashboardLoadingState />
      </DashboardPageShell>
    );
  }

  if (query.isError && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Quản lý"
        description="Theo dõi duyệt hồ sơ, xác nhận cọc, bàn giao và trả phòng."
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
      title="Tổng quan Quản lý"
      description="Theo dõi duyệt hồ sơ, xác nhận cọc, bàn giao và trả phòng."
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
          description="Các đầu việc ảnh hưởng đến nhận phòng và trả phòng"
          tasks={data.tasks}
        />
        <DashboardQueueTable
          title="Hàng chờ bàn giao"
          description="Hợp đồng đã thanh toán và chờ nhận phòng"
          viewAllTo="/manager/handover"
          columns={["Khách hàng", "Phòng", "Thành viên"]}
          rows={data.handoverQueue}
          emptyText="Chưa có hợp đồng nào chờ bàn giao phòng."
        />
      </div>
      <DashboardQuickActions actions={quickActions} />
    </DashboardPageShell>
  );
}
