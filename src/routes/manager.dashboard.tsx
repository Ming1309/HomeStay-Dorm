import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  DoorOpen,
  Home,
  ScrollText,
  ShieldCheck,
  ShieldHalf,
} from "lucide-react";
import { useEffect, useMemo, type ComponentType } from "react";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflow-store";

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

export function ManagerDashboardScreen({ currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("manager");
  const { contracts, depositRequests, assetRecoveries, terminationRecords, pendingHandoverCount } =
    useWorkflowStore();

  const dashboard = useMemo(() => {
    const pendingApprovalContracts = contracts.filter((contract) =>
      contract.members.some((member) => member.status === "pending"),
    );
    const pendingDepositConfirmations = depositRequests.filter(
      (deposit) => deposit.status === "pending_reconciliation",
    );
    const pendingHandoverContracts = contracts.filter(
      (contract) => contract.status === "pending_handover",
    );
    const pendingSettlementContracts = contracts.filter(
      (contract) => contract.status === "pending_settlement",
    );
    const recoveredContractIds = new Set(assetRecoveries.map((item) => item.contractId));
    const terminatedContractIds = new Set(terminationRecords.map((item) => item.contractId));
    const pendingAssetRecovery = pendingSettlementContracts.filter(
      (contract) => !recoveredContractIds.has(contract.id),
    );
    const pendingTermination = pendingSettlementContracts.filter((contract) =>
      recoveredContractIds.has(contract.id) && !terminatedContractIds.has(contract.id),
    );

    return {
      kpis: [
        {
          label: "Hồ sơ chờ duyệt",
          value: String(pendingApprovalContracts.length),
          subtext: "Thành viên cần kiểm tra",
          icon: ShieldCheck,
          tone: "blue",
        },
        {
          label: "Cọc chờ xác nhận",
          value: String(pendingDepositConfirmations.length),
          subtext: "Chứng từ khách đã gửi",
          icon: ShieldHalf,
          tone: "orange",
        },
        {
          label: "Phòng chờ bàn giao",
          value: String(pendingHandoverCount),
          subtext: "Sau khi đã thanh toán",
          icon: DoorOpen,
          tone: "green",
        },
        {
          label: "Hợp đồng chờ thanh lý",
          value: String(pendingTermination.length),
          subtext: `${pendingAssetRecovery.length} hồ sơ cần thu hồi tài sản`,
          icon: ScrollText,
          tone: "red",
        },
      ],
      tasks: [
        {
          text: `${pendingApprovalContracts.length} hồ sơ lưu trú cần xét duyệt`,
          meta:
            pendingApprovalContracts[0]?.customerName ??
            "Không còn hồ sơ nào cần kiểm tra điều kiện lưu trú.",
          to: "/manager/approval",
          tone: pendingApprovalContracts.length ? "blue" : "green",
        },
        {
          text: `${pendingDepositConfirmations.length} chứng từ cọc chờ xác nhận`,
          meta:
            pendingDepositConfirmations[0]?.customerName ??
            "Các phiếu cọc hiện tại chưa có chứng từ mới cần đối chiếu.",
          to: "/manager/confirm-deposit",
          tone: pendingDepositConfirmations.length ? "orange" : "green",
        },
        {
          text: `${pendingHandoverContracts.length} phòng chờ bàn giao`,
          meta:
            pendingHandoverContracts[0]?.room ??
            "Chưa có phòng nào sẵn sàng bàn giao trong hàng chờ.",
          to: "/manager/handover",
          tone: pendingHandoverContracts.length ? "blue" : "green",
        },
        {
          text: `${pendingAssetRecovery.length} hồ sơ trả phòng cần thu hồi tài sản`,
          meta:
            pendingAssetRecovery[0]?.customerName ??
            "Các hồ sơ trả phòng đã có biên bản tài sản hoặc chưa phát sinh.",
          to: "/manager/thu-hoi-tai-san",
          tone: pendingAssetRecovery.length ? "red" : "green",
        },
      ],
      handoverQueue: pendingHandoverContracts.slice(0, 5),
    };
  }, [assetRecoveries, contracts, depositRequests, pendingHandoverCount, terminationRecords]);

  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath={currentPath}>
      <main className="h-full overflow-y-auto bg-gray-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Tổng quan Quản lý
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi duyệt hồ sơ, xác nhận cọc, bàn giao và trả phòng.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Cập nhật theo hàng chờ vận hành
            </div>
          </header>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.kpis.map((item) => (
              <KpiCard key={item.label} {...item} />
            ))}
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
            <TaskPanel tasks={dashboard.tasks} />
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Hàng chờ bàn giao</h2>
                  <p className="mt-1 text-sm text-gray-500">Hợp đồng đã thanh toán và chờ nhận phòng</p>
                </div>
                <Link
                  to="/manager/handover"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Xem tất cả
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Khách hàng</th>
                      <th className="px-3 py-2">Phòng</th>
                      <th className="px-3 py-2">Thành viên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {dashboard.handoverQueue.length > 0 ? (
                      dashboard.handoverQueue.map((item) => (
                        <tr key={item.id} className="align-top">
                          <td className="px-3 py-3 font-semibold text-gray-900">
                            {item.customerName}
                          </td>
                          <td className="px-3 py-3 font-mono text-gray-700">{item.room}</td>
                          <td className="px-3 py-3 text-gray-600">{item.members.length} người</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={3}>
                          Chưa có hợp đồng nào chờ bàn giao phòng.
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
    </RoleShell>
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
        <div className={cn("flex size-10 items-center justify-center rounded-lg", toneClass[tone].iconBg)}>
          <Icon className={cn("size-5", toneClass[tone].iconText)} />
        </div>
        <span className={cn("text-right text-xs font-medium", toneClass[tone].text)}>{subtext}</span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-gray-900">{value}</div>
        <div className="mt-1 text-sm font-medium text-gray-600">{label}</div>
      </div>
    </div>
  );
}

function TaskPanel({
  tasks,
}: {
  tasks: Array<{ text: string; meta: string; to: (typeof quickActions)[number]["to"]; tone: keyof typeof toneClass }>;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Việc cần xử lý</h2>
          <p className="mt-1 text-sm text-gray-500">Các đầu việc ảnh hưởng đến nhận phòng và trả phòng</p>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((item) => (
          <Link
            key={item.text}
            to={item.to}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 transition-colors hover:bg-blue-50/40"
          >
            <div className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", toneClass[item.tone].iconBg)}>
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
          <p className="mt-1 text-sm text-gray-500">Mở nhanh các nghiệp vụ quản lý thường dùng</p>
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
