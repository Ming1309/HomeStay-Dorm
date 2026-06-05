import { createFileRoute } from "@tanstack/react-router";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/accountant/transactions")({
  component: AccountantTransactionsPage,
});

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

function AccountantTransactionsPage() {
  const allowed = useRoleGuard("accountant");
  const { paymentLogs } = useWorkflowStore();
  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/transactions">
      <div className="h-full overflow-y-auto p-5">
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-2 text-xs">Thời gian</TableHead>
                <TableHead className="px-3 py-2 text-xs">Hợp đồng</TableHead>
                <TableHead className="px-3 py-2 text-xs">Khách hàng</TableHead>
                <TableHead className="px-3 py-2 text-xs">Phòng</TableHead>
                <TableHead className="px-3 py-2 text-xs">Phương thức</TableHead>
                <TableHead className="px-3 py-2 text-right text-xs">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="px-3 py-2 text-sm">
                    {new Date(log.time).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="px-3 py-2 font-mono text-sm">{log.contractId}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{log.customerName}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{log.room}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    {log.method === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-mono text-sm">
                    {formatCurrency(log.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {paymentLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-3 py-8 text-center text-sm text-gray-400">
                    Chưa có giao dịch trong ngày.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleShell>
  );
}
