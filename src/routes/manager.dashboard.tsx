import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ComponentType } from "react";
import { ArrowRight, CircleDollarSign, Clock3, HandCoins, ReceiptText } from "lucide-react";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/manager/dashboard")({
  component: ManagerDashboardPage,
});

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

function ManagerDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/manager" });
  }, [navigate]);

  return null;
}

export function ManagerDashboardScreen({ currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("manager");
  const { todayCollected, outstandingDebt, partialContractsCount, pendingHandoverCount } =
    useWorkflowStore();
  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath={currentPath}>
      <div className="h-full overflow-y-auto p-5">
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            icon={CircleDollarSign}
            label="Thu hôm nay"
            value={formatCurrency(todayCollected)}
          />
          <KpiCard icon={HandCoins} label="Công nợ tồn" value={formatCurrency(outstandingDebt)} />
          <KpiCard
            icon={ReceiptText}
            label="HĐ thanh toán một phần"
            value={String(partialContractsCount)}
          />
          <KpiCard icon={Clock3} label="Chờ bàn giao" value={String(pendingHandoverCount)} />
        </div>
        <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-bold text-gray-800">Tác vụ ưu tiên</h2>
          <div className="mt-3 flex items-center gap-3">
            <Link
              to="/manager/approval"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Mở hàng đợi duyệt bàn giao
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/manager/reports"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Xem báo cáo tiến độ
            </Link>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-lg border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
          <Icon className="size-4 text-blue-600" />
        </div>
        <p className="mt-2 font-mono text-xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}
