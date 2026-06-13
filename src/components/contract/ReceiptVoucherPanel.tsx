import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  FileUp,
  Landmark,
  Printer,
  Receipt,
  UploadCloud,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useWorkflowStore, type ContractItem, type ReceiptVoucher } from "@/lib/workflow-store";

type InvoiceRow = {
  id: string;
  description: string;
  createdAt: string;
  dueDate: string;
  amount: number;
  paid: number;
  remaining: number;
  status: "Chờ thanh toán" | "Thanh toán một phần" | "Đã thanh toán";
};

type ReceiptFormState = {
  amount: string;
  paymentMethod: "cash" | "bank-transfer";
  evidenceFile: File | null;
  note: string;
};

const DEFAULT_COLLECTOR = "Nguyễn Thị Thu — Kế toán";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

export function ReceiptVoucherPanel({ contract }: { contract: ContractItem }) {
  const { createReceiptVoucher, recordPayment } = useWorkflowStore();
  const invoices = useMemo(() => buildInvoices(contract), [contract]);
  const totals = useMemo(
    () => ({
      totalDebt: contract.invoiceTotal,
      previouslyPaid: contract.paidAmount,
      outstanding: Math.max(contract.invoiceTotal - contract.paidAmount, 0),
    }),
    [contract],
  );
  const [form, setForm] = useState<ReceiptFormState>(() => createInitialForm(totals.outstanding));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [partialOpen, setPartialOpen] = useState(false);
  const [issuedVoucher, setIssuedVoucher] = useState<ReceiptVoucher | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setForm(createInitialForm(totals.outstanding));
    setFieldErrors({});
    setConfirmOpen(false);
    setPartialOpen(false);
    setIssuedVoucher(null);
    setPreviewOpen(false);
  }, [contract.id, totals.outstanding]);

  const amount = Number(form.amount || 0);
  const isPartialPayment = amount > 0 && amount < totals.outstanding;
  const statusLabel = contract.paidAmount > 0 ? "Thanh toán một phần" : "Chờ thanh toán";

  const updateForm = <K extends keyof ReceiptFormState>(key: K, value: ReceiptFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const isBankTransfer = form.paymentMethod === "bank-transfer";

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.amount || Number(form.amount) <= 0) errors.amount = "Vui lòng nhập số tiền thực thu";
    if (!form.paymentMethod) errors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
    if (isBankTransfer && !form.evidenceFile) errors.evidenceFile = "Vui lòng tải lên minh chứng chuyển khoản";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(isBankTransfer
        ? "Vui lòng tải lên minh chứng chuyển khoản (ảnh/pdf < 5MB)."
        : "Vui lòng nhập đầy đủ thông tin."
      );
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    if (isPartialPayment) {
      setPartialOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const confirmReceipt = () => {
    const voucher = createReceiptVoucher({
      contractId: contract.id,
      customerName: contract.customerName,
      amount,
      paymentMethod: form.paymentMethod,
      collector: DEFAULT_COLLECTOR,
      date: new Date().toISOString().slice(0, 10),
      note: form.note,
    });
    recordPayment(contract.id, amount, form.paymentMethod);
    setIssuedVoucher(voucher);
    setPreviewOpen(true);
    setConfirmOpen(false);
    setPartialOpen(false);
    toast.success("Lập phiếu thu thành công", {
      description: `Mã phiếu thu: ${voucher.code}`,
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
  };

  const handleFile = (key: "evidenceFile", file: File | undefined) => {
    if (!file || !isValidEvidenceFile(file)) {
      updateForm(key, null);
      setFieldErrors((current) => ({
        ...current,
        [key]: "Tệp phải là ảnh/PDF và nhỏ hơn 5MB",
      }));
      toast.error("Vui lòng nhập đầy đủ thông tin và tải lên tệp hợp lệ (ảnh/pdf < 5MB).");
      return;
    }
    updateForm(key, file);
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50">
      <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-blue-700">{contract.id}</span>
            <h2 className="truncate text-base font-bold text-gray-900">{contract.customerName}</h2>
            <Badge className="h-5 bg-orange-100 text-[10px] font-semibold text-orange-700">
              {statusLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">{contract.room} • {getCustomerCode(contract)}</p>
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">
            Công nợ cần thu
          </p>
          <p className="font-mono text-lg font-bold text-rose-700">
            {formatCurrency(totals.outstanding)}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-6xl space-y-4">
          <Card title="Thông tin khách hàng">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <Info label="Mã khách hàng" value={getCustomerCode(contract)} mono />
              <Info label="Họ tên" value={contract.customerName} />
              <Info label="Số điện thoại" value={contract.phone} mono />
              <Info label="Email" value={buildCustomerEmail(contract)} />
              <Info label="Mã hợp đồng" value={contract.id} mono />
            </div>
          </Card>

          <Card title="Danh sách hóa đơn cần thanh toán">
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Mã hóa đơn</th>
                    <th className="px-3 py-2">Nội dung thu</th>
                    <th className="px-3 py-2">Ngày lập</th>
                    <th className="px-3 py-2">Hạn thanh toán</th>
                    <th className="px-3 py-2 text-right">Số tiền</th>
                    <th className="px-3 py-2 text-right">Đã thu</th>
                    <th className="px-3 py-2 text-right">Còn lại</th>
                    <th className="px-3 py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="align-top">
                      <td className="px-3 py-3 font-mono text-xs font-semibold text-blue-700">
                        {invoice.id}
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900">
                        {invoice.description}
                      </td>
                      <td className="px-3 py-3 text-gray-600">{invoice.createdAt}</td>
                      <td className="px-3 py-3 text-gray-600">{invoice.dueDate}</td>
                      <td className="px-3 py-3 text-right font-mono text-gray-700">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-gray-700">
                        {formatCurrency(invoice.paid)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-rose-700">
                        {formatCurrency(invoice.remaining)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              <SummaryLine label="Tổng công nợ" value={totals.totalDebt} />
              <SummaryLine label="Đã thu trước đó" value={totals.previouslyPaid} />
              <SummaryLine label="Cần thu thêm" value={totals.outstanding} highlight />
            </div>
          </Card>

          <Card
            title="Thông tin phiếu thu"
            icon={<Receipt className="size-4 text-blue-600" />}
          >
            {isPartialPayment && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>
                  Số tiền thu nhỏ hơn công nợ. Khách hàng sẽ được đánh dấu là thanh toán một phần.
                </span>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-4">
                <Field label="Số tiền thực thu *" error={fieldErrors.amount}>
                  <Input
                    value={formatAmountInput(form.amount)}
                    onChange={(event) =>
                      updateForm("amount", normalizeAmountInput(event.target.value))
                    }
                    className={cn("h-10 text-right font-mono", fieldErrors.amount && errorClass)}
                  />
                </Field>

                <Field label="Ghi chú">
                  <Input
                    value={form.note}
                    onChange={(event) => updateForm("note", event.target.value)}
                    placeholder="Ghi chú thêm về khoản thu..."
                    className="h-10"
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <Field label="Phương thức thanh toán *" error={fieldErrors.paymentMethod}>
                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(value) => {
                      const next = value as ReceiptFormState["paymentMethod"];
                      // Xóa file minh chứng khi chuyển về tiền mặt
                      if (next === "cash" && form.evidenceFile) {
                        setForm((current) => ({ ...current, paymentMethod: next, evidenceFile: null }));
                        setFieldErrors((current) => {
                          const next2 = { ...current };
                          delete next2["paymentMethod"];
                          delete next2["evidenceFile"];
                          return next2;
                        });
                      } else {
                        updateForm("paymentMethod", next);
                      }
                    }}
                    className={cn(
                      "grid gap-2",
                      fieldErrors.paymentMethod && "rounded-lg ring-1 ring-red-300",
                    )}
                  >
                    <PaymentMethodOption
                      value="cash"
                      label="Tiền mặt"
                      icon={<Banknote className="size-4" />}
                    />
                    <PaymentMethodOption
                      value="bank-transfer"
                      label="Chuyển khoản"
                      icon={<Landmark className="size-4" />}
                    />
                  </RadioGroup>
                </Field>

                <Field
                  label={isBankTransfer ? "Minh chứng thanh toán *" : "Minh chứng thanh toán"}
                  error={fieldErrors.evidenceFile}
                >
                  {!isBankTransfer && (
                    <p className="mb-1.5 text-[11px] text-gray-400">
                      Không bắt buộc khi thu tiền mặt
                    </p>
                  )}
                  <EvidenceInput
                    id="receipt-evidence"
                    file={form.evidenceFile}
                    onFile={(file) => handleFile("evidenceFile", file)}
                    invalid={Boolean(fieldErrors.evidenceFile)}
                  />
                </Field>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <footer className="sticky bottom-0 flex min-h-16 items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
        <div className="text-xs text-gray-500">
          {issuedVoucher ? (
            <span className="font-semibold text-emerald-700">Đã lập phiếu thu {issuedVoucher.code}</span>
          ) : (
            <span>Phiếu thu chỉ được in sau khi xác nhận thu tiền thành công.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" className="h-9 bg-blue-600 hover:bg-blue-700" onClick={submit}>
            <CheckCircle2 className="size-4" />
            Xác nhận thu tiền
          </Button>
        </div>
      </footer>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thu tiền?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ ghi nhận khoản thu {formatCurrency(amount)} cho hợp đồng {contract.id} và
              lập phiếu thu tương ứng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 hover:bg-blue-700" onClick={confirmReceipt}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={partialOpen} onOpenChange={setPartialOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thanh toán một phần?</AlertDialogTitle>
            <AlertDialogDescription>
              Số tiền thực thu nhỏ hơn số tiền cần thanh toán. Các hóa đơn liên quan sẽ được cập
              nhật trạng thái Thanh toán một phần.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 hover:bg-blue-700" onClick={confirmReceipt}>
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReceiptPreviewDialog
        voucher={issuedVoucher}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </section>
  );
}

function createInitialForm(outstanding: number): ReceiptFormState {
  return {
    amount: String(outstanding),
    paymentMethod: "cash",
    evidenceFile: null,
    note: "",
  };
}

function buildInvoices(contract: ContractItem): InvoiceRow[] {
  let remainingPaid = contract.paidAmount;
  const createdAt = new Date(contract.createdAt);
  const dueDate = new Date(createdAt);
  dueDate.setDate(createdAt.getDate() + 7);

  return contract.lines.map((line, index) => {
    const paid = Math.min(remainingPaid, line.amount);
    remainingPaid = Math.max(remainingPaid - paid, 0);
    const remaining = Math.max(line.amount - paid, 0);
    return {
      id: `HD-${contract.id.replace(/\D/g, "").padStart(5, "0")}-${index + 1}`,
      description: line.description,
      createdAt: formatDate(createdAt),
      dueDate: formatDate(dueDate),
      amount: line.amount,
      paid,
      remaining,
      status:
        remaining === 0 ? "Đã thanh toán" : paid > 0 ? "Thanh toán một phần" : "Chờ thanh toán",
    };
  });
}

function PaymentMethodOption({
  value,
  label,
  icon,
}: {
  value: ReceiptFormState["paymentMethod"];
  label: string;
  icon: ReactNode;
}) {
  return (
    <Label
      htmlFor={`payment-method-${value}`}
      className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50/40 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50 has-[[data-state=checked]]:text-blue-700"
    >
      <RadioGroupItem id={`payment-method-${value}`} value={value} />
      <span className="text-current">{icon}</span>
      <span>{label}</span>
    </Label>
  );
}

function EvidenceInput({
  id,
  file,
  invalid,
  onFile,
}: {
  id: string;
  file: File | null;
  invalid?: boolean;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50/40",
        invalid && errorClass,
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        {file ? <FileUp className="size-4 text-blue-600" /> : <UploadCloud className="size-4 text-gray-400" />}
        <span className="truncate">{file ? file.name : "Tải lên ảnh hoặc PDF (< 5MB)"}</span>
      </span>
      <input
        id={id}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="hidden"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
    </label>
  );
}

function ReceiptPreviewDialog({
  voucher,
  open,
  onClose,
}: {
  voucher: ReceiptVoucher | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!voucher) return null;
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phiếu thu {voucher.code}</DialogTitle>
          <DialogDescription>Phiếu thu đã được ghi nhận và sẵn sàng in.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
          <Info label="Mã hợp đồng" value={voucher.contractId} mono />
          <Info label="Khách hàng" value={voucher.customerName} />
          <Info label="Số tiền thực thu" value={formatCurrency(voucher.amount)} mono />
          <Info
            label="Phương thức thanh toán"
            value={voucher.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
          />
          <Info label="Ngày thu" value={formatDate(new Date(voucher.date))} />
          <Info label="Người thu / Người xác nhận" value={voucher.collector} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-9" onClick={onClose}>
            Đóng
          </Button>
          <Button type="button" className="h-9 bg-blue-600 hover:bg-blue-700">
            <Printer className="size-4" />
            In phiếu thu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold text-gray-600">{label}</Label>
      {children}
      {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-900", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SummaryLine({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("rounded-lg border px-3 py-2", highlight ? "border-rose-100 bg-rose-50" : "border-gray-100 bg-gray-50")}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn("mt-1 font-mono text-sm font-bold", highlight ? "text-rose-700" : "text-gray-900")}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: InvoiceRow["status"] }) {
  if (status === "Đã thanh toán") {
    return <Badge className="bg-emerald-100 text-emerald-700">{status}</Badge>;
  }
  if (status === "Thanh toán một phần") {
    return <Badge className="bg-amber-100 text-amber-700">{status}</Badge>;
  }
  return <Badge className="bg-orange-100 text-orange-700">{status}</Badge>;
}

function getCustomerCode(contract: ContractItem) {
  return `KH-${contract.id.replace(/\D/g, "").padStart(5, "0").slice(-5)}`;
}

function buildCustomerEmail(contract: ContractItem) {
  const slug = contract.customerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return `${slug || "khachhang"}@example.com`;
}

function isValidEvidenceFile(file: File) {
  return ALLOWED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
}

function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.max(amount, 0))} VNĐ`;
}

function formatAmountInput(value: string) {
  return value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
}

function normalizeAmountInput(value: string) {
  return value.replace(/\D/g, "");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

const errorClass = "border-red-300 bg-red-50 focus-visible:border-red-500 focus-visible:ring-red-500";
