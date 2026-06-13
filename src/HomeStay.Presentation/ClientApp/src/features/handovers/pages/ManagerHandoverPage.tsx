import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Search } from "lucide-react";
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
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";



type HandoverContract = {
  id: string;
  customerName: string;
  room: string;
  status: "pending_handover";
  assets: Array<{ id: string; name: string; expectedQty: number }>;
};

const mockHandoverContracts: HandoverContract[] = [
  {
    id: "HD-PC013",
    customerName: "Trần Hoàng Nam",
    room: "P.203",
    status: "pending_handover",
    assets: [
      { id: "a1", name: "Giường", expectedQty: 1 },
      { id: "a2", name: "Nệm", expectedQty: 1 },
      { id: "a3", name: "Tủ lạnh", expectedQty: 1 },
      { id: "a4", name: "Chìa khóa", expectedQty: 2 },
      { id: "a5", name: "Thẻ từ", expectedQty: 2 },
    ],
  },
  {
    id: "HD-PC014",
    customerName: "Lê Thảo Vy",
    room: "P.305",
    status: "pending_handover",
    assets: [
      { id: "b1", name: "Giường", expectedQty: 2 },
      { id: "b2", name: "Nệm", expectedQty: 2 },
      { id: "b3", name: "Tủ lạnh", expectedQty: 1 },
      { id: "b4", name: "Chìa khóa", expectedQty: 3 },
      { id: "b5", name: "Thẻ từ", expectedQty: 2 },
    ],
  },
];

const schema = z.object({
  assets: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      expectedQty: z.coerce.number().min(0),
      actualQty: z.coerce.number().min(0),
      condition: z.string().min(1, "Chọn tình trạng"),
      note: z.string().optional(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

export function ManagerHandoverPage() {

  const [items, setItems] = useState<HandoverContract[]>(mockHandoverContracts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q),
    );
  }, [items, query]);
  const selected = filtered.find((item) => item.id === selectedId) ?? null;



  return (
      <div className="flex h-full overflow-hidden">
        <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-800">Chờ bàn giao</h2>
            <p className="mt-0.5 text-xs text-gray-400">{filtered.length} hợp đồng chờ bàn giao</p>
          </div>
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm hợp đồng..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                      selectedId === item.id && "border-l-amber-500 bg-amber-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{item.id}</span>
                      <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">
                        Chờ bàn giao
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.customerName}</p>
                    <p className="font-mono text-xs text-gray-500">{item.room}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {!selected ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn hợp đồng để chốt biên bản bàn giao.</p>
          </section>
        ) : (
          <HandoverForm
            contract={selected}
            onDone={() => {
              setItems((current) => current.filter((c) => c.id !== selected.id));
              setSelectedId(null);
              toast.success("Chốt bàn giao thành công. Hợp đồng chuyển sang Đang hiệu lực.", {
                icon: <CheckCircle2 className="size-4 text-emerald-600" />,
              });
            }}
            onReject={() => {
              setItems((current) => current.filter((c) => c.id !== selected.id));
              setSelectedId(null);
              toast.success("Đã hủy bàn giao. Hợp đồng tạm dừng.");
            }}
          />
        )}
      </div>
  );
}

function HandoverForm({
  contract,
  onDone,
  onReject,
}: {
  contract: HandoverContract;
  onDone: () => void;
  onReject: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assets: contract.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        expectedQty: asset.expectedQty,
        actualQty: asset.expectedQty,
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
        actualQty: asset.expectedQty,
        condition: "Bình thường",
        note: "",
      })),
    });
  }, [contract, form]);

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{contract.id}</h1>
          <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">Chờ bàn giao</Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {contract.customerName} • {contract.room}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Form {...form}>
          <form id="handover-form" onSubmit={form.handleSubmit(onDone)}>
            <div className="rounded-lg border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2 text-xs">STT</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Tên tài sản</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Số lượng chuẩn</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Số lượng thực tế</TableHead>
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
                          name={`assets.${index}.actualQty`}
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
                          name={`assets.${index}.condition`}
                          render={({ field: conditionField }) => (
                            <FormItem>
                              <Select
                                value={conditionField.value}
                                onValueChange={conditionField.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 px-2 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Mới">Mới</SelectItem>
                                  <SelectItem value="Bình thường">Bình thường</SelectItem>
                                  <SelectItem value="Hỏng">Hỏng</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.note`}
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
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            S
          </kbd>{" "}
          : Chốt bàn giao
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="border-red-300 text-red-700">
                <AlertTriangle className="size-4" />
                Khách từ chối nhận phòng
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận hủy bàn giao?</AlertDialogTitle>
                <AlertDialogDescription>
                  Xác nhận hủy bàn giao do tài sản hư hỏng hoặc khách không đồng ý? Hợp đồng sẽ bị
                  tạm dừng.
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
          <Button
            type="submit"
            form="handover-form"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <ClipboardCheck className="size-4" />
            Chốt biên bản bàn giao
          </Button>
        </div>
      </footer>
    </section>
  );
}
