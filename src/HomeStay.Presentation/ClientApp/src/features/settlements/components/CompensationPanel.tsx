import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Printer,
  User,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { useWorkflowStore, type ContractItem, type CompensationInvoice } from "@/app/providers/workflow-store";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(iso));
}

function getBbthCode(recoveryId: string): string {
  // Already formatted like "BBTH-001" — reformat to "BBTH-0018" style from contract
  const num = recoveryId.replace(/\D/g, "").padStart(4, "0");
  return `BBTH-${num}`;
}

// ─── schema ─────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  // readonly from recovery — stored for submission
  assetName: z.string(),
  violation: z.enum(["damaged", "lost"]),
  quantity: z.number(),
  description: z.string(),
  // editable
  unitPrice: z
    .string()
    .min(1, "Nhập số tiền")
    .regex(/^\d+$/, "Chỉ nhập chữ số")
    .refine((v) => Number(v) >= 0, "Không âm"),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── component ──────────────────────────────────────────────────────────────

export function CompensationPanel({ contract }: { contract: ContractItem }) {
  const { assetRecoveries, createCompensationInvoice } = useWorkflowStore();
  const recovery = assetRecoveries.find((a) => a.contractId === contract.id);

  const [issuedInvoice, setIssuedInvoice] = useState<CompensationInvoice | null>(null);

  const bbthCode = recovery ? getBbthCode(recovery.id) : `BBTH-????`;
  const recordedAt = recovery?.recordedAt ?? new Date().toISOString();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items:
        recovery?.items.map((i) => ({
          assetName: i.assetName,
          violation: i.violation,
          quantity: i.quantity,
          description: i.violation === "damaged" ? "Hư hỏng cần bồi thường" : `Mất ${i.quantity} cái`,
          unitPrice: String(i.unitPrice),
        })) ?? [],
      note: "",
    },
    mode: "onChange",
  });

  const { fields } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!recovery) return;
    form.reset({
      items: recovery.items.map((i) => ({
        assetName: i.assetName,
        violation: i.violation,
        quantity: i.quantity,
        description:
          i.violation === "damaged" ? "Hư hỏng cần bồi thường" : `Mất ${i.quantity} cái`,
        unitPrice: String(i.unitPrice),
      })),
      note: "",
    });
  }, [contract.id, recovery, form]);

  const watchedItems = form.watch("items");
  const total = watchedItems.reduce(
    (sum, i) => sum + (i.quantity ?? 0) * Number(i.unitPrice || 0),
    0,
  );

  const handleIssue = (data: FormValues) => {
    const assetItems = data.items.map((i, idx) => ({
      id: `ci-${contract.id}-${idx}`,
      assetName: i.assetName,
      violation: i.violation,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
    }));
    const invoice = createCompensationInvoice({
      contractId: contract.id,
      customerName: contract.customerName,
      room: contract.room,
      items: assetItems,
      note: data.note ?? "",
    });
    setIssuedInvoice(invoice);
    toast.success(`Lập hóa đơn bồi thường thành công!`, {
      description: `${invoice.code} đã được tạo với trạng thái "Chưa thanh toán".`,
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
  };

  if (!recovery) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-2 size-8 text-amber-400" />
          <p className="text-sm font-medium text-gray-600">
            Không tìm thấy biên bản thu hồi cho hợp đồng này.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Biên bản phải được lập bởi Quản lý trước khi kế toán lập hóa đơn.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-rose-700">{bbthCode}</span>
            <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700">
              Chưa lập hóa đơn
            </Badge>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {contract.customerName}
            <span className="ml-2 font-normal text-gray-400">·</span>
            <span className="ml-2 font-normal text-gray-500">{contract.room}</span>
            <span className="ml-2 font-normal text-gray-400">·</span>
            <span className="ml-2 font-mono font-normal text-gray-500">{contract.id}</span>
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-600">
            Tổng bồi thường dự kiến
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold text-rose-700">
            {formatCurrency(total)}
          </p>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-4xl space-y-4">

          {/* Card: Thông tin biên bản thu hồi */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="size-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-900">Thông tin biên bản thu hồi</h3>
              <span className="ml-auto font-mono text-[11px] text-gray-400">{bbthCode}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
              <InfoField label="Mã biên bản" value={bbthCode} mono />
              <InfoField label="Ngày thu hồi" value={formatDate(recordedAt)} />
              <InfoField label="Hợp đồng" value={contract.id} mono />
              <InfoField label="Khách hàng" value={contract.customerName} />
              <InfoField label="Số điện thoại" value={contract.phone} mono />
              <InfoField label="Phòng" value={contract.room} mono />
              <InfoField
                label="Người lập biên bản"
                value="Nguyễn Văn A — Quản lý"
                className="md:col-span-2"
              />
            </div>
          </section>

          <Form {...form}>
            <form id="compensation-form" onSubmit={form.handleSubmit(handleIssue)}>
              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Danh sách lỗi cần bồi thường
                      </h3>
                    </div>
                    <Badge className="h-5 shrink-0 bg-gray-100 text-[10px] text-gray-600 hover:bg-gray-100">
                      {fields.length} lỗi cần bồi thường
                    </Badge>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12 px-4 py-2.5 text-xs">STT</TableHead>
                      <TableHead className="w-40 px-3 py-2.5 text-xs">Tài sản</TableHead>
                      <TableHead className="w-36 px-3 py-2.5 text-xs">Loại vi phạm</TableHead>
                      <TableHead className="px-3 py-2.5 text-xs">Mô tả từ biên bản</TableHead>
                      <TableHead className="w-28 px-3 py-2.5 text-center text-xs">Minh chứng</TableHead>
                      <TableHead className="w-44 px-4 py-2.5 text-right text-xs">
                        Số tiền phạt *
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const item = watchedItems[index];
                      return (
                        <TableRow key={field.id} className="hover:bg-gray-50/40">
                          <TableCell className="px-4 py-4 text-xs text-gray-400">
                            {index + 1}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {item?.assetName}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <ViolationBadge violation={item?.violation} />
                          </TableCell>
                          <TableCell className="px-3 py-4 text-sm text-gray-600">
                            {item?.violation === "lost"
                              ? `Mất ${item.quantity} cái`
                              : "Không sử dụng được"}
                          </TableCell>
                          <TableCell className="px-3 py-4 text-center">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                            >
                              <Eye className="size-3" />
                              Xem ảnh
                            </button>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field: f }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="h-9 w-full text-right font-mono text-sm"
                                      {...f}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-[10px]" />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Tổng tiền bồi thường:
                  </span>
                  <span className="font-mono text-base font-bold text-rose-700">
                    {formatCurrency(total)}
                  </span>
                </div>
              </section>

            </form>
          </Form>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 flex min-h-16 items-center justify-end gap-2 border-t border-gray-200 bg-white px-5 py-3">
        <Button type="button" variant="outline" className="h-9" onClick={() => form.reset()}>
          Hủy
        </Button>
        <Button
          type="submit"
          form="compensation-form"
          className="h-9 bg-rose-600 hover:bg-rose-700"
          disabled={!form.formState.isValid || fields.length === 0}
        >
          Lập hóa đơn bồi thường
        </Button>
      </footer>

      {/* ── Success dialog ─────────────────────────────────────────── */}
      <SuccessDialog
        invoice={issuedInvoice}
        bbthCode={bbthCode}
        onClose={() => setIssuedInvoice(null)}
      />
    </section>
  );
}

// ─── sub-components ─────────────────────────────────────────────────────────

function ViolationBadge({ violation }: { violation?: "damaged" | "lost" }) {
  if (violation === "lost") {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
        Mất
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      Hư hỏng
    </span>
  );
}

function SuccessDialog({
  invoice,
  bbthCode,
  onClose,
}: {
  invoice: CompensationInvoice | null;
  bbthCode: string;
  onClose: () => void;
}) {
  if (!invoice) return null;
  return (
    <Dialog open={!!invoice} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Lập hóa đơn bồi thường thành công</DialogTitle>
          <DialogDescription className="text-center">
            Hóa đơn <span className="font-semibold text-rose-700">{invoice.code}</span> đã được tạo với trạng thái <span className="font-semibold text-amber-700">"Chưa thanh toán"</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Mã hóa đơn</span>
            <span className="font-mono font-semibold text-rose-700">{invoice.code}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Biên bản thu hồi</span>
            <span className="font-mono font-semibold text-gray-800">{bbthCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Khách hàng</span>
            <span className="font-medium text-gray-900">{invoice.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Tổng bồi thường</span>
            <span className="font-mono font-bold text-rose-700">
              {formatCurrency(invoice.total)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Trạng thái</span>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              Chưa thanh toán
            </span>
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

// ─── utility ─────────────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-900", mono && "font-mono")}>{value}</p>
    </div>
  );
}
