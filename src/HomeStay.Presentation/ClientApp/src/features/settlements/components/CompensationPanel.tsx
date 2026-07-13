import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, ClipboardList, Eye, Loader2 } from "lucide-react";
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
import { cn } from "@/shared/lib/utils";
import {
  createHoaDonBoiThuong,
  formatCurrencyVnd,
  formatDateVi,
  loadChiTietBienBan,
  proofFileName,
  type ChiTietBienBanThuHoi,
  type LapHoaDonBoiThuongResult,
} from "@/features/settlements/services/compensation-invoice-service";

const itemSchema = z.object({
  maTS: z.string(),
  tenTaiSan: z.string(),
  tinhTrang: z.string(),
  soLuong: z.number().positive(),
  ghiChu: z.string().optional(),
  minhChung: z.string().optional(),
  donGia: z
    .string()
    .min(1, "Vui lòng nhập số tiền phạt hợp lệ")
    .regex(/^\d+(\.\d+)?$/, "Vui lòng nhập số tiền phạt hợp lệ")
    .refine((v) => Number(v) >= 0, "Vui lòng nhập số tiền phạt hợp lệ"),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "Vui lòng nhập số tiền phạt hợp lệ"),
});

type FormValues = z.infer<typeof formSchema>;

export function CompensationPanel({
  maBienBan,
  onIssued,
}: {
  maBienBan: string | null;
  onIssued?: () => void;
}) {
  const [detail, setDetail] = useState<ChiTietBienBanThuHoi | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState<LapHoaDonBoiThuongResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { items: [] },
    mode: "onChange",
  });

  const { fields } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");
  const total = watchedItems.reduce(
    (sum, i) => sum + (i.soLuong ?? 0) * Number(i.donGia || 0),
    0,
  );

  useEffect(() => {
    if (!maBienBan) {
      setDetail(null);
      setLoadError(null);
      form.reset({ items: [] });
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    setIssued(null);

    loadChiTietBienBan(maBienBan, controller.signal)
      .then((data) => {
        setDetail(data);
        form.reset({
          items: data.taiSanHuHong.map((i) => ({
            maTS: i.maTS,
            tenTaiSan: i.tenTaiSan,
            tinhTrang: i.tinhTrang,
            soLuong: i.soLuong,
            ghiChu: i.ghiChu ?? "",
            minhChung: i.minhChung ?? "",
            donGia: i.giaTriGoiY != null ? String(Math.round(i.giaTriGoiY)) : "",
          })),
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Không thể tải chi tiết biên bản.";
        setLoadError(message);
        setDetail(null);
        form.reset({ items: [] });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [maBienBan, form]);

  const handleIssue = async (data: FormValues) => {
    if (!maBienBan || !detail) return;
    setSubmitting(true);
    try {
      const result = await createHoaDonBoiThuong(
        maBienBan,
        data.items.map((i) => ({
          maTS: i.maTS,
          soLuong: i.soLuong,
          donGia: Number(i.donGia),
        })),
      );
      setIssued(result);
      toast.success("Lập hóa đơn bồi thường thành công", {
        description: `${result.maHoaDon} — ${formatCurrencyVnd(result.tongTien)}`,
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      });
      onIssued?.();
    } catch (err) {
      toast.error("Không thể lập hóa đơn bồi thường", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!maBienBan) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">
            Chọn một biên bản thu hồi bên trái để lập hóa đơn bồi thường.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
        <Loader2 className="size-6 animate-spin text-rose-500" />
      </section>
    );
  }

  if (loadError || !detail) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-2 size-8 text-amber-400" />
          <p className="text-sm font-medium text-gray-600">
            {loadError ?? "Không tìm thấy biên bản thu hồi."}
          </p>
        </div>
      </section>
    );
  }

  const phongLabel = detail.toaNha
    ? `${detail.toaNha} - ${detail.soPhong}`
    : detail.soPhong;

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50">
      <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-rose-700">
              {detail.maBienBan}
            </span>
            <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700">
              Chưa lập hóa đơn
            </Badge>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {detail.tenKhachHang}
            <span className="ml-2 font-normal text-gray-400">·</span>
            <span className="ml-2 font-normal text-gray-500">{phongLabel}</span>
            <span className="ml-2 font-normal text-gray-400">·</span>
            <span className="ml-2 font-mono font-normal text-gray-500">{detail.maHD}</span>
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-600">
            Tổng bồi thường dự kiến
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold text-rose-700">
            {formatCurrencyVnd(total)}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardList className="size-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-900">Thông tin biên bản thu hồi</h3>
              <span className="ml-auto font-mono text-[11px] text-gray-400">
                {detail.maBienBan}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
              <InfoField label="Mã biên bản" value={detail.maBienBan} mono />
              <InfoField label="Ngày thu hồi" value={formatDateVi(detail.ngayBanGiao)} />
              <InfoField label="Hợp đồng" value={detail.maHD} mono />
              <InfoField label="Khách hàng" value={detail.tenKhachHang} />
              <InfoField label="Phòng" value={phongLabel} mono />
              <InfoField
                label="Người lập biên bản"
                value={detail.tenNguoiLap ?? "—"}
                className="md:col-span-2"
              />
            </div>
          </section>

          <Form {...form}>
            <form id="compensation-form" onSubmit={form.handleSubmit(handleIssue)}>
              <section className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      Danh sách lỗi cần bồi thường
                    </h3>
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
                      <TableHead className="w-28 px-3 py-2.5 text-center text-xs">
                        Minh chứng
                      </TableHead>
                      <TableHead className="w-44 px-4 py-2.5 text-right text-xs">
                        Số tiền phạt *
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const item = watchedItems[index];
                      const file = proofFileName(item?.minhChung);
                      return (
                        <TableRow key={field.id} className="hover:bg-gray-50/40">
                          <TableCell className="px-4 py-4 text-xs text-gray-400">
                            {index + 1}
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {item?.tenTaiSan}
                            </span>
                            <p className="font-mono text-[11px] text-gray-400">{item?.maTS}</p>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <ViolationBadge tinhTrang={item?.tinhTrang} />
                          </TableCell>
                          <TableCell className="px-3 py-4 text-sm text-gray-600">
                            {item?.ghiChu || item?.tinhTrang || "—"}
                          </TableCell>
                          <TableCell className="px-3 py-4 text-center">
                            {file ? (
                              <a
                                href={`/api/asset-recovery/proofs/${encodeURIComponent(file)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                              >
                                <Eye className="size-3" />
                                Xem ảnh
                              </a>
                            ) : (
                              <span className="text-[11px] text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.donGia`}
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
                    {formatCurrencyVnd(total)}
                  </span>
                </div>
              </section>
            </form>
          </Form>
        </div>
      </div>

      <footer className="sticky bottom-0 flex min-h-16 items-center justify-end gap-2 border-t border-gray-200 bg-white px-5 py-3">
        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={() => form.reset()}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          form="compensation-form"
          className="h-9 bg-rose-600 hover:bg-rose-700"
          disabled={!form.formState.isValid || fields.length === 0 || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang lập...
            </>
          ) : (
            "Lập hóa đơn bồi thường"
          )}
        </Button>
      </footer>

      <SuccessDialog
        invoice={issued}
        maBienBan={detail.maBienBan}
        onClose={() => setIssued(null)}
      />
    </section>
  );
}

function ViolationBadge({ tinhTrang }: { tinhTrang?: string }) {
  const isLost = tinhTrang?.includes("Mất");
  if (isLost) {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
        Mất mát
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
  maBienBan,
  onClose,
}: {
  invoice: LapHoaDonBoiThuongResult | null;
  maBienBan: string;
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
            Hóa đơn{" "}
            <span className="font-semibold text-rose-700">{invoice.maHoaDon}</span> đã được tạo
            với trạng thái{" "}
            <span className="font-semibold text-amber-700">&quot;Chưa thanh toán&quot;</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Mã hóa đơn</span>
            <span className="font-mono font-semibold text-rose-700">{invoice.maHoaDon}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Biên bản thu hồi</span>
            <span className="font-mono font-semibold text-gray-800">{maBienBan}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Khách hàng</span>
            <span className="font-medium text-gray-900">{invoice.tenKhachHang}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Tổng bồi thường</span>
            <span className="font-mono font-bold text-rose-700">
              {formatCurrencyVnd(invoice.tongTien)}
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
