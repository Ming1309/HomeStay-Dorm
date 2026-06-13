import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardList,
  Landmark,
  Undo2,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";


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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useWorkflowStore,
  type ContractItem,
  type ReconciliationResult,
  type RefundVoucher,
} from "@/lib/workflow-store";

// ─── helpers ───────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function getCustomerCode(contractId: string): string {
  return `KH-${contractId.replace(/\D/g, "").padStart(5, "0").slice(-5)}`;
}

// PDS code derived from contract id — in production this would come from the store
function getPdsCode(contractId: string): string {
  const num = contractId.replace(/\D/g, "").slice(-4).padStart(4, "0");
  return `PDS-${num}`;
}

// ─── zod schema ─────────────────────────────────────────────────────────────

const formSchema = z
  .object({
    method: z.enum(["cash", "bank-transfer"]),
    bankAccount: z.string().optional(),
    bankName: z.string().optional(),
    accountHolder: z.string().optional(),
    executor: z.string().min(1, "Vui lòng nhập người lập phiếu"),
    date: z.string().min(1, "Vui lòng chọn ngày lập phiếu"),
    note: z.string().optional(),
  })
  .refine(
    (data) =>
      data.method !== "bank-transfer" ||
      (data.bankAccount && data.bankAccount.trim().length >= 6),
    { path: ["bankAccount"], message: "Số tài khoản bắt buộc khi hoàn bằng chuyển khoản" },
  )
  .refine(
    (data) => data.method !== "bank-transfer" || (data.bankName && data.bankName.trim().length > 0),
    { path: ["bankName"], message: "Ngân hàng bắt buộc khi hoàn bằng chuyển khoản" },
  );

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_EXECUTOR = "Nguyễn Thị Thu — Kế toán";

// ─── component ──────────────────────────────────────────────────────────────

export function RefundVoucherPanel({ contract }: { contract: ContractItem }) {
  const { getReconciliation, createRefundVoucher } = useWorkflowStore();
  const reconciliation: ReconciliationResult | null = getReconciliation(contract.id);
  const [issued, setIssued] = useState<RefundVoucher | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const refundAmount = reconciliation?.netRefund ?? 0;
  const pdsCode = getPdsCode(contract.id);
  const customerCode = getCustomerCode(contract.id);

  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "bank-transfer",
      bankAccount: "",
      bankName: "",
      accountHolder: "",
      executor: DEFAULT_EXECUTOR,
      date: today,
      note: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      method: "bank-transfer",
      bankAccount: "",
      bankName: "",
      accountHolder: "",
      executor: DEFAULT_EXECUTOR,
      date: today,
      note: "",
    });
    setIssued(null);
    setSuccessOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract.id]);

  const method = form.watch("method");

  const handleConfirm = (data: FormValues) => {
    const voucher = createRefundVoucher({
      contractId: contract.id,
      customerName: contract.customerName,
      amount: refundAmount,
      method: data.method,
      bankAccount: data.method === "bank-transfer" ? data.bankAccount : undefined,
      executor: data.executor,
      date: data.date,
      note: data.note,
    });
    setIssued(voucher);
    setSuccessOpen(true);
    toast.success(`Lập phiếu hoàn cọc thành công!`, {
      description: `${voucher.code} đã được tạo cho ${contract.customerName}.`,
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
  };

  if (!reconciliation) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Chưa có dữ liệu đối soát cho hợp đồng này.</p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-blue-700">{pdsCode}</span>
            <Badge className="h-5 bg-emerald-100 text-[10px] font-semibold text-emerald-700">
              Đã chốt
            </Badge>
            <span className="text-sm text-gray-500">Chờ lập phiếu hoàn cọc</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {contract.customerName}
            <span className="ml-2 font-normal text-gray-400">·</span>
            <span className="ml-2 font-normal text-gray-500">{contract.room}</span>
            <span className="ml-2 font-normal text-gray-400">·</span>
            <span className="ml-2 font-mono font-normal text-gray-500">{contract.id}</span>
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
            Số tiền cần hoàn
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold text-emerald-700">
            {formatCurrency(refundAmount)}
          </p>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-3xl space-y-4">

          {/* Card: Thông tin khách hàng */}
          <Card title="Thông tin khách hàng" icon={<User className="size-4 text-blue-500" />}>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <InfoField label="Mã khách" value={customerCode} mono />
              <InfoField label="Họ tên" value={contract.customerName} />
              <InfoField label="Số điện thoại" value={contract.phone} mono />
            </div>
          </Card>

          {/* Card: Kết quả đối soát đã chốt */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="size-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-900">Kết quả đối soát đã chốt</h3>
              <span className="ml-auto font-mono text-[11px] text-gray-400">
                {reconciliation.policyCode} · Hoàn {reconciliation.refundRate}% cọc
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <ReconciliationRow
                label="Tiền cọc ban đầu"
                value={formatCurrency(reconciliation.initialDeposit)}
              />
              <ReconciliationRow
                label={`Tiền hoàn cơ bản (${reconciliation.refundRate}% cọc)`}
                value={formatCurrency(reconciliation.baseRefund)}
              />
              {reconciliation.deductions > 0 && (
                <ReconciliationRow
                  label="Tổng khấu trừ"
                  value={`− ${formatCurrency(reconciliation.deductions)}`}
                  valueClass="text-amber-700"
                />
              )}
              <div className="border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Số tiền cần hoàn</span>
                  <span className="font-mono text-base font-bold text-emerald-700">
                    {formatCurrency(reconciliation.netRefund)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card: Thông tin phiếu hoàn cọc */}
          <Card
            title="Thông tin phiếu hoàn cọc"
            icon={<Undo2 className="size-4 text-blue-500" />}
          >
            <Form {...form}>
              <form id="refund-voucher-form" onSubmit={form.handleSubmit(handleConfirm)}>
                <div className="space-y-4">
                  {/* Row 1: Amount (readonly) + Method */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-600">
                        Số tiền hoàn *
                      </label>
                      <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 font-mono text-sm font-semibold text-emerald-700">
                        {formatCurrency(refundAmount)}
                      </div>

                    </div>

                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-600">
                            Hình thức hoàn cọc *
                          </FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bank-transfer">
                                <span className="flex items-center gap-2">
                                  <Landmark className="size-3.5 text-blue-500" />
                                  Chuyển khoản
                                </span>
                              </SelectItem>
                              <SelectItem value="cash">
                                <span className="flex items-center gap-2">
                                  <Banknote className="size-3.5 text-emerald-500" />
                                  Tiền mặt
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>


                  {/* Conditional bank info block */}
                  {method === "bank-transfer" ? (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Building2 className="size-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-700">
                          Thông tin tài khoản nhận tiền
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-gray-600">
                                Số tài khoản *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-10 font-mono"
                                  placeholder="VD: 0123456789"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-gray-600">
                                Ngân hàng *
                              </FormLabel>
                              <FormControl>
                                <Input className="h-10" placeholder="VD: Vietcombank" {...field} />
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="accountHolder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold text-gray-600">
                                Chủ tài khoản
                              </FormLabel>
                              <FormControl>
                                <Input className="h-10" placeholder="Tên chủ tài khoản" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ) : null}

                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 flex min-h-16 items-center justify-end border-t border-gray-200 bg-white px-5 py-3">
        <Button
          type="submit"
          form="refund-voucher-form"
          className="h-9 bg-blue-600 hover:bg-blue-700"
          disabled={!form.formState.isValid}
        >
          <Undo2 className="size-4" />
          Lập phiếu hoàn cọc
        </Button>
      </footer>

      {/* ── Success dialog ─────────────────────────────────────────── */}
      <SuccessDialog
        open={successOpen}
        voucher={issued}
        pdsCode={pdsCode}
        onClose={() => setSuccessOpen(false)}
      />
    </section>
  );
}

// ─── sub-components ─────────────────────────────────────────────────────────


function SuccessDialog({
  open,
  voucher,
  pdsCode,
  onClose,
}: {
  open: boolean;
  voucher: RefundVoucher | null;
  pdsCode: string;
  onClose: () => void;
}) {
  if (!voucher) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Lập phiếu hoàn cọc thành công</DialogTitle>
          <DialogDescription className="text-center">
            Phiếu hoàn cọc{" "}
            <span className="font-semibold text-emerald-700">{voucher.code}</span> đã được tạo.
            Phiếu đối soát{" "}
            <span className="font-semibold">{pdsCode}</span> đã được cập nhật thành{" "}
            <span className="font-semibold text-emerald-700">Đã tất toán</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Mã phiếu hoàn</span>
            <span className="font-mono font-semibold text-emerald-700">{voucher.code}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Khách hàng</span>
            <span className="font-medium text-gray-900">{voucher.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Số tiền hoàn</span>
            <span className="font-mono font-bold text-emerald-700">
              {new Intl.NumberFormat("vi-VN").format(voucher.amount)} VNĐ
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Hình thức</span>
            <span className="font-medium text-gray-900">
              {voucher.method === "cash" ? "Tiền mặt" : "Chuyển khoản"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Ngày lập</span>
            <span className="font-medium text-gray-900">
              {formatDate(new Date(voucher.date))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Người lập</span>
            <span className="font-medium text-gray-900">{voucher.executor}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="h-9 w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={onClose}
          >
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── utility components ──────────────────────────────────────────────────────

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-900", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function ReconciliationRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className={cn("font-mono font-semibold text-gray-900", valueClass)}>{value}</span>
    </div>
  );
}
