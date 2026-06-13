import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Search } from "lucide-react";
import { toast } from "sonner";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ReceiptCollectionDialog,
  type ReceiptCollectionInvoice,
} from "@/components/contract/ReceiptCollectionDialog";
import { useWorkflowStore, type ContractItem, type ReceiptVoucher } from "@/lib/workflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accountant/payments")({
  component: AccountantPaymentsPage,
});

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

function AccountantPaymentsPage() {
  return <AccountantPaymentsScreen currentPath="/accountant/payments" />;
}

export function AccountantPaymentsScreen({ currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("accountant");
  const { contracts } = useWorkflowStore();

  const queue = useMemo(
    () => contracts.filter((c) => c.status === "pending_payment" || c.status === "partial_payment"),
    [contracts],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.find((q) => q.id === selectedId) ?? null;

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath={currentPath}>
      <div className="flex h-full overflow-hidden">
        <QueuePanel items={queue} selectedId={selectedId} onSelect={setSelectedId} />
        <PaymentsWorkspace contract={selected} />
      </div>
    </RoleShell>
  );
}

function QueuePanel({
  items,
  selectedId,
  onSelect,
}: {
  items: ReturnType<typeof useWorkflowStore>["contracts"];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.id.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q)
    );
  });

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Hợp đồng chờ thanh toán</h2>
        <p className="mt-0.5 text-xs text-gray-400">{filtered.length} hợp đồng cần xử lý</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm hợp đồng, khách, phòng..."
            className="h-8 border-gray-200 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {filtered.map((item) => {
            const remainingDue = Math.max(item.invoiceTotal - item.paidAmount, 0);
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
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {item.id}
                    </span>
                    {item.status === "partial_payment" ? (
                      <Badge className="h-5 bg-orange-100 text-[10px] font-semibold text-orange-700">
                        Thanh toán một phần
                      </Badge>
                    ) : (
                      <Badge className="h-5 bg-amber-100 text-[10px] font-semibold text-amber-700">
                        Chờ thanh toán
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {item.customerName}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500">{item.room}</span>
                    {item.status === "partial_payment" ? (
                      <span className="text-gray-500">
                        Gốc: {formatCurrency(item.invoiceTotal)}
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-700">
                        {formatCurrency(remainingDue)}
                      </span>
                    )}
                  </div>
                  {item.status === "partial_payment" && (
                    <p className="text-right text-xs font-bold text-red-600">
                      Còn nợ: {formatCurrency(remainingDue)}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function PaymentsWorkspace({
  contract,
}: {
  contract: ReturnType<typeof useWorkflowStore>["contracts"][number] | null;
}) {
  const { collectReceiptForInvoices } = useWorkflowStore();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [issuedVoucher, setIssuedVoucher] = useState<ReceiptVoucher | null>(null);

  if (!contract) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Chọn hợp đồng để bắt đầu thu tiền.</p>
      </section>
    );
  }

  const remaining = Math.max(contract.invoiceTotal - contract.paidAmount, 0);
  const invoices = buildReceiptInvoices(contract);
  const statusLabel = contract.status === "partial_payment" ? "Thanh toán một phần" : "Chờ thanh toán";

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{contract.id}</h1>
          <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">
            {statusLabel}
          </Badge>
          <span className="text-xs text-gray-500">
            {contract.customerName} • {contract.room}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">TỔNG CẦN THANH TOÁN</p>
          <p className="font-mono text-lg font-bold text-gray-900">{formatCurrency(remaining)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin hợp đồng</h3>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Info label="Mã hợp đồng" value={contract.id} mono />
                <Info label="Khách hàng/Đại diện" value={contract.customerName} />
                <Info label="Phòng/Giường" value={contract.room} mono />
                <Info label="Số điện thoại" value={contract.phone} mono />
                <Info label="Thời hạn thuê" value={contract.rentalPeriod} />
                <Info label="Kỳ thanh toán" value="1 tháng/lần" />
                <Info label="Giá thuê" value={`${formatCurrency(getBaseRent(contract))}/tháng`} mono />
              </div>
            </CardContent>
          </Card>

        <Card className="rounded-lg border-gray-200">
          <CardContent className="p-0">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-xs font-semibold text-gray-700">Chi tiết khoản thu kỳ đầu</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 text-xs">Khoản thu</TableHead>
                  <TableHead className="text-xs">Số lượng/Kỳ</TableHead>
                  <TableHead className="px-4 text-right text-xs">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract.lines.map((line) => (
                  <TableRow key={line.id} className="hover:bg-transparent">
                    <TableCell className="px-4 py-2 text-sm">{line.description}</TableCell>
                    <TableCell className="py-2 text-sm text-gray-500">
                      {getFirstPaymentCycle(line.description, line.cycle)}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-right font-mono text-sm">
                      {formatCurrency(line.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-transparent">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={2} className="px-4 py-2 text-right text-sm">
                    Tổng khoản thu:
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right font-mono text-sm">
                    {formatCurrency(contract.invoiceTotal)}
                  </TableCell>
                </TableRow>
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={2} className="px-4 py-2 text-right text-sm text-gray-500">
                    Đã thu cho kỳ đầu:
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right font-mono text-sm text-gray-500">
                    {formatCurrency(contract.paidAmount)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50/50">
                  <TableCell colSpan={2} className="px-4 py-3 text-right text-base font-bold">
                    Tổng cần thanh toán:
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-mono text-lg font-bold text-blue-700">
                    {formatCurrency(remaining)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <div className="text-xs text-gray-400">
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            S
          </kbd>{" "}
          : Tiến hành thu tiền
        </div>
        <Button type="button" onClick={() => setReceiptOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <CreditCard className="size-4" />
          Tiến hành thu tiền
        </Button>
      </footer>

      <ReceiptCollectionDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        source="contract_payment"
        contextLabel="Thu tiền hợp đồng"
        customerName={contract.customerName}
        room={contract.room}
        contractCode={getContractDisplayCode(contract.id)}
        invoices={invoices}
        totalDebt={remaining}
        onSubmit={(data) => {
          const result = collectReceiptForInvoices({
            source: "contract_payment",
            contractId: contract.id,
            customerName: contract.customerName,
            amount: data.amount,
            totalDebt: remaining,
            paymentMethod: data.paymentMethod,
            collector: data.collector,
            date: data.collectedAt,
            note: data.note,
          });
          setIssuedVoucher(result.voucher);
          setReceiptOpen(false);
          if (result.scenario === "full") {
            setSuccessOpen(true);
            toast.success("Thanh toán hợp đồng thành công", {
              icon: <CheckCircle2 className="size-4 text-emerald-600" />,
            });
          } else {
            toast.success("Lập phiếu thu thành công. Hợp đồng tiếp tục thanh toán một phần.");
          }
        }}
      />
      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        voucher={issuedVoucher}
        contractId={contract.id}
      />
    </section>
  );
}

function buildReceiptInvoices(contract: ContractItem): ReceiptCollectionInvoice[] {
  let remainingPaid = contract.paidAmount;
  return contract.lines.map((line, index) => {
    const paid = Math.min(remainingPaid, line.amount);
    remainingPaid = Math.max(remainingPaid - paid, 0);
    const remaining = Math.max(line.amount - paid, 0);
    return {
      code: `HD-TH-${String(index + 1).padStart(3, "0")}`,
      type: "Tiền thuê kỳ đầu",
      description: line.description,
      amount: line.amount,
      paid,
      remaining,
    };
  });
}

function getContractDisplayCode(contractId: string): string {
  return contractId;
}

function getBaseRent(contract: ContractItem): number {
  return contract.lines.find((line) => line.description.includes("Tiền thuê"))?.amount ?? 0;
}

function getFirstPaymentCycle(description: string, fallback: string): string {
  if (description.includes("Phí dọn phòng")) return "1 lần";
  if (description.includes("Phí gửi xe")) return "1 tháng";
  return fallback;
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={cn("text-sm text-gray-800", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SuccessDialog({
  open,
  onOpenChange,
  voucher,
  contractId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: ReceiptVoucher | null;
  contractId: string;
}) {
  if (!voucher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Thanh toán hợp đồng thành công</DialogTitle>
          <DialogDescription>
            Hóa đơn kỳ đầu và Phiếu thu đã được tạo. Hợp đồng {contractId} đã được chuyển sang trạng
            thái ‘Chờ bàn giao’.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
            Xem phiếu thu
          </Button>
          <Button type="button" className="h-8 bg-blue-600 text-xs hover:bg-blue-700" onClick={() => onOpenChange(false)}>
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
