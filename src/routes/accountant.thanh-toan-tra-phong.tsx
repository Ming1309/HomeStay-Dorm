import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Info as InfoIcon, Search } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useWorkflowStore, type DepositRequest, type ReceiptVoucher } from "@/lib/workflow-store";

export const Route = createFileRoute("/accountant/thanh-toan-tra-phong")({
  component: AccountantSettlementPage,
});

const ACCOUNTANT_NAME = "Nguyễn Thị Thu — Kế toán";
const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

type InvoiceRow = ReceiptCollectionInvoice;

/** Row in the full deduction table (no paid/remaining split needed here) */
type DeductionRow = {
  code: string;
  type: string;
  description: string;
  amount: number;
};

function AccountantSettlementPage() {
  return <AccountantSettlementScreen currentPath="/accountant/thanh-toan-tra-phong" />;
}

export function AccountantSettlementScreen({ currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("accountant");
  const { depositRequests, receiptVouchers } = useWorkflowStore();

  const queue = useMemo(
    () =>
      depositRequests.filter((item) => {
        const additionalDue = getAdditionalDue(item);
        const paid = getPaidAmount(receiptVouchers, getContractCode(item));
        return item.status === "pending_settlement" && additionalDue > 0 && additionalDue - paid > 0;
      }),
    [depositRequests, receiptVouchers],
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

// ─── Left panel ──────────────────────────────────────────────────────────────

function QueuePanel({
  items,
  selectedId,
  onSelect,
}: {
  items: DepositRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { receiptVouchers } = useWorkflowStore();
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      getReconciliationCode(item).toLowerCase().includes(q) ||
      getContractCode(item).toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.room.toLowerCase().includes(q)
    );
  });

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Phiếu đối soát cần thu</h2>
        <p className="mt-0.5 text-xs text-gray-400">{filtered.length} phiếu cần thu thêm</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm phiếu đối soát, khách, phòng..."
            className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-xs text-gray-400">
            Không có phiếu đối soát nào cần thu thêm.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((item) => {
              const paid = getPaidAmount(receiptVouchers, getContractCode(item));
              const remaining = Math.max(getAdditionalDue(item) - paid, 0);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-rose-50/40",
                      selectedId === item.id && "border-l-rose-500 bg-rose-50/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {getReconciliationCode(item)}
                      </span>
                      <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                        Cần thu thêm
                      </Badge>
                    </div>
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {item.customerName}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-500">
                        {item.room} · {getContractCode(item)}
                      </span>
                      <span className="font-mono font-semibold text-rose-700">
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

// ─── Main workspace ───────────────────────────────────────────────────────────

function SettlementWorkspace({ request }: { request: DepositRequest | null }) {
  const { collectReceiptForInvoices, receiptVouchers, settleDepositReconciliation } =
    useWorkflowStore();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [issuedVoucher, setIssuedVoucher] = useState<ReceiptVoucher | null>(null);
  const [remainingAfterReceipt, setRemainingAfterReceipt] = useState(0);

  if (!request) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100">
            <CreditCard className="size-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">Chọn phiếu đối soát để xử lý</p>
          <p className="mt-1 text-xs text-gray-400">
            Chọn một phiếu trong danh sách bên trái để xem chi tiết
          </p>
        </div>
      </section>
    );
  }

  const reconciliationCode = getReconciliationCode(request);
  const contractCode = getContractCode(request);
  const paidAmount = getPaidAmount(receiptVouchers, contractCode);
  const reconciliationSummary = getReconciliationSummary(request);
  const remainingDebt = Math.max(reconciliationSummary.additionalDue - paidAmount, 0);

  // Full deduction rows (for the main deduction table)
  const deductionRows = buildDeductionRows(request);

  // Invoice rows for the ReceiptCollectionDialog (needs paid/remaining split)
  const invoiceRows = buildInvoiceRows(request, paidAmount);

  const handleCreateReceipt = (data: {
    amount: number;
    paymentMethod: "cash" | "bank-transfer";
    evidenceName: string;
    note: string;
    collector: string;
    collectedAt: string;
    scenario: "full" | "partial";
  }) => {
    const result = collectReceiptForInvoices({
      source: "checkout_settlement",
      contractId: contractCode,
      customerName: request.customerName,
      amount: data.amount,
      totalDebt: remainingDebt,
      paymentMethod: data.paymentMethod,
      collector: data.collector,
      date: data.collectedAt,
      note: data.note,
    });
    const nextRemainingDebt = Math.max(remainingDebt - data.amount, 0);
    setIssuedVoucher(result.voucher);
    setRemainingAfterReceipt(nextRemainingDebt);
    setReceiptOpen(false);
    setSuccessOpen(true);

    if (nextRemainingDebt === 0) {
      settleDepositReconciliation(request.id);
    }

    toast.success("Lập phiếu thu thành công", {
      description: `Mã phiếu thu: ${result.voucher.code}`,
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{reconciliationCode}</h1>
          <Badge className="h-5 bg-slate-100 text-[10px] font-semibold text-slate-600 hover:bg-slate-100">
            Đã chốt
          </Badge>
          <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
            Cần thu thêm
          </Badge>
          <span className="hidden text-xs text-gray-500 md:inline">
            {request.customerName} · {request.room} · {contractCode}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500">
            Cần thu thêm
          </p>
          <p className="font-mono text-lg font-bold leading-tight text-rose-700">
            {formatCurrency(remainingDebt)}
          </p>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">

          {/* 1. Thông tin phiếu đối soát */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Thông tin phiếu đối soát
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                <InfoField label="Mã phiếu đối soát" value={reconciliationCode} mono />
                <InfoField label="Hợp đồng" value={contractCode} mono />
                <InfoField label="Khách hàng" value={request.customerName} />
                <InfoField label="Phòng" value={request.room} mono />
                <InfoField label="Ngày đối soát" value={formatDate(request.updatedAt)} />
                <InfoField label="Người lập đối soát" value={ACCOUNTANT_NAME} />
              </div>
            </CardContent>
          </Card>

          {/* 2. Bảng: Các khoản khấu trừ trong phiếu đối soát */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-0">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Các khoản khấu trừ
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs">Mã hóa đơn</TableHead>
                    <TableHead className="text-xs">Loại hóa đơn</TableHead>
                    <TableHead className="text-xs">Nội dung khấu trừ</TableHead>
                    <TableHead className="text-right text-xs">Số tiền</TableHead>
                    <TableHead className="px-4 text-xs">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductionRows.map((row) => (
                    <TableRow key={row.code} className="hover:bg-transparent">
                      <TableCell className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-700">
                        {row.code}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-gray-600">
                        {row.type}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-gray-700">
                        {row.description}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-mono text-sm text-gray-800">
                        {formatCurrency(row.amount)}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                          Chưa thanh toán
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-gray-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={3} className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">
                      Tổng khấu trừ:
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono text-sm font-bold text-gray-900">
                      {formatCurrency(reconciliationSummary.totalDeductions)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* 3. Kết quả đối soát đã chốt */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Kết quả đối soát</h3>
              </div>

              {/* Three-column layout */}
              <div className="grid gap-3 md:grid-cols-3">
                {/* Thông tin cọc */}
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <h4 className="mb-2.5 border-b border-gray-100 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Thông tin cọc
                  </h4>
                  <div className="space-y-2">
                    <SummaryLine
                      label="Tiền cọc ban đầu"
                      value={formatCurrency(reconciliationSummary.initialDeposit)}
                    />
                    <SummaryLine
                      label="Tỷ lệ hoàn cọc áp dụng"
                      value={`${reconciliationSummary.refundRate}%`}
                    />
                    <div className="flex items-center justify-between gap-3 rounded bg-gray-50 px-2 py-1 text-xs">
                      <span className="font-medium text-gray-600">Cọc được xét hoàn</span>
                      <span className="font-mono font-bold text-gray-900">
                        {formatCurrency(reconciliationSummary.baseRefund)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Khấu trừ */}
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <h4 className="mb-2.5 border-b border-gray-100 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Khấu trừ
                  </h4>
                  <div className="space-y-2">
                    <SummaryLine
                      label="Tổng khấu trừ"
                      value={formatCurrency(reconciliationSummary.totalDeductions)}
                    />
                    <SummaryLine
                      label="Đã bù trừ bằng cọc được xét hoàn"
                      value={formatCurrency(reconciliationSummary.offsetByDeposit)}
                    />
                  </div>
                </div>

                {/* Kết quả */}
                <div className="flex flex-col rounded-md border border-rose-200 bg-rose-50/40 p-3">
                  <h4 className="mb-2.5 border-b border-rose-100 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-500">
                    Kết quả
                  </h4>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-[11px] text-gray-500">Khách cần thanh toán thêm</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-rose-700">
                      {formatCurrency(reconciliationSummary.additionalDue)}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                      = Tổng khấu trừ ({formatCurrency(reconciliationSummary.totalDeductions)}) −
                      Cọc được xét hoàn ({formatCurrency(reconciliationSummary.baseRefund)})
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Chính sách áp dụng: CSHC_003 · Hoàn {reconciliationSummary.refundRate}%
              </p>
            </CardContent>
          </Card>

          {/* 4. Tổng quan công nợ */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tổng quan công nợ
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                <DebtMetric
                  label="Tổng phải thu thêm"
                  value={reconciliationSummary.additionalDue}
                />
                <DebtMetric label="Đã thu" value={paidAmount} />
                <DebtMetric
                  label="Còn phải thu"
                  value={remainingDebt}
                  danger={remainingDebt > 0}
                />
              </div>
              {remainingDebt > 0 && (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Khách còn công nợ cần thanh toán trước khi thanh lý hợp đồng.
                </p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Sticky footer ── */}
      <footer className="sticky bottom-0 flex items-center justify-end border-t border-gray-200 bg-white px-5 py-3">
        <Button
          type="button"
          onClick={() => setReceiptOpen(true)}
          className="shrink-0 bg-blue-600 hover:bg-blue-700"
          disabled={remainingDebt <= 0}
        >
          <CreditCard className="size-4" />
          Tiến hành thu tiền
        </Button>
      </footer>

      <ReceiptCollectionDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        source="checkout_settlement"
        contextLabel="Thanh toán trả phòng"
        customerName={request.customerName}
        room={request.room}
        contractCode={contractCode}
        reconciliationCode={reconciliationCode}
        invoices={invoiceRows.filter((invoice) => invoice.remaining > 0)}
        totalDebt={remainingDebt}
        onSubmit={handleCreateReceipt}
      />
      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        voucher={issuedVoucher}
        reconciliationCode={reconciliationCode}
        remainingAfterReceipt={remainingAfterReceipt}
      />
    </section>
  );
}

// ─── Success dialog ───────────────────────────────────────────────────────────

function SuccessDialog({
  open,
  onOpenChange,
  voucher,
  reconciliationCode,
  remainingAfterReceipt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: ReceiptVoucher | null;
  reconciliationCode: string;
  remainingAfterReceipt: number;
}) {
  if (!voucher) return null;
  const isSettled = remainingAfterReceipt === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thu tiền trả phòng thành công</DialogTitle>
          <DialogDescription>
            {isSettled
              ? `Phiếu thu ${voucher.code} đã được tạo. Công nợ của Phiếu đối soát ${reconciliationCode} đã được thanh toán đầy đủ.`
              : `Phiếu thu ${voucher.code} đã được tạo. Phiếu đối soát ${reconciliationCode} cần thu thêm ${formatCurrency(remainingAfterReceipt)}.`}
          </DialogDescription>
        </DialogHeader>
        {isSettled && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Phiếu đối soát đã được cập nhật thành &apos;Đã tất toán&apos;.
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Xem phiếu thu
          </Button>
          <Button
            type="button"
            className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
            onClick={() => onOpenChange(false)}
          >
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-800", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function DebtMetric({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className={cn("rounded-md border bg-white p-3", danger ? "border-rose-200" : "border-gray-200")}>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={cn("mt-1 font-mono text-base font-bold", danger ? "text-rose-700" : "text-gray-900")}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getReconciliationCode(request: DepositRequest): string {
  return `PDS-${request.code.replace(/\D/g, "").padStart(4, "0")}`;
}

function getContractCode(request: DepositRequest): string {
  return `HD-${request.code}`;
}

/** Total additional amount customer owes = sum of all reconciliation items */
function getAdditionalDue(request: DepositRequest): number {
  const totalDeductions = request.reconciliationItems?.reduce((s, l) => s + l.amount, 0) ?? 0;
  const depositAmount = request.depositAmount ?? 0;
  const refundRate = 70;
  const baseRefund = Math.round(depositAmount * (refundRate / 100));
  // additionalDue = totalDeductions - baseRefund (can't be negative)
  return Math.max(totalDeductions - baseRefund, 0);
}

function getPaidAmount(vouchers: ReceiptVoucher[], contractCode: string): number {
  return vouchers
    .filter((v) => v.contractId === contractCode)
    .reduce((s, v) => s + v.amount, 0);
}

/** Build the full deduction rows for the main table (no paid/remaining split) */
function buildDeductionRows(request: DepositRequest): DeductionRow[] {
  return (request.reconciliationItems ?? []).map((line, index) => ({
    code: getInvoiceCode(index),
    type: line.description.toLowerCase().includes("vệ sinh") ? "Dịch vụ" : "Bồi thường",
    description: line.description,
    amount: line.amount,
  }));
}

/** Build invoice rows for the ReceiptCollectionDialog (needs paid/remaining split) */
function buildInvoiceRows(request: DepositRequest, paidAmount: number): InvoiceRow[] {
  const additionalDue = getAdditionalDue(request);
  // The only "invoice" the accountant actually collects is the net additional due
  // We represent it as a single virtual invoice matching the total payable
  const deductions = buildDeductionRows(request);
  // Spread paidAmount proportionally across the items, but since the deposit
  // already covers the first chunk, only the remaining additionalDue is collected.
  // For the dialog we show a single aggregated row.
  const paid = Math.min(paidAmount, additionalDue);
  const remaining = Math.max(additionalDue - paid, 0);
  return deductions.map((row, index) => {
    // Proportional split for display purposes
    const proportion = additionalDue > 0 ? row.amount / (request.reconciliationItems?.reduce((s, l) => s + l.amount, 0) ?? 1) : 0;
    const rowPaid = Math.round(paid * proportion);
    const rowRemaining = Math.max(row.amount - rowPaid, 0);
    return {
      code: row.code,
      type: row.type,
      description: row.description,
      amount: row.amount,
      paid: rowPaid,
      remaining: rowRemaining,
    };
  });
}

function getInvoiceCode(index: number): string {
  const codes = ["HD-BT-001", "HD-DV-002"];
  return codes[index] ?? `HD-CN-${String(index + 1).padStart(3, "0")}`;
}

function getReconciliationSummary(request: DepositRequest) {
  const initialDeposit = request.depositAmount ?? 0;
  const refundRate = 70;
  const baseRefund = Math.round(initialDeposit * (refundRate / 100));
  const totalDeductions = request.reconciliationItems?.reduce((s, l) => s + l.amount, 0) ?? 0;
  // offsetByDeposit = how much of the deposit is used to cover deductions
  const offsetByDeposit = Math.min(baseRefund, totalDeductions);
  const additionalDue = Math.max(totalDeductions - baseRefund, 0);
  return {
    initialDeposit,
    refundRate,
    baseRefund,
    totalDeductions,
    offsetByDeposit,
    additionalDue,
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN");
}
