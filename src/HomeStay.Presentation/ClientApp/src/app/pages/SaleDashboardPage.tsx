import {
  BedDouble,
  CalendarDays,
  FileText,
  HandCoins,
  ReceiptText,
  UserPlus,
  Users,
} from "lucide-react";

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
import { useSaleDashboard } from "@/features/dashboards/hooks/use-role-dashboards";

const quickActions = [
  {
    to: "/sale/lap-phieu-coc",
    title: "Lập phiếu cọc",
    description: "Tạo phiếu từ lịch hẹn thành công",
    icon: ReceiptText,
  },
  {
    to: "/sale/ghi-nhan-coc",
    title: "Ghi nhận cọc",
    description: "Cập nhật chứng từ thanh toán",
    icon: HandCoins,
  },
  {
    to: "/sale/lap-phieu-dang-ky",
    title: "Lập phiếu đăng ký",
    description: "Tạo hồ sơ tư vấn mới",
    icon: UserPlus,
  },
  {
    to: "/sale/lich-hen",
    title: "Tạo lịch hẹn",
    description: "Đặt lịch xem phòng",
    icon: CalendarDays,
  },
  {
    to: "/sale/lap-hop-dong",
    title: "Lập hợp đồng thuê",
    description: "Soạn hợp đồng cho khách đã cọc",
    icon: FileText,
  },
  {
    to: "/sale/ho-so-luu-tru",
    title: "Nhập hồ sơ lưu trú",
    description: "Bổ sung thông tin người ở",
    icon: Users,
  },
] as const;

const kpiIcons = {
  "lich-hen-hom-nay": CalendarDays,
  "phieu-coc-cho-thanh-toan": HandCoins,
  "hop-dong-cho-lap": FileText,
  "giuong-trong": BedDouble,
};

export function SaleDashboardPortalPage() {
  const query = useSaleDashboard();

  if (query.isLoading && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Sale"
        description="Theo dõi lịch hẹn, phiếu cọc và hợp đồng cần xử lý"
      >
        <DashboardLoadingState />
      </DashboardPageShell>
    );
  }

  if (query.isError && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Sale"
        description="Theo dõi lịch hẹn, phiếu cọc và hợp đồng cần xử lý"
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
      title="Tổng quan Sale"
      description="Theo dõi lịch hẹn, phiếu cọc và hợp đồng cần xử lý"
      asOf={data.meta.asOf}
      scopeLabel={data.meta.scopeLabel}
      isFetching={query.isFetching}
      onRefresh={() => void query.refetch()}
    >
      {query.isError ? (
        <DashboardStaleBanner message="Không làm mới được dữ liệu. Đang hiển thị snapshot gần nhất." />
      ) : null}
      <DashboardKpiGrid items={data.kpis} icons={kpiIcons} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <DashboardTaskPanel
          description="Các đầu việc ảnh hưởng trực tiếp đến đặt cọc và nhận phòng"
          tasks={data.tasks}
        />
        <DashboardQueueTable
          title="Lịch hẹn gần nhất"
          description="Theo dõi khách sắp xem phòng"
          viewAllTo="/sale/tra-cuu-lich-hen"
          columns={["Khách hàng", "Thời gian", "Phòng", "Trạng thái"]}
          rows={data.recentAppointments}
          emptyText="Không có lịch hẹn trong ngày."
        />
      </div>
      <DashboardQuickActions actions={quickActions} />
    </DashboardPageShell>
  );
}
