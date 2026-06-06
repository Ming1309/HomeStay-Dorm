import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Check, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ReconciliationSummary } from "@/components/contract/ReconciliationSummary";
import {
  useWorkflowStore,
  type ContractItem,
  type ReconciliationResult,
  type TerminationRecord,
} from "@/lib/workflow-store";

const formSchema = z
  .object({
    confirmations: z.object({
      customerAgreed: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
      liquidationSigned: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
      keysRecovered: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
    }),
  })
  .refine(
    (data) =>
      data.confirmations.customerAgreed &&
      data.confirmations.liquidationSigned &&
      data.confirmations.keysRecovered,
    { message: "Cần xác nhận đủ 3 mục trước khi thanh lý", path: ["confirmations"] },
  );

type FormValues = z.infer<typeof formSchema>;

const CONFIRMATION_ITEMS: Array<{
  key: keyof FormValues["confirmations"];
  label: string;
  hint: string;
}> = [
  {
    key: "customerAgreed",
    label: "Khách hàng đã xem và đồng ý với kết quả đối soát",
    hint: "Khách đã được thông báo số tiền hoàn hoặc khoản cần thu thêm.",
  },
  {
    key: "liquidationSigned",
    label: "Khách đã ký biên bản thanh lý giấy",
    hint: "Biên bản thanh lý đã được khách ký xác nhận.",
  },
  {
    key: "keysRecovered",
    label: "Khách đã trả lại chìa khóa / thẻ từ",
    hint: "Đã thu hồi đầy đủ vật dụng bàn giao ban đầu.",
  },
];

export function TerminationPanel({ contract }: { contract: ContractItem }) {
  const { assetRecoveries, getReconciliation, receiptVouchers, terminateContract } =
    useWorkflowStore();
  const reconciliation: ReconciliationResult | null = getReconciliation(contract.id);
  const [issued, setIssued] = useState<TerminationRecord | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmations: {
        customerAgreed: false,
        liquidationSigned: false,
        keysRecovered: false,
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      confirmations: {
        customerAgreed: false,
        liquidationSigned: false,
        keysRecovered: false,
      },
    });
  }, [contract.id, form]);

  const allChecked = form.watch("confirmations");
  const checkedCount = Object.values(allChecked).filter(Boolean).length;

  const handleConfirm = (data: FormValues) => {
    setPendingConfirm(data);
  };

  const finalizeTermination = () => {
    if (!pendingConfirm) return;
    const record = terminateContract({
      contractId: contract.id,
      customerName: contract.customerName,
      executor: "Trần Văn Hùng — Quản lý",
      note: "",
      confirmations: {
        customerReturned: true,
        keysRecovered: pendingConfirm.confirmations.keysRecovered,
        financialSettled: true,
        roomUpdated: true,
      },
    });
    setIssued(record);
    setPendingConfirm(null);
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
  const hasAssetRecovery = assetRecoveries.some((a) => a.contractId === contract.id);
  const paidAdditionalAmount = receiptVouchers
    .filter((v) => v.contractId === contract.id)
    .reduce((sum, v) => sum + v.amount, 0);
  const remainingDebt = Math.max(reconciliation.additionalDue - paidAdditionalAmount, 0);
  const financialReady = remainingDebt === 0;
  const systemReady = Boolean(reconciliation) && financialReady && hasAssetRecovery;
  const canSubmit = form.formState.isValid && systemReady && !isLiquidated;
  const disabledReason = "Vui lòng hoàn tất các điều kiện xác nhận trước khi thanh lý hợp đồng.";

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
          <p className="text-[11px] uppercase text-gray-400">TRẠNG THÁI HỢP ĐỒNG</p>
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
                <Info label="Phòng/Giường" value={contract.room} mono />
                <Info label="Số điện thoại" value={contract.phone} mono />
                <Info label="Ngày bắt đầu" value={contract.rentalPeriod.split(" - ")[0] ?? ""} />
                <Info label="Ngày kết thúc" value={contract.rentalPeriod.split(" - ")[1] ?? ""} />
              </div>
            </div>

            <ReconciliationSummary
              reconciliation={reconciliation}
              mode="terminate"
              paidAmount={paidAdditionalAmount}
            />

            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-700">Điều kiện xác nhận thanh lý</h3>
              <p className="mb-3 text-[11px] text-slate-500">
                Quản lý cần xác nhận các mục dưới đây trước khi thanh lý hợp đồng.
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
                    "Cần xác nhận đủ 3 mục trước khi thanh lý."}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-700">Trạng thái hệ thống</h3>
              <div className="space-y-2 text-sm">
                <SystemState ok label="Phiếu đối soát đã chốt" />
                <SystemState
                  ok={financialReady}
                  label={
                    financialReady
                      ? "Nghĩa vụ tài chính đã hoàn tất"
                      : "Khách còn công nợ chưa thanh toán"
                  }
                />
                <SystemState
                  ok={hasAssetRecovery}
                  label={
                    hasAssetRecovery
                      ? "Biên bản thu hồi tài sản đã được lập"
                      : "Biên bản thu hồi tài sản chưa được lập"
                  }
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
          : Xác nhận thanh lý
          <span className="ml-3 font-mono text-[10px] text-gray-400">
            Đã xác nhận: {checkedCount}/3
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="termination-form"
            className="h-8 bg-slate-700 text-xs hover:bg-slate-800"
            disabled={!canSubmit}
            title={!canSubmit ? disabledReason : undefined}
          >
            <ClipboardCheck className="size-3.5" />
            Xác nhận thanh lý
          </Button>
        </div>
        {!canSubmit && !isLiquidated && (
          <p className="absolute bottom-14 right-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 shadow-sm">
            {disabledReason}
          </p>
        )}
      </footer>

      <Dialog open={!!pendingConfirm} onOpenChange={(o) => !o && setPendingConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh lý hợp đồng?</DialogTitle>
            <DialogDescription>
              Hệ thống sẽ cập nhật hợp đồng {contract.id} sang trạng thái ‘Đã thanh lý’, chuyển
              giường/phòng về trạng thái trống và ghi nhận khách đã trả phòng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => setPendingConfirm(null)}>
              Quay lại
            </Button>
            <Button type="button" className="h-8 bg-slate-700 text-xs hover:bg-slate-800" onClick={finalizeTermination}>
              Xác nhận thanh lý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RecordPreviewDialog record={issued} onClose={() => setIssued(null)} />
    </section>
  );
}

function SystemState({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={ok ? "flex items-center gap-2 text-emerald-700" : "flex items-center gap-2 text-amber-700"}>
      {ok ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
      <span>{label}</span>
    </div>
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
          <DialogDescription>Biên bản đã được ghi nhận.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <Info label="Hợp đồng" value={record.contractId} mono />
          <Info label="Khách hàng" value={record.customerName} />
          <Info label="Ngày thanh lý" value={new Date(record.date).toLocaleDateString("vi-VN")} />
          <Info label="Người thực hiện" value={record.executor} />
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
            <p className="mb-1 font-semibold">Xác nhận:</p>
            <ul className="space-y-0.5">
              <li>✓ Khách hàng đã xem và đồng ý với kết quả đối soát</li>
              <li>✓ Khách đã ký biên bản thanh lý giấy</li>
              <li>{record.confirmations.keysRecovered ? "✓" : "✗"} Đã thu hồi chìa khóa/thẻ từ</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-8 text-xs" onClick={onClose}>
            Đóng
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
