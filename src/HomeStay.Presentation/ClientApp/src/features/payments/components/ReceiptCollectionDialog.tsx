import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Banknote, FileUp, Landmark, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/model/auth-store";

export type ReceiptCollectionSource = "contract_payment" | "checkout_settlement";

export type ReceiptCollectionInvoice = {
  code: string;
  type?: string;
  description: string;
  amount: number;
  paid: number;
  remaining: number;
};

export type ReceiptCollectionSubmit = {
  amount: number;
  paymentMethod: "cash" | "bank-transfer";
  evidenceName: string;
  note: string;
  collector: string;
  collectedAt: string;
  scenario: "full" | "partial";
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

function normalizeAmountInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function formatAmountInput(value: string): string {
  if (!value) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(value));
}

type ReceiptCollectionForm = {
  amount: string;
  paymentMethod: "cash" | "bank-transfer";
  evidenceName: string;
  evidenceFile: File | null;
  note: string;
  collector: string;
  collectedAt: string;
};

function createDefaultForm(totalDebt: number, collector: string): ReceiptCollectionForm {
  return {
    amount: String(totalDebt),
    paymentMethod: "cash",
    evidenceName: "",
    evidenceFile: null as File | null,
    note: "",
    collector,
    collectedAt: new Date().toISOString().slice(0, 16),
  };
}

export function ReceiptCollectionDialog({
  open,
  onOpenChange,
  source,
  title = "Lập phiếu thu",
  contextLabel,
  customerName,
  room,
  contractCode,
  reconciliationCode,
  invoices,
  totalDebt,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: ReceiptCollectionSource;
  title?: string;
  contextLabel: string;
  customerName: string;
  room: string;
  contractCode: string;
  reconciliationCode?: string;
  invoices: ReceiptCollectionInvoice[];
  totalDebt: number;
  onSubmit: (data: ReceiptCollectionSubmit) => void;
}) {
  const { user } = useAuth();
  const collector = user
    ? user.hoTen || user.tenDangNhap
    : "Kế toán đang đăng nhập";
  const [form, setForm] = useState(() => createDefaultForm(totalDebt, collector));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [partialOpen, setPartialOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(createDefaultForm(totalDebt, collector));
      setErrors({});
      setPartialOpen(false);
    }
  }, [open, totalDebt, collector]);

  const amount = Number(form.amount || 0);
  const remainingAfter = Math.max(totalDebt - amount, 0);
  const scenario = remainingAfter === 0 ? "full" : "partial";
  const isBankTransfer = form.paymentMethod === "bank-transfer";

  const visibleInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.remaining > 0),
    [invoices],
  );

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.amount || amount <= 0 || amount > totalDebt) {
      nextErrors.amount = "Vui lòng nhập số tiền thu hợp lệ.";
    }
    if (!form.paymentMethod) nextErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
    if (isBankTransfer && !form.evidenceFile) {
      nextErrors.evidenceFile = "Vui lòng tải lên chứng từ thanh toán.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng nhập đầy đủ thông tin và tải lên tệp hợp lệ (ảnh/pdf < 5MB).");
      return false;
    }
    return true;
  };

  const submit = () => {
    if (!validate()) return;
    if (source !== "checkout_settlement" && amount < totalDebt) {
      setPartialOpen(true);
      return;
    }
    submitReceipt();
  };

  const submitReceipt = () => {
    onSubmit({
      amount,
      paymentMethod: form.paymentMethod,
      evidenceName: form.evidenceName,
      note: form.note,
      collector: form.collector,
      collectedAt: form.collectedAt,
      scenario,
    });
  };

  const handleFile = (file: File | undefined) => {
    if (!file || !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      updateForm("evidenceFile", null);
      updateForm("evidenceName", "");
      setErrors((current) => ({
        ...current,
        evidenceFile: "Tệp phải là ảnh/PDF và nhỏ hơn 5MB",
      }));
      toast.error("Vui lòng nhập đầy đủ thông tin và tải lên tệp hợp lệ (ảnh/pdf < 5MB).");
      return;
    }
    updateForm("evidenceFile", file);
    updateForm("evidenceName", file.name);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {contextLabel} · {customerName} · {room} · {contractCode}
              {reconciliationCode ? ` · ${reconciliationCode}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50/70 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-700">Hóa đơn cần thu</p>
                <p className="text-xs text-gray-500">
                  Tổng cần thu:{" "}
                  <span className="font-mono text-sm font-bold text-gray-900">
                    {formatCurrency(totalDebt)}
                  </span>
                </p>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                {visibleInvoices.map((invoice) => (
                  <div key={invoice.code} className="flex items-center justify-between gap-4">
                    <span className="min-w-0 truncate">
                      {invoice.code} · {invoice.type ? `${invoice.type} · ` : ""}
                      {invoice.description}
                    </span>
                    <span className="shrink-0 font-mono font-semibold text-gray-900">
                      {formatCurrency(invoice.remaining)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Field label="Số tiền thực thu *" error={errors.amount}>
                  <Input
                    value={formatAmountInput(form.amount)}
                    disabled={source === "checkout_settlement"}
                    onChange={(event) =>
                      updateForm("amount", normalizeAmountInput(event.target.value))
                    }
                    className={cn(
                      "h-10 text-right font-mono",
                      source === "checkout_settlement" && "bg-gray-50",
                      errors.amount && "border-rose-300",
                    )}
                  />
                  {source === "checkout_settlement" && (
                    <p className="text-[11px] text-gray-500">Số tiền lấy từ phiếu đối soát đã chốt.</p>
                  )}
                </Field>

                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-700">Tóm tắt thanh toán</p>
                  <div className="space-y-1.5 text-xs">
                    <Summary label="Công nợ cần thu" value={totalDebt} />
                    <Summary label="Thực thu" value={amount} />
                    <Summary
                      label="Còn lại sau thu"
                      value={remainingAfter}
                      danger={remainingAfter > 0}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Field label="Phương thức thanh toán *" error={errors.paymentMethod}>
                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(value) =>
                      updateForm("paymentMethod", value as "cash" | "bank-transfer")
                    }
                    className="grid gap-2"
                  >
                    <PaymentOption value="cash" label="Tiền mặt" icon={<Banknote className="size-4" />} />
                    <PaymentOption
                      value="bank-transfer"
                      label="Chuyển khoản"
                      icon={<Landmark className="size-4" />}
                    />
                  </RadioGroup>
                </Field>

                <Field
                  label={isBankTransfer ? "Minh chứng thanh toán *" : "Minh chứng thanh toán"}
                  error={errors.evidenceFile}
                >
                  <label
                    className={cn(
                      "flex h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50/40",
                      errors.evidenceFile && "border-rose-300",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {form.evidenceFile ? (
                        <FileUp className="size-4 shrink-0 text-blue-600" />
                      ) : (
                        <Upload className="size-4 shrink-0 text-gray-500" />
                      )}
                      <span className="truncate">
                        {form.evidenceName || "Tải lên chứng từ"}
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      className="sr-only"
                      onChange={(event) => handleFile(event.target.files?.[0])}
                    />
                  </label>
                </Field>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
              Quay lại
            </Button>
            <Button type="button" className="h-8 bg-blue-600 text-xs hover:bg-blue-700" onClick={submit}>
              Xác nhận thu tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={partialOpen} onOpenChange={setPartialOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán một phần?</DialogTitle>
            <DialogDescription>
              Số tiền thu nhỏ hơn công nợ. Khách hàng sẽ bị đánh dấu là thanh toán một phần.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Phiếu thu vẫn được ghi nhận cho số tiền thực thu. Công nợ còn lại tiếp tục chờ xử lý.
            </span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => setPartialOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="button" className="h-8 bg-blue-600 text-xs hover:bg-blue-700" onClick={submitReceipt}>
              Tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      {helper && <span className="block text-[11px] text-gray-500">{helper}</span>}
      {children}
      {error && <span className="block text-[11px] text-rose-600">{error}</span>}
    </label>
  );
}

function PaymentOption({
  value,
  label,
  icon,
}: {
  value: "cash" | "bank-transfer";
  label: string;
  icon: ReactNode;
}) {
  return (
    <Label
      htmlFor={`receipt-payment-${value}`}
      className="flex h-11 cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50 has-[[data-state=checked]]:text-blue-700"
    >
      <RadioGroupItem id={`receipt-payment-${value}`} value={value} />
      {icon}
      {label}
    </Label>
  );
}

function Summary({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p
        className={cn(
          "font-mono text-sm font-bold",
          danger ? "text-rose-700" : value === 0 ? "text-emerald-700" : "text-gray-900",
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
