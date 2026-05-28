import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CreditCard, FileCheck2, Search, UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useWorkflowStore } from "@/lib/workflow-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accountant/payments")({
  component: AccountantPaymentsPage,
});

const receiptSchema = z.object({
  actualAmount: z.string().min(1).regex(/^\d+$/, "Chỉ nhập chữ số"),
  paymentMethod: z.string().min(1),
  proofName: z.string().min(1, "Vui lòng tải ảnh minh chứng"),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
const formatAmountInput = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeAmountInput = (value: string) => value.replace(/\D/g, "");

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
        <h2 className="text-sm font-bold text-gray-800">Hàng đợi thu tiền</h2>
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
                    <span className="font-mono text-xs font-bold text-blue-600">{item.id}</span>
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
  const { recordPayment } = useWorkflowStore();
  const [phase, setPhase] = useState<1 | 2>(1);
  const [canSubmitReceipt, setCanSubmitReceipt] = useState(false);

  if (!contract) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Chọn hợp đồng để bắt đầu thu tiền.</p>
      </section>
    );
  }

  const remaining = Math.max(contract.invoiceTotal - contract.paidAmount, 0);

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{contract.id}</h1>
          <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">
            {contract.status === "partial_payment" ? "Thanh toán một phần" : "Chờ thanh toán"}
          </Badge>
          <span className="text-xs text-gray-500">
            {contract.customerName} • {contract.room}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">Tổng cần thanh toán</p>
          <p className="font-mono text-sm font-bold text-gray-900">{formatCurrency(remaining)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {phase === 1 ? (
          <Card className="rounded-lg border-gray-200 shadow-sm">
            <CardContent className="p-0">
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
                      <TableCell className="py-2 text-sm text-gray-500">{line.cycle}</TableCell>
                      <TableCell className="px-4 py-2 text-right font-mono text-sm">
                        {formatCurrency(line.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-transparent">
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={2} className="px-4 py-2 text-right text-sm">
                      Tổng cộng hóa đơn:
                    </TableCell>
                    <TableCell className="px-4 py-2 text-right font-mono text-sm">
                      {formatCurrency(contract.invoiceTotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={2} className="px-4 py-2 text-right text-sm text-gray-500">
                      Đã thanh toán trước:
                    </TableCell>
                    <TableCell className="px-4 py-2 text-right font-mono text-sm text-gray-500">
                      {formatCurrency(contract.paidAmount)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50/50">
                    <TableCell colSpan={2} className="px-4 py-3 text-right text-base font-bold">
                      Tổng còn lại cần thu:
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-lg font-bold text-blue-700">
                      {formatCurrency(remaining)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <ReceiptForm
            contract={contract}
            onFormStateChange={setCanSubmitReceipt}
            onDone={(amount, method) => {
              const result = recordPayment(contract.id, amount, method);
              if (result.scenario === "full") {
                toast.success("Đã thu đủ tiền. Hợp đồng chuyển sang Chờ bàn giao.", {
                  icon: <CheckCircle2 className="size-4 text-emerald-600" />,
                });
              } else {
                toast.success(
                  "Ghi nhận thanh toán một phần thành công. Hợp đồng tiếp tục chờ thu nợ.",
                );
              }
              setPhase(1);
            }}
          />
        )}
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <div className="text-xs text-gray-400">
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            {phase === 1 ? "S" : "Enter"}
          </kbd>{" "}
          : {phase === 1 ? "Tiến hành thu tiền" : "Ghi nhận thanh toán"}
        </div>
        {phase === 1 ? (
          <Button
            type="button"
            onClick={() => setPhase(2)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard className="size-4" />
            Tiến hành thu tiền
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => setPhase(1)}>
              Hủy giao dịch
            </Button>
            <Button
              type="submit"
              form="receipt-form"
              disabled={!canSubmitReceipt}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="size-4" />
              Xác nhận & Ghi nhận thanh toán
            </Button>
          </div>
        )}
      </footer>
    </section>
  );
}

function ReceiptForm({
  contract,
  onFormStateChange,
  onDone,
}: {
  contract: ReturnType<typeof useWorkflowStore>["contracts"][number];
  onFormStateChange: (canSubmit: boolean) => void;
  onDone: (amount: number, method: "bank-transfer" | "cash") => void;
}) {
  const remainingBefore = Math.max(contract.invoiceTotal - contract.paidAmount, 0);
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      actualAmount: String(remainingBefore),
      paymentMethod: "bank-transfer",
      proofName: "",
    },
  });

  const actualAmount = form.watch("actualAmount");
  const method = form.watch("paymentMethod") as "bank-transfer" | "cash";
  const proofName = form.watch("proofName");
  const paidThisTime = Number(actualAmount || 0);
  const remainingAfter = Math.max(remainingBefore - paidThisTime, 0);

  const uploadLabel = method === "cash" ? "Ảnh biên nhận tiền mặt *" : "Ảnh bill chuyển khoản *";
  const uploadHint =
    method === "cash"
      ? "Bắt buộc tải ảnh chụp phiếu thu có chữ ký của khách hàng."
      : "Bắt buộc tải ảnh chụp màn hình giao dịch thành công.";

  useEffect(() => {
    onFormStateChange(Boolean(proofName));
  }, [proofName, onFormStateChange]);

  return (
    <Form {...form}>
      <form
        id="receipt-form"
        className="space-y-4"
        onSubmit={form.handleSubmit((data) =>
          onDone(Number(data.actualAmount), data.paymentMethod as "bank-transfer" | "cash"),
        )}
      >
        <Card className="rounded-lg border-gray-200 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-800">Lập phiếu thu</h2>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-gray-600">Tiền hợp đồng:</span>
                <span className="text-right font-mono font-semibold">
                  {formatCurrency(contract.invoiceTotal)}
                </span>
                <span className="text-gray-600">Đã thanh toán:</span>
                <span className="text-right font-mono font-semibold">
                  {formatCurrency(contract.paidAmount)}
                </span>
                <span className="text-gray-600">Thanh toán lần này:</span>
                <span className="text-right font-mono font-semibold">
                  {formatCurrency(paidThisTime)}
                </span>
                <span className="text-gray-600">Còn nợ sau thu:</span>
                <span
                  className={cn(
                    "text-right font-mono font-semibold",
                    remainingAfter > 0 ? "text-amber-700" : "text-emerald-700",
                  )}
                >
                  {formatCurrency(remainingAfter)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="actualAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Số tiền thực thu *</FormLabel>
                    <FormControl>
                      <Input
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={formatAmountInput(field.value)}
                        onChange={(event) =>
                          field.onChange(normalizeAmountInput(event.target.value))
                        }
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
                    <FormLabel className="text-xs">Phương thức thanh toán *</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="proofName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">{uploadLabel}</FormLabel>
                  <p className="text-[11px] text-gray-500">{uploadHint}</p>
                  <FormControl>
                    <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center">
                      <UploadCloud className="size-7 text-gray-400" />
                      <span className="mt-2 text-sm font-semibold text-gray-700">
                        Tải ảnh minh chứng
                      </span>
                      {field.value && (
                        <span className="mt-2 text-xs text-blue-600">{field.value}</span>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(event) => field.onChange(event.target.files?.[0]?.name ?? "")}
                      />
                    </label>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
