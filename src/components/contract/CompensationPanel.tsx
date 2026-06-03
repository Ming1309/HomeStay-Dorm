import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileWarning, Plus, Printer, Save, Trash2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore, type AssetRecoveryItem, type ContractItem } from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

const ASSET_CATALOG: Array<{ name: string; unitPrice: number }> = [
  { name: "Thẻ từ", unitPrice: 100000 },
  { name: "Ghế nhựa", unitPrice: 250000 },
  { name: "Chìa khóa phòng", unitPrice: 200000 },
  { name: "Giường ngủ", unitPrice: 2500000 },
  { name: "Nệm", unitPrice: 1200000 },
  { name: "Điều hòa", unitPrice: 6500000 },
  { name: "Tủ lạnh", unitPrice: 4500000 },
  { name: "Tủ quần áo", unitPrice: 1800000 },
  { name: "Rèm cửa", unitPrice: 350000 },
  { name: "Quạt trần", unitPrice: 800000 },
];

const itemSchema = z.object({
  assetName: z.string().min(1, "Chọn tài sản"),
  violation: z.enum(["damaged", "lost"]),
  quantity: z
    .string()
    .min(1, "Nhập số lượng")
    .regex(/^\d+$/, "Chỉ nhập chữ số")
    .refine((v) => Number(v) > 0, "Số lượng phải > 0"),
  unitPrice: z
    .string()
    .min(1, "Nhập đơn giá")
    .regex(/^\d+$/, "Chỉ nhập chữ số"),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "Cần ít nhất 1 dòng tài sản"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CompensationPanel({ contract }: { contract: ContractItem }) {
  const { assetRecoveries, createCompensationInvoice } = useWorkflowStore();
  const recovery = assetRecoveries.find((a) => a.contractId === contract.id);
  const [issuedInvoice, setIssuedInvoice] = useState<ReturnType<
    typeof createCompensationInvoice
  > | null>(null);
  const [dirty, setDirty] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items:
        recovery?.items.map((i) => ({
          assetName: i.assetName,
          violation: i.violation,
          quantity: String(i.quantity),
          unitPrice: String(i.unitPrice),
        })) ?? [{ assetName: "", violation: "damaged", quantity: "1", unitPrice: "0" }],
      note: "",
    },
    mode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    const sub = form.watch(() => setDirty(form.formState.isDirty));
    return () => sub.unsubscribe();
  }, [form]);

  const items = form.watch("items");
  const total = items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);

  const onAssetChange = (index: number, name: string) => {
    form.setValue(`items.${index}.assetName`, name, { shouldDirty: true });
    const found = ASSET_CATALOG.find((a) => a.name === name);
    if (found) {
      form.setValue(`items.${index}.unitPrice`, String(found.unitPrice), { shouldDirty: true });
    }
  };

  const handleIssue = (data: FormValues) => {
    const items: AssetRecoveryItem[] = data.items.map((i, idx) => ({
      id: `ci-${contract.id}-${idx}`,
      assetName: i.assetName,
      violation: i.violation,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
    }));
    const invoice = createCompensationInvoice({
      contractId: contract.id,
      customerName: contract.customerName,
      room: contract.room,
      items,
      note: data.note ?? "",
    });
    setIssuedInvoice(invoice);
    toast.success(`Đã xuất hóa đơn bồi thường ${invoice.code}.`, {
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
    form.reset(data);
    setDirty(false);
  };

  const handleSaveDraft = () => {
    toast.success("Đã lưu nháp hóa đơn bồi thường (cục bộ).");
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{contract.id}</h1>
          <Badge className="h-5 bg-rose-100 text-[10px] text-rose-700">Bồi thường</Badge>
          <span className="text-xs text-gray-500">
            {contract.customerName} • {contract.room}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">Tổng bồi thường</p>
          <p className="font-mono text-sm font-bold text-rose-700">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Form {...form}>
          <form id="compensation-form" onSubmit={form.handleSubmit(handleIssue)} className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Info label="Mã hợp đồng" value={contract.id} mono />
                <Info label="Khách hàng" value={contract.customerName} />
                <Info label="Số điện thoại" value={contract.phone} />
                <Info label="Phòng" value={contract.room} mono />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <FileWarning className="size-3.5" />
                  Danh sách tài sản bồi thường
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() =>
                    append({ assetName: "", violation: "damaged", quantity: "1", unitPrice: "0" })
                  }
                >
                  <Plus className="size-3.5" />
                  Thêm dòng
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-2 py-2 text-xs">STT</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Tên tài sản *</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Loại vi phạm *</TableHead>
                    <TableHead className="px-2 py-2 text-right text-xs">Số lượng *</TableHead>
                    <TableHead className="px-2 py-2 text-right text-xs">Đơn giá *</TableHead>
                    <TableHead className="px-2 py-2 text-right text-xs">Thành tiền</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const qty = Number(items?.[index]?.quantity || 0);
                    const price = Number(items?.[index]?.unitPrice || 0);
                    const lineTotal = qty * price;
                    return (
                      <TableRow key={field.id} className="hover:bg-transparent">
                        <TableCell className="px-2 py-2 text-xs text-gray-500">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-2 py-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.assetName`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Select value={f.value} onValueChange={(v) => onAssetChange(index, v)}>
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Chọn tài sản" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ASSET_CATALOG.map((a) => (
                                        <SelectItem key={a.name} value={a.name}>
                                          {a.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.violation`}
                            render={({ field: f }) => (
                              <FormItem>
                                <Select value={f.value} onValueChange={f.onChange}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="damaged">Hư hỏng</SelectItem>
                                    <SelectItem value="lost">Mất</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    className="h-8 text-right font-mono text-xs"
                                    {...f}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    className="h-8 text-right font-mono text-xs"
                                    {...f}
                                  />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="px-2 py-2 text-right font-mono text-xs font-semibold">
                          {formatCurrency(lineTotal)}
                        </TableCell>
                        <TableCell className="px-2 py-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 text-gray-400 hover:text-rose-600"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter className="bg-transparent">
                  <TableRow className="border-t-2 border-rose-200 bg-rose-50/50 hover:bg-rose-50/50">
                    <TableCell colSpan={5} className="px-2 py-3 text-right text-sm font-bold">
                      Tổng tiền bồi thường:
                    </TableCell>
                    <TableCell className="px-2 py-3 text-right font-mono text-base font-bold text-rose-700">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Ghi chú thêm cho hóa đơn bồi thường..."
                      className="text-sm"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
            S
          </kbd>{" "}
          : Lưu nháp •{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Enter
          </kbd>{" "}
          : Xuất hóa đơn
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 text-xs"
            onClick={handleSaveDraft}
          >
            <Save className="size-3.5" />
            Lưu nháp
          </Button>
          <CancelButton dirty={dirty} onConfirmed={() => form.reset()} />
          <Button
            type="submit"
            form="compensation-form"
            className="h-8 bg-rose-600 text-xs hover:bg-rose-700"
            disabled={!form.formState.isValid}
          >
            <Printer className="size-3.5" />
            Xuất hóa đơn
          </Button>
        </div>
      </footer>

      <InvoicePreviewDialog invoice={issuedInvoice} onClose={() => setIssuedInvoice(null)} />
    </section>
  );
}

function CancelButton({ dirty, onConfirmed }: { dirty: boolean; onConfirmed: () => void }) {
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
          <AlertDialogTitle>Hủy lập hóa đơn bồi thường?</AlertDialogTitle>
          <AlertDialogDescription>
            {dirty
              ? "Các thay đổi chưa lưu sẽ bị mất. Bạn có chắc muốn hủy?"
              : "Đóng biểu mẫu và quay lại danh sách hợp đồng."}
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

function InvoicePreviewDialog({
  invoice,
  onClose,
}: {
  invoice: ReturnType<typeof useWorkflowStore>["compensationInvoices"][number] | null;
  onClose: () => void;
}) {
  if (!invoice) return null;

  return (
    <Dialog open={!!invoice} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hóa đơn bồi thường {invoice.code}</DialogTitle>
          <DialogDescription>
            Xem trước hóa đơn. Tính năng in thực tế sẽ tích hợp máy in sau.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <Info label="Hợp đồng" value={invoice.contractId} mono />
            <Info label="Khách hàng" value={invoice.customerName} />
            <Info label="Phòng" value={invoice.room} mono />
            <Info label="Ngày lập" value={new Date(invoice.createdAt).toLocaleString("vi-VN")} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Tài sản</TableHead>
                <TableHead className="text-xs">Vi phạm</TableHead>
                <TableHead className="text-right text-xs">SL</TableHead>
                <TableHead className="text-right text-xs">Đơn giá</TableHead>
                <TableHead className="text-right text-xs">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-sm">{i.assetName}</TableCell>
                  <TableCell className="text-sm">
                    {i.violation === "damaged" ? "Hư hỏng" : "Mất"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">{i.quantity}</TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {formatCurrency(i.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono font-semibold">
                    {formatCurrency(i.quantity * i.unitPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Tổng cộng
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-rose-700">
                  {formatCurrency(invoice.total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          {invoice.note && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <span className="font-semibold">Ghi chú:</span> {invoice.note}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="h-8 text-xs" onClick={onClose}>
            Đóng
          </Button>
          <Button type="button" className="h-8 bg-rose-600 text-xs hover:bg-rose-700">
            <Printer className="size-3.5" />
            In hóa đơn
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
