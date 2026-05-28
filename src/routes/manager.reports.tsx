import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
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

export const Route = createFileRoute("/manager/reports")({
  component: ManagerReportsPage,
});

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

function ManagerReportsPage() {
  const allowed = useRoleGuard("manager");
  const { contracts, paymentLogs } = useWorkflowStore();
  if (!allowed) return null;

  const totalRevenue = paymentLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalDebt = contracts.reduce(
    (sum, c) => sum + Math.max(c.invoiceTotal - c.paidAmount, 0),
    0,
  );

  return (
    <RoleShell role="manager" currentPath="/manager/reports">
      <div className="h-full overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-2 text-xs">Hợp đồng</TableHead>
                <TableHead className="px-3 py-2 text-xs">Khách hàng</TableHead>
                <TableHead className="px-3 py-2 text-xs">Trạng thái</TableHead>
                <TableHead className="px-3 py-2 text-right text-xs">Đã thu</TableHead>
                <TableHead className="px-3 py-2 text-right text-xs">Còn nợ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => {
                const debt = Math.max(c.invoiceTotal - c.paidAmount, 0);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="px-3 py-2 font-mono text-sm">{c.id}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">{c.customerName}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">{c.status}</TableCell>
                    <TableCell className="px-3 py-2 text-right font-mono text-sm">
                      {formatCurrency(c.paidAmount)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-right font-mono text-sm">
                      {formatCurrency(debt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleShell>
  );
}
