import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Search } from "lucide-react";
import { toast } from "sonner";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkflowStore } from "@/lib/workflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accountant/thanh-toan-tra-phong")({
  component: AccountantSettlementPage,
});

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

function AccountantSettlementPage() {
  return <AccountantSettlementScreen currentPath="/accountant/thanh-toan-tra-phong" />;
}

export function AccountantSettlementScreen({ currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("accountant");
  const { depositRequests } = useWorkflowStore();

  const queue = useMemo(
    () => depositRequests.filter((item) => item.status === "pending_settlement"),
    [depositRequests],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.find((item) => item.id === selectedId) ?? null;

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath={currentPath}>
      <div className="flex h-full overflow-hidden">
        <QueuePanel items={queue} selectedId={selectedId} onSelect={setSelectedId} />
        <SettlementWorkspace request={selected} />
      </div>
    </RoleShell>
  );
}

function QueuePanel({
  items,
  selectedId,
  onSelect,
}: {
  items: ReturnType<typeof useWorkflowStore>["depositRequests"];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.code.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q)
    );
  });

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Phiếu đối soát đã chốt</h2>
        <p className="mt-0.5 text-xs text-gray-400">{filtered.length} phiếu cần thanh toán</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm mã phiếu, khách, phòng..."
            className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-900"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {filtered.map((item) => {
            const dueTotal =
              item.reconciliationItems?.reduce((sum, line) => sum + line.amount, 0) ?? 0;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                    selectedId === item.id && "border-l-amber-500 bg-amber-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{item.code}</span>
                    <Badge className="h-5 bg-orange-100 text-[10px] font-semibold text-orange-700">
                      Có khoản cần thu
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {item.customerName}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500">{item.room}</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(dueTotal)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function SettlementWorkspace({
  request,
}: {
  request: ReturnType<typeof useWorkflowStore>["depositRequests"][number] | null;
}) {
  const { settleDepositReconciliation } = useWorkflowStore();

  if (!request) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Chọn phiếu đối soát để xử lý thanh toán.</p>
      </section>
    );
  }

  const dueTotal = request.reconciliationItems?.reduce((sum, line) => sum + line.amount, 0) ?? 0;

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{request.code}</h1>
          <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">Đã chốt</Badge>
          <span className="text-xs text-gray-500">
            {request.customerName} • {request.room}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">Tổng nợ cần thu</p>
          <p className="font-mono text-sm font-bold text-gray-900">{formatCurrency(dueTotal)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Card className="rounded-lg border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 text-xs">Mã hóa đơn</TableHead>
                  <TableHead className="text-xs">Nội dung</TableHead>
                  <TableHead className="px-4 text-right text-xs">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.reconciliationItems?.map((item) => (
                  <TableRow key={item.id} className="hover:bg-transparent">
                    <TableCell className="px-4 py-2 text-sm font-mono text-gray-700">
                      {item.id}
                    </TableCell>
                    <TableCell className="py-2 text-sm text-gray-600">{item.description}</TableCell>
                    <TableCell className="px-4 py-2 text-right font-mono text-sm text-gray-900">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-transparent">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={2} className="px-4 py-3 text-right text-sm font-bold">
                    Tổng cần thu:
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-mono text-lg font-bold text-blue-700">
                    {formatCurrency(dueTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <p className="text-xs text-gray-500">
          Sau khi xác nhận, hệ thống sẽ tạo phiếu thu và cập nhật trạng thái phiếu đối soát thành
          "Đã tất toán".
        </p>
        <Button
          type="button"
          onClick={() => {
            settleDepositReconciliation(request.id);
            toast.success("Phiếu đối soát đã được tất toán và ghi nhận thanh toán.");
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CreditCard className="size-4" />
          Tiến hành thu tiền
        </Button>
      </footer>
    </section>
  );
}
