import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ClipboardCheck, Printer, ScrollText, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { ReconciliationSummary } from "@/components/contract/ReconciliationSummary";
import {
  useWorkflowStore,
  type ContractItem,
  type ReconciliationResult,
  type TerminationRecord,
} from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

const formSchema = z
  .object({
    date: z.string().min(1, "Vui lòng chọn ngày thanh lý"),
    executor: z.string().min(1, "Vui lòng nhập người thực hiện"),
    note: z.string().optional(),
    confirmations: z.object({
      customerReturned: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
      keysRecovered: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
      financialSettled: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
      roomUpdated: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
    }),
  })
  .refine(
    (data) =>
      data.confirmations.customerReturned &&
      data.confirmations.keysRecovered &&
      data.confirmations.financialSettled &&
      data.confirmations.roomUpdated,
    { message: "Cần xác nhận đủ 4 mục trước khi thanh lý", path: ["confirmations"] },
  );

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_EXECUTOR = "Trần Văn Hùng — Quản lý";

const CONFIRMATION_ITEMS: Array<{
  key: keyof FormValues["confirmations"];
  label: string;
  hint: string;
}> = [
  {
    key: "customerReturned",
    label: "Khách đã trả phòng",
    hint: "Khách đã bàn giao lại phòng cho ký túc xá.",
  },
  {
    key: "keysRecovered",
    label: "Đã thu hồi chìa khóa / thẻ từ",
    hint: "Thu hồi đầy đủ vật dụng bàn giao ban đầu.",
  },
  {
    key: "financialSettled",
    label: "Đã hoàn tất nghĩa vụ tài chính",
    hint: "Hoàn cọc hoặc thu thêm đã được xử lý xong.",
  },
  {
    key: "roomUpdated",
    label: "Đã cập nhật trạng thái phòng",
    hint: "Phòng chuyển sang trạng thái trống / sẵn sàng dọn vệ sinh.",
  },
];

export function TerminationPanel({ contract }: { contract: ContractItem }) {
  const { getReconciliation, terminateContract } = useWorkflowStore();
  const reconciliation: ReconciliationResult | null = getReconciliation(contract.id);
  const [issued, setIssued] = useState<TerminationRecord | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      executor: DEFAULT_EXECUTOR,
      note: "",
      confirmations: {
        customerReturned: false,
        keysRecovered: false,
        financialSettled: false,
        roomUpdated: false,
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      date: new Date().toISOString().slice(0, 10),
      executor: DEFAULT_EXECUTOR,
      note: "",
      confirmations: {
        customerReturned: false,
        keysRecovered: false,
        financialSettled: false,
        roomUpdated: false,
      },
    });
  }, [contract.id, form]);

  const allChecked = form.watch("confirmations");

  const handleConfirm = (data: FormValues) => {
    const record = terminateContract({
      contractId: contract.id,
      customerName: contract.customerName,
      executor: data.executor,
      note: data.note ?? "",
      confirmations: data.confirmations,
    });
    setIssued(record);
    toast.success(`Đã thanh lý hợp đồng ${contract.id}.`, {
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
  };

  if (!reconciliation) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Chưa có dữ liệu đối soát cho hợp đồng này.</p>
      </section>
    );
  }

  const isLiquidated = contract.status === "liquidated";

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{contract.id}</h1>
          <Badge
            className={`h-5 text-[10px] ${
              isLiquidated ? "bg-slate-200 text-slate-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isLiquidated ? "Đã thanh lý" : "Chờ thanh lý"}
          </Badge>
          <span className="text-xs text-gray-500">
            {contract.customerName} • {contract.room}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">Trạng thái</p>
          <p className="font-mono text-sm font-bold text-slate-700">
            {isLiquidated ? "Đã thanh lý" : "Đang hiệu lực"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Form {...form}>
          <form
            id="termination-form"
            onSubmit={form.handleSubmit(handleConfirm)}
            className="space-y-4"
          >
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin hợp đồng</h3>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <Info label="Mã hợp đồng" value={contract.id} mono />
                <Info label="Khách hàng" value={contract.customerName} />
                <Info label="Phòng" value={contract.room} mono />
                <Info label="Ngày bắt đầu" value={contract.rentalPeriod.split(" - ")[0] ?? ""} />
                <Info label="Ngày kết thúc" value={contract.rentalPeriod.split(" - ")[1] ?? ""} />
                <Info label="Số điện thoại" value={contract.phone} mono />
              </div>
            </div>

            <ReconciliationSummary reconciliation={reconciliation} mode="terminate" />

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <ScrollText className="size-3.5" />
                Thông tin thanh lý
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Ngày thanh lý *</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="executor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Người thực hiện *</FormLabel>
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

            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-700">
                Checkbox xác nhận thanh lý
              </h3>
              <p className="mb-3 text-[11px] text-slate-500">
                Cần tick đủ 4 mục dưới đây trước khi xác nhận thanh lý.
              </p>
              <div className="space-y-2.5">
                {CONFIRMATION_ITEMS.map((item) => (
                  <FormField
                    key={item.key}
                    control={form.control}
                    name={`confirmations.${item.key}`}
                    render={({ field }) => (
                      <FormItem>
                        <label
                          className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 transition-colors ${
                            field.value
                              ? "border-emerald-300 bg-emerald-50/60"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={(v) => field.onChange(v === true)}
                              className="mt-0.5"
                            />
                          </FormControl>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{item.label}</p>
                            <p className="text-[11px] text-gray-500">{item.hint}</p>
                          </div>
                        </label>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              {form.formState.errors.confirmations && (
                <p className="mt-2 text-[11px] text-rose-600">
                  {form.formState.errors.confirmations.message ??
                    "Cần xác nhận đủ 4 mục trước khi thanh lý."}
                </p>
              )}
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
          : Xác nhận thanh lý •{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            P
          </kbd>{" "}
          : In biên bản
          <span className="ml-3 font-mono text-[10px] text-gray-400">
            Đã tick: {Object.values(allChecked).filter(Boolean).length}/4
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs"
            onClick={() =>
              setIssued(
                createPreview(
                  contract.id,
                  contract.customerName,
                  form.getValues("executor"),
                  form.getValues("date"),
                ),
              )
            }
          >
            <Printer className="size-3.5" />
            In biên bản
          </Button>
          <CancelButton disabled={isLiquidated} onConfirmed={() => form.reset()} />
          <Button
            type="submit"
            form="termination-form"
            className="h-8 bg-slate-700 text-xs hover:bg-slate-800"
            disabled={!form.formState.isValid || isLiquidated}
          >
            <ClipboardCheck className="size-3.5" />
            Xác nhận thanh lý
          </Button>
        </div>
      </footer>

      <RecordPreviewDialog record={issued} onClose={() => setIssued(null)} />
    </section>
  );
}

function createPreview(
  contractId: string,
  customerName: string,
  executor: string,
  date: string,
): TerminationRecord {
  return {
    id: `BBTL-PREVIEW-${Date.now()}`,
    code: `BBTL-PREVIEW`,
    contractId,
    customerName,
    date,
    executor,
    note: "",
    confirmations: {
      customerReturned: true,
      keysRecovered: true,
      financialSettled: true,
      roomUpdated: true,
    },
  };
}

function CancelButton({ disabled, onConfirmed }: { disabled?: boolean; onConfirmed: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 text-xs text-gray-500"
          disabled={disabled}
        >
          <X className="size-3.5" />
          Hủy
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy thanh lý hợp đồng?</AlertDialogTitle>
          <AlertDialogDescription>
            Hợp đồng sẽ ở trạng thái chờ quyết toán. Có thể quay lại thanh lý sau.
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

function RecordPreviewDialog({
  record,
  onClose,
}: {
  record: TerminationRecord | null;
  onClose: () => void;
}) {
  if (!record) return null;

  return (
    <Dialog open={!!record} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Biên bản thanh lý {record.code}</DialogTitle>
          <DialogDescription>
            {record.code.startsWith("BBTL-")
              ? "Biên bản đã được ghi nhận. Tính năng in thực tế sẽ tích hợp sau."
              : "Xem trước biên bản thanh lý trước khi in."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <Info label="Hợp đồng" value={record.contractId} mono />
          <Info label="Khách hàng" value={record.customerName} />
          <Info label="Ngày thanh lý" value={new Date(record.date).toLocaleDateString("vi-VN")} />
          <Info label="Người thực hiện" value={record.executor} />
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
            <p className="mb-1 font-semibold">Xác nhận:</p>
            <ul className="space-y-0.5">
              <li>{record.confirmations.customerReturned ? "✓" : "✗"} Khách đã trả phòng</li>
              <li>{record.confirmations.keysRecovered ? "✓" : "✗"} Đã thu hồi chìa khóa/thẻ từ</li>
              <li>
                {record.confirmations.financialSettled ? "✓" : "✗"} Đã hoàn tất nghĩa vụ tài chính
              </li>
              <li>{record.confirmations.roomUpdated ? "✓" : "✗"} Đã cập nhật trạng thái phòng</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-8 text-xs" onClick={onClose}>
            Đóng
          </Button>
          <Button type="button" className="h-8 bg-slate-700 text-xs hover:bg-slate-800">
            <Printer className="size-3.5" />
            In biên bản
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
