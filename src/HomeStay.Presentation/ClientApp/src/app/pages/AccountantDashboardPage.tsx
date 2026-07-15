import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  CreditCard,
  HandCoins,
  ReceiptText,
  Undo2,
} from "lucide-react";
import { useMemo, type ComponentType } from "react";

import { cn } from "@/shared/lib/utils";
import { useWorkflowStore } from "@/app/providers/workflow-store";

const quickActions = [
  {
    to: "/accountant/payments",
    title: "Thu tiền hợp đồng",
    description: "Ghi nhận thanh toán và công nợ",
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

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});



export function AccountantDashboardPage() {
  const {
    contracts,
    paymentLogs,
    todayCollected,
    outstandingDebt,
    partialContractsCount,
    receiptVouchers,
    refundVouchers,
    compensationInvoices,
    getReconciliation,
  } = useWorkflowStore();

  const dashboard = useMemo(() => {
    const pendingPaymentContracts = contracts.filter((item) =>
      ["pending_payment", "partial_payment"].includes(item.status),
    );
    const settlementContracts = contracts.filter((item) => item.status === "pending_settlement");
    const refundDue = settlementContracts.filter((item) => {
      const reconciliation = getReconciliation(item.id);
      return reconciliation ? reconciliation.netRefund > 0 : false;
    });
    const additionalDue = settlementContracts.filter((item) => {
      const reconciliation = getReconciliation(item.id);
      return reconciliation ? reconciliation.additionalDue > 0 : false;
    });
    const draftedCompensation = compensationInvoices.filter((item) => item.status === "draft");
    const pendingVoucherCount = Math.max(
      refundDue.length + additionalDue.length - receiptVouchers.length - refundVouchers.length,
      0,
    );

    return {
      kpis: [
        {
          label: "Tiền thu hôm nay",
          value: currency.format(todayCollected),
          subtext: `${paymentLogs.length} giao dịch đã ghi nhận`,
          icon: HandCoins,
          tone: "green",
        },
        {
          label: "Công nợ còn lại",
          value: currency.format(outstandingDebt),
          subtext: `${pendingPaymentContracts.length} hợp đồng cần thu`,
          icon: CreditCard,
          tone: "orange",
        },
        {
          label: "Thanh toán một phần",
          value: String(partialContractsCount),
          subtext: "Cần theo dõi phần còn lại",
          icon: AlertCircle,
          tone: "red",
        },
        {
          label: "Phiếu thu/hoàn cần xử lý",
          value: String(pendingVoucherCount),
          subtext: `${refundDue.length} hoàn cọc, ${additionalDue.length} thu thêm`,
          icon: ReceiptText,
          tone: "blue",
        },
      ],
      tasks: [
        {
          text: `${pendingPaymentContracts.length} hợp đồng chờ thu tiền`,
          meta:
            pendingPaymentContracts[0]?.customerName ??
            "Không có hợp đồng nào đang chờ thu trong danh sách.",
          to: "/accountant/payments",
          tone: pendingPaymentContracts.length ? "orange" : "green",
        },
        {
          text: `${settlementContracts.length} hợp đồng chờ đối soát trả phòng`,
          meta: `${refundDue.length} hồ sơ có hoàn cọc, ${additionalDue.length} hồ sơ cần thu thêm`,
          to: "/accountant/doi-soat",
          tone: settlementContracts.length ? "blue" : "green",
        },
        {
          text: `${draftedCompensation.length} hóa đơn bồi thường nháp`,
          meta:
            draftedCompensation[0]?.customerName ??
            "Hóa đơn đã phát hành sẽ được lưu tại nghiệp vụ bồi thường.",
          to: "/accountant/compensation",
          tone: draftedCompensation.length ? "red" : "green",
        },
      ],
      recentTransactions: paymentLogs.slice(0, 5),
    } as const;
  }, [
    compensationInvoices,
    contracts,
    getReconciliation,
    outstandingDebt,
    partialContractsCount,
    paymentLogs,
    receiptVouchers.length,
    refundVouchers.length,
    todayCollected,
  ]);

  return (
    <main className="h-full overflow-y-auto bg-gray-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Tổng quan Kế toán</h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi thu tiền, công nợ, đối soát và hoàn cọc trong ngày.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Dữ liệu vận hành hiện tại
            </div>
          </header>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.kpis.map((item) => (
              <KpiCard key={item.label} {...item} />
            ))}
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
            <TaskPanel title="Việc cần xử lý" tasks={dashboard.tasks} />
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Giao dịch gần nhất</h2>
                  <p className="mt-1 text-sm text-gray-500">Các khoản thu đã ghi nhận</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Khách hàng</th>
                      <th className="px-3 py-2">Phòng</th>
                      <th className="px-3 py-2 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {dashboard.recentTransactions.length > 0 ? (
                      dashboard.recentTransactions.map((item) => (
                        <tr key={item.id} className="align-top">
                          <td className="px-3 py-3 font-semibold text-gray-900">
                            {item.customerName}
                          </td>
                          <td className="px-3 py-3 font-mono text-gray-700">{item.room}</td>
                          <td className="px-3 py-3 text-right font-semibold text-emerald-700">
                            {currency.format(item.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={3}>
                          Chưa có giao dịch nào trong phiên làm việc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <QuickActions />
        </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: ComponentType<{ className?: string }>;
  tone: keyof typeof toneClass;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            toneClass[tone].iconBg,
          )}
        >
          <Icon className={cn("size-5", toneClass[tone].iconText)} />
        </div>
        <span className={cn("text-right text-xs font-medium", toneClass[tone].text)}>
          {subtext}
        </span>
      </div>
      <div className="mt-4">
        <div className="break-words text-2xl font-bold tracking-tight text-gray-900 xl:text-3xl">
          {value}
        </div>
        <div className="mt-1 text-sm font-medium text-gray-600">{label}</div>
      </div>
    </div>
  );
}

function TaskPanel({
  title,
  tasks,
}: {
  title: string;
  tasks: ReadonlyArray<{
    text: string;
    meta: string;
    to: (typeof quickActions)[number]["to"] | "/accountant/compensation";
    tone: keyof typeof toneClass;
  }>;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">Các đầu việc ảnh hưởng đến dòng tiền</p>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((item) => (
          <Link
            key={item.text}
            to={item.to}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 transition-colors hover:bg-blue-50/40"
          >
            <div
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                toneClass[item.tone].iconBg,
              )}
            >
              {item.tone === "red" ? (
                <AlertCircle className={cn("size-4", toneClass[item.tone].iconText)} />
              ) : (
                <Circle className={cn("size-3.5", toneClass[item.tone].iconText)} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.text}</p>
              <p className="mt-1 text-xs text-gray-500">{item.meta}</p>
            </div>
            <span className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700">Xử lý</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Thao tác nhanh</h2>
          <p className="mt-1 text-sm text-gray-500">Mở nhanh các nghiệp vụ kế toán thường dùng</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-gray-900">{action.title}</h3>
                <p className="mt-0.5 truncate text-xs text-gray-500">{action.description}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-gray-300 transition-colors group-hover:text-blue-600" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const toneClass = {
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    text: "text-blue-600",
  },
  green: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    text: "text-emerald-600",
  },
  orange: {
    iconBg: "bg-orange-50",
    iconText: "text-orange-600",
    text: "text-orange-600",
  },
  red: {
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    text: "text-red-600",
  },
} as const;
