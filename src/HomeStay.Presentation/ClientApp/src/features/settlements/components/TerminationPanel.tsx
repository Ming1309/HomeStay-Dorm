import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Loader2,
  Wallet,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/shared/ui/form";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import {
  formatCurrencyVnd,
  formatDateVi,
  formatPhong,
  loadChiTietThanhLy,
  thanhLyHopDong,
  type ChiTietThanhLyHopDong,
  type ThanhLyHopDongResult,
} from "@/features/settlements/services/termination-service";

const formSchema = z
  .object({
    confirmations: z.object({
      liquidationSigned: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
      keysRecovered: z.boolean().refine((v) => v === true, "Bắt buộc xác nhận"),
    }),
  })
  .refine(
    (data) =>
      data.confirmations.liquidationSigned &&
      data.confirmations.keysRecovered,
    {
      message: "Cần xác nhận khách đã ký biên bản và trả lại chìa khóa/thẻ",
      path: ["confirmations"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const CONFIRMATION_ITEMS: Array<{
  key: keyof FormValues["confirmations"];
  label: string;
  hint: string;
}> = [
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

export function TerminationPanel({
  maHD,
  onTerminated,
}: {
  maHD: string | null;
  onTerminated?: () => void;
}) {
  const [detail, setDetail] = useState<ChiTietThanhLyHopDong | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [issued, setIssued] = useState<ThanhLyHopDongResult | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmations: {
        liquidationSigned: false,
        keysRecovered: false,
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!maHD) {
      setDetail(null);
      setLoadError(null);
      form.reset({
        confirmations: {
          liquidationSigned: false,
          keysRecovered: false,
        },
      });
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    form.reset({
      confirmations: {
        liquidationSigned: false,
        keysRecovered: false,
      },
    });

    void loadChiTietThanhLy(maHD, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setDetail(data);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setDetail(null);
        setLoadError(err instanceof Error ? err.message : "Không thể tải chi tiết hợp đồng.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [maHD, form]);

  const allChecked = form.watch("confirmations");
  const checkedCount = Object.values(allChecked).filter(Boolean).length;
  const systemReady = Boolean(detail?.coTheThanhLy);
  const canSubmit = form.formState.isValid && systemReady && !submitting && !!detail;
  const disabledReason = !detail
    ? "Đang tải dữ liệu hợp đồng..."
    : !systemReady
      ? (detail.lyDoChan ??
        "Vui lòng yêu cầu khách hàng thanh toán dứt điểm công nợ trước khi thanh lý")
      : "Vui lòng hoàn tất các điều kiện xác nhận trước khi thanh lý hợp đồng.";

  const handleConfirm = (data: FormValues) => {
    setPendingConfirm(data);
  };

  const finalizeTermination = async () => {
    if (!pendingConfirm || !detail) return;
    setSubmitting(true);
    try {
      const result = await thanhLyHopDong(detail.maHD, pendingConfirm.confirmations);
      setIssued(result);
      setPendingConfirm(null);
      toast.success(`Đã thanh lý hợp đồng ${result.maHD}.`, {
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      });
      onTerminated?.();
    } catch (err) {
      toast.error("Không thể thanh lý hợp đồng", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!maHD) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Chọn hợp đồng để thanh lý.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <Loader2 className="size-6 animate-spin text-slate-500" />
      </section>
    );
  }

  if (loadError || !detail) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-rose-600">{loadError ?? "Không có dữ liệu hợp đồng."}</p>
      </section>
    );
  }

  const phong = formatPhong(detail.toaNha, detail.soPhong);
  const refundRatePct = Math.round(detail.tyLeHoanCoc * 100);
  const baseRefund = detail.tienCoc * detail.tyLeHoanCoc;

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{detail.maHD}</h1>
          <Badge
            className={cn(
              "h-5 text-[10px]",
              detail.coTheThanhLy
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700",
            )}
          >
            {detail.coTheThanhLy ? "Sẵn sàng thanh lý" : "Còn công nợ"}
          </Badge>
          <span className="text-xs text-gray-500">
            {detail.tenKhachHang} • {phong}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">TRẠNG THÁI HỢP ĐỒNG</p>
          <p className="font-mono text-sm font-bold text-slate-700">Đang hiệu lực</p>
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
                <Info label="Mã hợp đồng" value={detail.maHD} mono />
                <Info label="Khách hàng" value={detail.tenKhachHang} />
                <Info label="Phòng/Giường" value={phong} mono />
                <Info label="Số điện thoại" value={detail.sdt ?? "—"} mono />
                <Info label="Ngày bắt đầu" value={formatDateVi(detail.ngayBatDau)} />
                <Info label="Ngày kết thúc" value={formatDateVi(detail.ngayKetThuc)} />
              </div>
              {detail.giuongs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {detail.giuongs.map((g) => (
                    <Badge
                      key={g.maGiuong}
                      className="h-5 bg-gray-100 font-mono text-[10px] text-gray-700 hover:bg-gray-100"
                    >
                      {g.soGiuong} ({g.maGiuong})
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Card className="rounded-lg border border-slate-200 bg-slate-50/60">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Coins className="size-4 text-gray-600" />
                  <h3 className="text-xs font-semibold text-gray-700">Kết quả đối soát đã chốt</h3>
                  <span className="ml-auto font-mono text-[10px] font-medium text-gray-500">
                    {detail.maPDS} • {refundRatePct}%
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Kết quả đã được Quản lý xác nhận với khách hàng và chỉ hiển thị để đối chiếu
                  trước khi thanh lý.
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <h4 className="mb-3 text-[11px] font-semibold text-gray-700">Kết quả đối soát</h4>
                    <div className="space-y-2 text-sm">
                      <SummaryRow
                        label="Tiền cọc ban đầu"
                        value={formatCurrencyVnd(detail.tienCoc)}
                        icon={<Wallet className="size-3" />}
                      />
                      <SummaryRow
                        label="Tổng khấu trừ"
                        value={formatCurrencyVnd(detail.tongKhauTru)}
                        tone={detail.tongKhauTru > 0 ? "warn" : "muted"}
                      />
                      <SummaryRow
                        label="Tiền hoàn cơ bản"
                        value={formatCurrencyVnd(baseRefund)}
                        hint={`${refundRatePct}% cọc`}
                      />
                      <SummaryRow
                        label="Tiền hoàn thực tế"
                        value={formatCurrencyVnd(detail.tienHoan)}
                        tone={detail.tienHoan > 0 ? "ok" : "muted"}
                      />
                      <SummaryRow
                        label="Tiền thu thêm"
                        value={formatCurrencyVnd(detail.tienThuThem)}
                        tone={detail.tienThuThem > 0 ? "warn" : "muted"}
                      />
                    </div>
                  </div>
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <h4 className="mb-3 text-[11px] font-semibold text-gray-700">Trạng thái công nợ</h4>
                    <SystemState
                      ok={detail.coTheThanhLy}
                      label={
                        detail.coTheThanhLy
                          ? detail.tienHoan > 0
                            ? "Khách được hoàn cọc — đủ điều kiện thanh lý"
                            : "Hòa vốn / đã tất toán — đủ điều kiện thanh lý"
                          : "Khách còn nợ tiền — chưa thể thanh lý"
                      }
                    />
                    {!detail.coTheThanhLy && detail.lyDoChan && (
                      <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                        {detail.lyDoChan}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                          className={cn(
                            "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 transition-colors",
                            field.value
                              ? "border-emerald-300 bg-emerald-50/60"
                              : "border-gray-200 bg-white hover:border-gray-300",
                          )}
                        >
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={(v) => field.onChange(v === true)}
                              className="mt-0.5"
                              disabled={!systemReady}
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
                    "Cần xác nhận khách đã ký biên bản và trả lại chìa khóa/thẻ."}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-700">Trạng thái hệ thống</h3>
              <div className="space-y-2 text-sm">
                <SystemState ok label={`Phiếu đối soát ${detail.maPDS} đã chốt`} />
                <SystemState
                  ok={detail.coTheThanhLy}
                  label={
                    detail.coTheThanhLy
                      ? "Nghĩa vụ tài chính đã hoàn tất"
                      : "Khách còn công nợ chưa thanh toán"
                  }
                />
              </div>
            </div>
          </form>
        </Form>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <div className="text-xs text-gray-400">
          <span className="font-mono text-[10px] text-gray-400">
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
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ClipboardCheck className="size-3.5" />
            )}
            Thanh lý hợp đồng
          </Button>
        </div>
        {!canSubmit && (
          <p className="absolute bottom-14 right-5 max-w-sm rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 shadow-sm">
            {disabledReason}
          </p>
        )}
      </footer>

      <Dialog open={!!pendingConfirm} onOpenChange={(o) => !o && !submitting && setPendingConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh lý hợp đồng?</DialogTitle>
            <DialogDescription>
              Hệ thống sẽ cập nhật hợp đồng {detail.maHD} sang trạng thái ‘Đã thanh lý’, chuyển
              giường về trạng thái trống và ghi nhận khách đã trả phòng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-8 text-xs"
              disabled={submitting}
              onClick={() => setPendingConfirm(null)}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              className="h-8 bg-slate-700 text-xs hover:bg-slate-800"
              disabled={submitting}
              onClick={() => void finalizeTermination()}
            >
              {submitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Xác nhận thanh lý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        result={issued}
        customerName={detail.tenKhachHang}
        onClose={() => setIssued(null)}
      />
    </section>
  );
}

function SystemState({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={ok ? "flex items-center gap-2 text-emerald-700" : "flex items-center gap-2 text-amber-700"}>
      {ok ? <Check className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
      <span>{label}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn" | "muted";
  icon?: ReactNode;
}) {
  const toneClass =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-gray-800";
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="flex items-center gap-1 text-xs text-gray-500">
        {icon}
        {label}
      </span>
      <div className="text-right">
        <p className={cn("font-mono text-xs font-semibold", toneClass)}>{value}</p>
        {hint ? <p className="text-[10px] text-gray-400">{hint}</p> : null}
      </div>
    </div>
  );
}

function SuccessDialog({
  result,
  customerName,
  onClose,
}: {
  result: ThanhLyHopDongResult | null;
  customerName: string;
  onClose: () => void;
}) {
  if (!result) return null;

  return (
    <Dialog open={!!result} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thanh lý hợp đồng thành công</DialogTitle>
          <DialogDescription>Hợp đồng đã được đóng và giường đã giải phóng.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <Info label="Hợp đồng" value={result.maHD} mono />
          <Info label="Khách hàng" value={customerName} />
          <Info label="Ngày thanh lý" value={formatDateVi(result.ngayThanhLy)} />
          <Info label="Phiếu đối soát" value={result.maPDS} mono />
          <Info
            label={result.tienHoan > 0 ? "Số tiền hoàn" : "Số tiền thu thêm"}
            value={formatCurrencyVnd(result.tienHoan > 0 ? result.tienHoan : result.tienThuThem)}
          />
          {result.tienHoan > 0 && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] text-emerald-800">
              Đã gửi thông báo cho Kế toán để thực hiện hoàn cọc.
            </p>
          )}
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
