import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Printer, Receipt, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { ReconciliationSummary } from "@/components/contract/ReconciliationSummary";
import {
  useWorkflowStore,
  type ContractItem,
  type ReceiptVoucher,
  type ReconciliationResult,
} from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

const formatAmountInput = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeAmountInput = (value: string) => value.replace(/\D/g, "");

const formSchema = z.object({
  amount: z.string().min(1, "Vui lòng nhập số tiền").regex(/^\d+$/, "Chỉ nhập chữ số"),
  paymentMethod: z.enum(["cash", "bank-transfer"]),
  collector: z.string().min(1, "Vui lòng nhập người thu"),
  date: z.string().min(1, "Vui lòng chọn ngày thu"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_COLLECTOR = "Nguyễn Thị Thu — Kế toán";

export function ReceiptVoucherPanel({ contract }: { contract: ContractItem }) {
  const { getReconciliation, createReceiptVoucher } = useWorkflowStore();
  const reconciliation: ReconciliationResult | null = getReconciliation(contract.id);
  const [issued, setIssued] = useState<ReceiptVoucher | null>(null);

  const dueAmount = reconciliation?.additionalDue ?? 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: String(dueAmount),
      paymentMethod: "bank-transfer",
      collector: DEFAULT_COLLECTOR,
      date: new Date().toISOString().slice(0, 10),
      note: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      amount: String(dueAmount),
      paymentMethod: "bank-transfer",
      collector: DEFAULT_COLLECTOR,
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
  }, [contract.id, dueAmount, form]);

  const amount = Number(form.watch("amount") || 0);
  const method = form.watch("paymentMethod");

  const handleConfirm = (data: FormValues) => {
    const voucher = createReceiptVoucher({
      contractId: contract.id,
      customerName: contract.customerName,
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod,
      collector: data.collector,
      date: data.date,
      note: data.note,
    });
    setIssued(voucher);
    toast.success(
      `Đã xác nhận thu ${formatCurrency(Number(data.amount))} từ ${contract.customerName}.`,
      {
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      },
    );
  };

  if (!reconciliation) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Chưa có dữ liệu đối soát cho hợp đồng này.</p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{contract.id}</h1>
          <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">Phiếu thu</Badge>
          <span className="text-xs text-gray-500">
            {contract.customerName} • {contract.room}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">Khách cần thanh toán</p>
          <p className="font-mono text-sm font-bold text-rose-700">{formatCurrency(dueAmount)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Form {...form}>
          <form
            id="receipt-voucher-form"
            onSubmit={form.handleSubmit(handleConfirm)}
            className="space-y-4"
          >
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <Info label="Mã khách" value={contract.id} mono />
                <Info label="Họ tên" value={contract.customerName} />
                <Info label="Số điện thoại" value={contract.phone} mono />
              </div>
            </div>

            <ReconciliationSummary reconciliation={reconciliation} mode="collect" />

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Receipt className="size-3.5" />
                Thông tin thanh toán
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Số tiền thu *</FormLabel>
                      <FormControl>
                        <Input
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={formatAmountInput(field.value)}
                          onChange={(e) => field.onChange(normalizeAmountInput(e.target.value))}
                          className="h-9 text-right font-mono"
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Hình thức *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank-transfer">Chuyển khoản</SelectItem>
                          <SelectItem value="cash">Tiền mặt</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Ngày thu *</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="collector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Người thu *</FormLabel>
                      <FormControl>
                        <Input className="h-9" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-xs">Ghi chú</FormLabel>
                      <FormControl>
                        <Input className="h-9" placeholder="Ghi chú thêm..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <div className="text-xs text-gray-400">
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Enter
          </kbd>{" "}
          : Xác nhận thu •{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            P
          </kbd>{" "}
          : In phiếu
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs"
            onClick={() =>
              setIssued(createPreviewVoucher(contract.id, contract.customerName, amount, method))
            }
            disabled={!form.formState.isValid}
          >
            <Printer className="size-3.5" />
            In phiếu thu
          </Button>
          <CancelButton onConfirmed={() => form.reset()} />
          <Button
            type="submit"
            form="receipt-voucher-form"
            className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700"
            disabled={!form.formState.isValid}
          >
            <CheckCircle2 className="size-3.5" />
            Xác nhận thu tiền
          </Button>
        </div>
      </footer>

      <VoucherPreviewDialog voucher={issued} onClose={() => setIssued(null)} />
    </section>
  );
}

function createPreviewVoucher(
  contractId: string,
  customerName: string,
  amount: number,
  paymentMethod: "cash" | "bank-transfer",
): ReceiptVoucher {
  return {
    id: `PT-PREVIEW-${Date.now()}`,
    code: `PT-PREVIEW`,
    contractId,
    customerName,
    amount,
    paymentMethod,
    collector: DEFAULT_COLLECTOR,
    date: new Date().toISOString().slice(0, 10),
  };
}

function CancelButton({ onConfirmed }: { onConfirmed: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" className="h-8 text-xs text-gray-500">
          <X className="size-3.5" />
          Hủy
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy lập phiếu thu?</AlertDialogTitle>
          <AlertDialogDescription>
            Thông tin đã nhập sẽ bị xóa. Hợp đồng sẽ ở trạng thái chờ quyết toán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-8 text-xs">Quay lại</AlertDialogCancel>
          <AlertDialogAction
            className="h-8 bg-rose-600 text-xs hover:bg-rose-700"
            onClick={onConfirmed}
          >
            Xác nhận hủy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function VoucherPreviewDialog({
  voucher,
  onClose,
}: {
  voucher: ReceiptVoucher | null;
  onClose: () => void;
}) {
  if (!voucher) return null;

  return (
    <Dialog open={!!voucher} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phiếu thu {voucher.code}</DialogTitle>
          <DialogDescription>
            {voucher.code.startsWith("PT-")
              ? "Phiếu đã được ghi nhận. Tính năng in thực tế sẽ tích hợp sau."
              : "Xem trước phiếu thu trước khi in."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <Info label="Hợp đồng" value={voucher.contractId} mono />
          <Info label="Khách hàng" value={voucher.customerName} />
          <Info label="Số tiền" value={formatCurrency(voucher.amount)} mono />
          <Info
            label="Hình thức"
            value={voucher.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
          />
          <Info label="Ngày thu" value={new Date(voucher.date).toLocaleDateString("vi-VN")} />
          <Info label="Người thu" value={voucher.collector} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-8 text-xs" onClick={onClose}>
            Đóng
          </Button>
          <Button type="button" className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700">
            <Printer className="size-3.5" />
            In phiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={mono ? "font-mono text-sm text-gray-800" : "text-sm text-gray-800"}>{value}</p>
    </div>
  );
}
