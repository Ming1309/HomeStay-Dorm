import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkflowStore } from "@/lib/workflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/manager/reports")({
  component: ManagerReportsPage,
});

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

const depositStatusConfig: Record<string, { label: string; className: string }> = {
  init: { label: "Khởi tạo", className: "bg-gray-100 text-gray-600" },
  pending_payment: { label: "Chờ thanh toán", className: "bg-amber-100 text-amber-700" },
  pending_reconciliation: { label: "Chờ đối chiếu", className: "bg-blue-100 text-blue-700" },
  supplement_required: { label: "Cần bổ sung", className: "bg-rose-100 text-rose-700" },
  paid: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
};

function ManagerReportsPage() {
  const allowed = useRoleGuard("manager");
  const { contracts, paymentLogs, depositRequests } = useWorkflowStore();
  if (!allowed) return null;

  const totalRevenue = paymentLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalDebt = contracts.reduce(
    (sum, c) => sum + Math.max(c.invoiceTotal - c.paidAmount, 0),
    0,
  );

  return (
    <RoleShell role="manager" currentPath="/manager/reports">
      <div className="h-full overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Tiến độ thu tiền</p>
              <div className="mt-3 h-4 overflow-hidden rounded bg-gray-100">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      (totalRevenue /
                        Math.max(
                          contracts.reduce((sum, c) => sum + c.invoiceTotal, 0),
                          1,
                        )) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">Đã thu: {formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-600">Còn nợ: {formatCurrency(totalDebt)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Trạng thái hợp đồng</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>
                  Chờ thanh toán: {contracts.filter((c) => c.status === "pending_payment").length}
                </li>
                <li>
                  Thanh toán một phần:{" "}
                  {contracts.filter((c) => c.status === "partial_payment").length}
                </li>
                <li>
                  Chờ bàn giao: {contracts.filter((c) => c.status === "pending_handover").length}
                </li>
                <li>Đã bàn giao: {contracts.filter((c) => c.status === "handed_over").length}</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Trạng thái phiếu cọc</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>Khởi tạo: {depositRequests.filter((d) => d.status === "init").length}</li>
                <li>
                  Chờ thanh toán:{" "}
                  {depositRequests.filter((d) => d.status === "pending_payment").length}
                </li>
                <li>
                  Chờ đối chiếu:{" "}
                  {depositRequests.filter((d) => d.status === "pending_reconciliation").length}
                </li>
                <li>
                  Cần bổ sung:{" "}
                  {depositRequests.filter((d) => d.status === "supplement_required").length}
                </li>
                <li>Đã thanh toán: {depositRequests.filter((d) => d.status === "paid").length}</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-700">Công nợ hợp đồng</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3 py-2 text-xs">Hợp đồng</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Khách hàng</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Trạng thái</TableHead>
                  <TableHead className="px-3 py-2 text-right text-xs">Còn nợ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts
                  .filter((c) => Math.max(c.invoiceTotal - c.paidAmount, 0) > 0)
                  .map((c) => {
                    const debt = Math.max(c.invoiceTotal - c.paidAmount, 0);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="px-3 py-2 font-mono text-sm">{c.id}</TableCell>
                        <TableCell className="px-3 py-2 text-sm">{c.customerName}</TableCell>
                        <TableCell className="px-3 py-2 text-sm">{c.status}</TableCell>
                        <TableCell className="px-3 py-2 text-right font-mono text-sm text-red-600">
                          {formatCurrency(debt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-700">Phiếu cọc gần đây</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3 py-2 text-xs">Mã phiếu</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Khách hàng</TableHead>
                  <TableHead className="px-3 py-2 text-xs">Trạng thái</TableHead>
                  <TableHead className="px-3 py-2 text-right text-xs">Tiền cọc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...depositRequests]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 10)
                  .map((d) => {
                    const config = depositStatusConfig[d.status] ?? {
                      label: d.status,
                      className: "bg-gray-100 text-gray-600",
                    };
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="px-3 py-2 font-mono text-sm">{d.code}</TableCell>
                        <TableCell className="px-3 py-2 text-sm">{d.customerName}</TableCell>
                        <TableCell className="px-3 py-2">
                          <Badge className={cn("h-5 text-[10px]", config.className)}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right font-mono text-sm">
                          {d.depositAmount != null ? formatCurrency(d.depositAmount) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
