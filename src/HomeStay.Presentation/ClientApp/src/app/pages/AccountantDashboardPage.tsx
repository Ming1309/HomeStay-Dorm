import {
  ClipboardCheck,
  CreditCard,
  HandCoins,
  ReceiptText,
  Undo2,
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
  ReceiptTrendChart,
} from "@/features/dashboards/components/DashboardShell";
import { useAccountantDashboard } from "@/features/dashboards/hooks/use-role-dashboards";

const quickActions = [
  {
    to: "/accountant/payments",
    title: "Thu tiền hợp đồng",
    description: "Ghi nhận thanh toán kỳ đầu",
    icon: CreditCard,
  },
  {
    to: "/accountant/doi-soat",
    title: "Lập phiếu đối soát",
    description: "Chốt hoàn cọc, khấu trừ, thu thêm",
    icon: ClipboardCheck,
  },
  {
    to: "/accountant/refunds",
    title: "Lập phiếu hoàn cọc",
    description: "Hoàn phần cọc còn lại",
    icon: Undo2,
  },
] as const;

const kpiIcons = {
  "tien-thu-hom-nay": HandCoins,
  "gia-tri-cho-thu": CreditCard,
  "cho-doi-soat": ClipboardCheck,
  "phieu-thu-hoan": ReceiptText,
};

export function AccountantDashboardPage() {
  const query = useAccountantDashboard();

  if (query.isLoading && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Kế toán"
        description="Theo dõi thu tiền, khoản chờ thu, đối soát và hoàn cọc trong ngày."
      >
        <DashboardLoadingState />
      </DashboardPageShell>
    );
  }

  if (query.isError && !query.data) {
    return (
      <DashboardPageShell
        title="Tổng quan Kế toán"
        description="Theo dõi thu tiền, khoản chờ thu, đối soát và hoàn cọc trong ngày."
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
      title="Tổng quan Kế toán"
      description="Theo dõi thu tiền, khoản chờ thu, đối soát và hoàn cọc trong ngày."
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
          description="Các đầu việc ảnh hưởng đến dòng tiền"
          tasks={data.tasks}
        />
        <DashboardQueueTable
          title="Giao dịch gần nhất"
          description="Các khoản thu/hoàn đã ghi nhận"
          columns={["Khách hàng", "Phòng", "Số tiền"]}
          rows={data.recentTransactions}
          emptyText="Chưa có giao dịch nào được ghi nhận."
          rightAlignLast
        />
      </div>
      <ReceiptTrendChart points={data.receiptTrend} />
      <DashboardQuickActions actions={quickActions} />
    </DashboardPageShell>
  );
}
