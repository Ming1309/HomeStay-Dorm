import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Search } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
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
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/manager/thu-hoi-tai-san")({
  component: ManagerAssetRecoveryPage,
});

type RecoveryContract = {
  id: string;
  customerName: string;
  room: string;
  returnDate: string;
  status: "pending_recovery";
  assets: Array<{ id: string; name: string; expectedQty: number }>;
};

const mockRecoveryContracts: RecoveryContract[] = [
  {
    id: "HD-PC021",
    customerName: "Nguyễn Thanh Sơn",
    room: "P.210",
    returnDate: "02/06/2026",
    status: "pending_recovery",
    assets: [
      { id: "a1", name: "Giường", expectedQty: 1 },
      { id: "a2", name: "Nệm", expectedQty: 1 },
      { id: "a3", name: "Tủ lạnh", expectedQty: 1 },
      { id: "a4", name: "Chìa khóa", expectedQty: 2 },
      { id: "a5", name: "Thẻ từ", expectedQty: 2 },
    ],
  },
  {
    id: "HD-PC024",
    customerName: "Phạm Thu Hà",
    room: "P.302",
    returnDate: "02/06/2026",
    status: "pending_recovery",
    assets: [
      { id: "b1", name: "Giường", expectedQty: 2 },
      { id: "b2", name: "Nệm", expectedQty: 2 },
      { id: "b3", name: "Tủ lạnh", expectedQty: 1 },
      { id: "b4", name: "Ghế học", expectedQty: 1 },
      { id: "b5", name: "Bàn", expectedQty: 1 },
    ],
  },
];

const schema = z
  .object({
    assets: z.array(
      z
        .object({
          id: z.string().min(1),
          name: z.string().min(1),
          expectedQty: z.coerce.number().min(0),
          recoveredQty: z.coerce.number({ invalid_type_error: "Nhập số lượng thu hồi" }).min(0, "Số lượng phải lớn hơn hoặc bằng 0"),
          condition: z.string().min(1, "Chọn tình trạng"),
          note: z.string().optional(),
        })
        .superRefine((asset, ctx) => {
          if (asset.recoveredQty > asset.expectedQty) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_big,
              maximum: asset.expectedQty,
              type: "number",
              inclusive: true,
              path: ["recoveredQty"],
              message: "Số lượng thu hồi không thể lớn hơn số lượng chuẩn",
            });
          }
        }),
    ),
  })
  .superRefine((data, ctx) => {
    data.assets.forEach((asset, index) => {
      if (Number.isNaN(asset.recoveredQty)) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          path: ["assets", index, "recoveredQty"],
          message: "Nhập số lượng thu hồi hợp lệ",
        });
      }
    });
  });

type FormValues = z.infer<typeof schema>;

function ManagerAssetRecoveryPage() {
  const allowed = useRoleGuard("manager");
  const [items, setItems] = useState<RecoveryContract[]>(mockRecoveryContracts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q) ||
        item.returnDate.toLowerCase().includes(q),
    );
  }, [items, query]);

  const selected = filtered.find((item) => item.id === selectedId) ?? null;

  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath="/manager/thu-hoi-tai-san">
      <div className="flex h-full overflow-hidden">
        <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-800">Thu hồi tài sản</h2>
            <p className="mt-1 text-xs text-gray-500">Hợp đồng có lịch trả phòng trong ngày</p>
            <p className="mt-2 text-xs text-gray-400">{filtered.length} hợp đồng chờ thu hồi</p>
          </div>
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm hợp đồng, phòng, khách..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Không có hợp đồng nào phù hợp.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-slate-50/80",
                        selectedId === item.id && "border-l-blue-500 bg-blue-50",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700">{item.id}</span>
                        <Badge className="h-5 bg-blue-100 text-[10px] text-blue-700">
                          {item.returnDate}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{item.customerName}</p>
                      <p className="font-mono text-xs text-gray-500">{item.room}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {!selected ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60 p-6">
            <div className="max-w-xl rounded-2xl border border-dashed border-gray-200 bg-white px-8 py-10 text-center text-sm text-gray-500 shadow-sm">
              <p className="mb-2 text-base font-semibold text-gray-900">Chọn hợp đồng để lập biên bản thu hồi tài sản</p>
              <p>Hệ thống sẽ hiện danh sách tài sản cho sẵn. Ghi số lượng thu hồi và tình trạng của từng thứ.</p>
            </div>
          </section>
        ) : (
          <RecoveryForm
            contract={selected}
            onSave={() => {
              setItems((current) => current.filter((item) => item.id !== selected.id));
              setSelectedId(null);
              toast.success("Lập biên bản thu hồi thành công. Đã gửi thông báo cho Kế toán.", {
                icon: <CheckCircle2 className="size-4 text-emerald-600" />,
              });
            }}
            onReject={() => {
              setItems((current) => current.filter((item) => item.id !== selected.id));
              setSelectedId(null);
              toast.success("Biên bản thu hồi bị hủy. Hợp đồng sẽ được xem lại.");
            }}
          />
        )}
      </div>
    </RoleShell>
  );
}

function RecoveryForm({
  contract,
  onSave,
  onReject,
}: {
  contract: RecoveryContract;
  onSave: () => void;
  onReject: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assets: contract.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        expectedQty: asset.expectedQty,
        recoveredQty: asset.expectedQty,
        condition: "Bình thường",
        note: "",
      })),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "assets" });

  useEffect(() => {
    form.reset({
      assets: contract.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        expectedQty: asset.expectedQty,
        recoveredQty: asset.expectedQty,
        condition: "Bình thường",
        note: "",
      })),
    });
  }, [contract, form]);

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-500">Hợp đồng</p>
            <p className="font-mono text-sm font-bold text-gray-900">{contract.id}</p>
            <p className="mt-1 text-sm text-gray-600">
              {contract.customerName} • {contract.room}
            </p>
          </div>
          <Badge className="h-6 bg-emerald-100 text-[10px] text-emerald-700">Lịch trả: {contract.returnDate}</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Form {...form}>
          <form id="recovery-form" onSubmit={form.handleSubmit(onSave)}>
            <div className="rounded-lg border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2 text-xs">STT</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Tài sản</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Số lượng chuẩn</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Số lượng thu hồi</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Tình trạng</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="p-2 text-xs text-gray-500">{index + 1}</TableCell>
                      <TableCell className="p-2 text-sm font-medium">{field.name}</TableCell>
                      <TableCell className="p-2 text-sm">{field.expectedQty}</TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.recoveredQty` as const}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-8 px-2 text-sm"
                                  value={qtyField.value}
                                  onChange={(event) => qtyField.onChange(event.target.value)}
                                />
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.condition` as const}
                          render={({ field: conditionField }) => (
                            <FormItem>
                              <FormControl>
                                <Select
                                  value={conditionField.value}
                                  onValueChange={conditionField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 px-2 text-sm">
                                      <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Bình thường">Bình thường</SelectItem>
                                    <SelectItem value="Hư hỏng">Hư hỏng</SelectItem>
                                    <SelectItem value="Mất mát">Mất mát</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.note` as const}
                          render={({ field: noteField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Ghi chú..."
                                  className="h-8 px-2 text-sm"
                                  {...noteField}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </form>
        </Form>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <div className="text-xs text-gray-400">
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
          {" "}/
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">S</kbd>
          : Lưu biên bản thu hồi
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="border-red-300 text-red-700">
                <AlertTriangle className="size-4" />
                Hủy biên bản
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận hủy biên bản?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn hủy biên bản thu hồi. Hợp đồng sẽ được giữ lại để xử lý sau.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Quay lại</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={onReject}
                >
                  Xác nhận hủy
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" form="recovery-form" className="bg-emerald-600 hover:bg-emerald-700">
            <ClipboardCheck className="size-4" />
            Lưu biên bản thu hồi
          </Button>
        </div>
      </footer>
    </section>
  );
}
