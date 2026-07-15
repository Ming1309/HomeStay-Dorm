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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";
import {
  loadHandoverContracts,
  loadHandoverDetail,
  saveHandoverReport,
  cancelHandover,
  type HandoverListItem,
  type HandoverDetail,
} from "../services/handover-service";

const schema = z.object({
  assets: z.array(
    z.object({
      maTS: z.string().min(1),
      tenTaiSan: z.string().min(1),
      soLuongTieuChuan: z.coerce.number().min(0),
      soLuong: z.coerce.number().min(0),
      tinhTrang: z.string().min(1, "Chọn tình trạng"),
      ghiChu: z.string().optional(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

export function ManagerHandoverPage() {
  const [items, setItems] = useState<HandoverListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("maHD"),
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadHandoverContracts(undefined)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.maHD.toLowerCase().includes(q) ||
        item.tenKhachHang.toLowerCase().includes(q) ||
        item.soPhong.toLowerCase().includes(q),
    );
  }, [items, query]);

  const selected = filtered.find((item) => item.maHD === selectedId) ?? null;

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
          {loading ? (
            <p className="p-4 text-xs text-gray-400">Đang tải...</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-xs text-gray-400">Không có hợp đồng chờ bàn giao.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <li key={item.maHD}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.maHD)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                      selectedId === item.maHD && "border-l-amber-500 bg-amber-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{item.maHD}</span>
                      <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">
                        Chờ bàn giao
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.tenKhachHang}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {item.soPhong}
                      {item.toaNha ? ` - ${item.toaNha}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {!selected ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Chọn hợp đồng để chốt biên bản bàn giao.</p>
        </section>
      ) : (
        <HandoverWorkspace
          maHD={selected.maHD}
          customerName={selected.tenKhachHang}
          room={selected.soPhong}
          toaNha={selected.toaNha}
          onDone={() => {
            setItems((current) => current.filter((c) => c.maHD !== selected.maHD));
            setSelectedId(null);
            toast.success("Chốt bàn giao thành công. Hợp đồng chuyển sang Đang hiệu lực.", {
              icon: <CheckCircle2 className="size-4 text-emerald-600" />,
            });
          }}
          onReject={() => {
            cancelHandover(selected.maHD)
              .then(() => {
                toast.success("Đã hủy bàn giao. Hợp đồng tạm dừng.");
              })
              .catch((err: Error) => toast.error(err.message));
          }}
        />
      )}
    </div>
  );
}

function HandoverWorkspace({
  maHD,
  customerName,
  room,
  toaNha,
  onDone,
  onReject,
}: {
  maHD: string;
  customerName: string;
  room: string;
  toaNha: string | null;
  onDone: () => void;
  onReject: () => void;
}) {
  const [detail, setDetail] = useState<HandoverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadHandoverDetail(maHD)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [maHD]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { assets: [] },
  });
  const { fields } = useFieldArray({ control: form.control, name: "assets" });

  useEffect(() => {
    if (detail) {
      form.reset({
        assets: detail.taiSan.map((ts) => ({
          maTS: ts.maTS,
          tenTaiSan: ts.tenTaiSan,
          soLuongTieuChuan: ts.soLuongTieuChuan,
          soLuong: ts.soLuongTieuChuan,
          tinhTrang: "Bình thường",
          ghiChu: "",
        })),
      });
    }
  }, [detail, form]);

  async function handleSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await saveHandoverReport(
        maHD,
        values.assets.map((a) => ({
          maTS: a.maTS,
          soLuong: a.soLuong,
          tinhTrang: a.tinhTrang,
          ghiChu: a.ghiChu || undefined,
        })),
      );
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không thể chốt biên bản.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="flex flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-400">Đang tải chi tiết hợp đồng...</p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{maHD}</h1>
          <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">Chờ bàn giao</Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {customerName} &bull; {room}
          {toaNha ? ` - ${toaNha}` : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Form {...form}>
          <form id="handover-form" onSubmit={form.handleSubmit(handleSubmit)}>
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
                      <TableCell className="p-2 text-sm font-medium">{field.tenTaiSan}</TableCell>
                      <TableCell className="p-2 text-sm">{field.soLuongTieuChuan}</TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.soLuong`}
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
                          name={`assets.${index}.tinhTrang`}
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
                                  <SelectItem value="Hư hỏng">Hư hỏng</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.ghiChu`}
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

      <footer className="sticky bottom-0 flex h-14 items-center justify-end border-t border-gray-200 bg-white px-5">
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
            disabled={submitting}
          >
            <ClipboardCheck className="size-4" />
            {submitting ? "Đang xử lý..." : "Chốt biên bản bàn giao"}
          </Button>
        </div>
      </footer>
    </section>
  );
}
