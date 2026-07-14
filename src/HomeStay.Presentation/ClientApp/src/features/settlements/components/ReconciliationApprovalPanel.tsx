import { useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  confirmReconciliationApproval,
  ReconciliationApprovalApiError,
  type ReconciliationApprovalDetail,
  type ReconciliationResultType,
} from "@/features/settlements/services/reconciliation-approval-service";
import { cn } from "@/shared/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const formSchema = z.object({
  khachHangDongY: z.boolean().refine((value) => value, "Cần xác nhận khách hàng đã đồng ý."),
});

type FormValues = z.infer<typeof formSchema>;

const resultMeta: Record<
  ReconciliationResultType,
  { label: string; badge: string; value: string }
> = {
  Hoan: {
    label: "Hoàn khách",
    badge: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    value: "text-emerald-700",
  },
  ThuThem: {
    label: "Thu thêm",
    badge: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    value: "text-orange-700",
  },
  HoaVon: {
    label: "Hòa vốn",
    badge: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    value: "text-slate-700",
  },
};

const money = (value: number) =>
  Number.isFinite(value) ? `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ` : "—";

const percentage = (value: number) =>
  Number.isFinite(value)
    ? `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value * 100)}%`
    : "—";

export function ReconciliationApprovalPanel({
  detail,
  loading,
  error,
  onRetry,
  onConfirmed,
  onConflict,
}: {
  detail: ReconciliationApprovalDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onConfirmed: () => Promise<void>;
  onConflict: () => Promise<void>;
}) {
  if (loading) {
    return (
      <WorkspaceState
        icon={<Loader2 className="size-6 animate-spin" />}
        message="Đang tải chi tiết đối soát..."
      />
    );
  }

  if (error) {
    return (
      <WorkspaceState
        icon={<AlertTriangle className="size-6 text-red-600" />}
        message={error}
        action={
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Tải lại
          </Button>
        }
      />
    );
  }

  if (!detail) {
    return <WorkspaceState message="Chọn phiếu đối soát trong hàng đợi để bắt đầu xác nhận." />;
  }

  return (
    <ApprovalForm
      key={detail.maPDS}
      detail={detail}
      onConfirmed={onConfirmed}
      onConflict={onConflict}
    />
  );
}

function ApprovalForm({
  detail,
  onConfirmed,
  onConflict,
}: {
  detail: ReconciliationApprovalDetail;
  onConfirmed: () => Promise<void>;
  onConflict: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const result = resultMeta[detail.loaiKetQua];
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { khachHangDongY: false },
  });
  const hasContact = Boolean(detail.soDienThoai.trim() || detail.email.trim());
  const canConfirm = detail.duDieuKienXacNhan && hasContact;
  const watchedAgreement = form.watch("khachHangDongY");
  const calculatedBalance = detail.tienHoanCoBan - detail.tongKhauTru;

  const openConfirmation = form.handleSubmit(() => {
    if (canConfirm && !isSubmitting) setConfirmOpen(true);
  });

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter" && canConfirm && !isSubmitting) {
        event.preventDefault();
        void openConfirmation();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [canConfirm, isSubmitting, openConfirmation]);

  const submit = form.handleSubmit(async () => {
    if (!canConfirm || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await confirmReconciliationApproval(detail.maPDS, {
        khachHangDongY: true,
      });
      toast.success("Đã xác nhận kết quả đối soát", {
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      });
      setConfirmOpen(false);
      await onConfirmed();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Không thể xác nhận phiếu đối soát.";
      toast.error(message);
      if (caught instanceof ReconciliationApprovalApiError && caught.status === 409) {
        setConfirmOpen(false);
        await onConflict();
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const confirmationText = useMemo(() => {
    if (detail.loaiKetQua === "Hoan") return `hoàn ${money(detail.soTienKetQua)} cho khách`;
    if (detail.loaiKetQua === "ThuThem") return `thu thêm ${money(detail.soTienKetQua)} từ khách`;
    return "không phát sinh khoản hoàn hoặc thu thêm";
  }, [detail.loaiKetQua, detail.soTienKetQua]);

  return (
    <form
      onSubmit={openConfirmation}
      className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50/60"
    >
      <header className="shrink-0 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="font-mono text-base text-gray-950">{detail.maPDS}</strong>
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Chờ xác nhận</Badge>
          <span className="text-xs text-gray-500">· {detail.maHD ?? detail.maPhieuCoc}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-semibold text-gray-900">{detail.tenKhachHang}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-600">{detail.phong}</span>
          <span className="text-gray-300">•</span>
          <Badge className={cn("text-[10px]", result.badge)}>{result.label}</Badge>
          <span className={cn("font-semibold tabular-nums", result.value)}>
            {money(detail.soTienKetQua)}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <section className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid xl:grid-cols-12">
            <section className="px-5 py-4 xl:col-span-5">
              <div className="mb-4 flex items-center gap-2">
                <User className="size-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900">Khách hàng cần thông báo</h2>
              </div>
              <dl className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
                <Definition label="Họ tên" value={detail.tenKhachHang} />
                <Definition
                  label="Số điện thoại"
                  value={detail.soDienThoai || "Chưa cung cấp"}
                  href={detail.soDienThoai ? `tel:${detail.soDienThoai}` : undefined}
                  icon={<Phone className="size-3.5" />}
                />
                <Definition
                  label="Email"
                  value={detail.email || "Chưa cung cấp"}
                  href={detail.email ? `mailto:${detail.email}` : undefined}
                  icon={<Mail className="size-3.5" />}
                />
                <Definition
                  label="Phòng"
                  value={detail.phong}
                  icon={<MapPin className="size-3.5" />}
                />
                <Definition label="Phiếu cọc" value={detail.maPhieuCoc} mono />
                <Definition
                  label="Hợp đồng"
                  value={detail.maHD ?? "Chưa ký hợp đồng"}
                  mono={Boolean(detail.maHD)}
                />
                <Definition label="Số giấy tờ" value={detail.soGiayTo || "Chưa cung cấp"} />
                <Definition
                  label="Ngày đối soát"
                  value={new Date(detail.ngayDoiSoat).toLocaleDateString("vi-VN")}
                />
              </dl>
            </section>

            <section className="border-t border-gray-200 px-5 py-4 xl:col-span-7 xl:border-l xl:border-t-0">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="size-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900">Kết quả Kế toán đề xuất</h2>
              </div>
              <div className="overflow-hidden rounded-md border border-gray-200">
                <table className="w-full text-sm">
                  <tbody>
                    <FinancialRow label="Tiền cọc" value={money(detail.soTienCoc)} />
                    <FinancialRow label="Tỷ lệ hoàn cọc" value={percentage(detail.tyLeHoanCoc)} />
                    <FinancialRow label="Hoàn cơ bản" value={money(detail.tienHoanCoBan)} />
                    <FinancialRow label="Tổng khấu trừ" value={`− ${money(detail.tongKhauTru)}`} />
                    <FinancialRow
                      label={result.label}
                      value={money(detail.soTienKetQua)}
                      emphasized
                      tone={detail.loaiKetQua}
                    />
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {money(detail.soTienCoc)} × {percentage(detail.tyLeHoanCoc)} −{" "}
                {money(detail.tongKhauTru)} = {money(calculatedBalance)}
              </p>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-700">Hóa đơn khấu trừ</h3>
                  <span className="text-[11px] text-gray-500">{detail.hoaDons.length} hóa đơn</span>
                </div>
                {detail.hoaDons.length === 0 ? (
                  <p className="text-xs text-gray-500">Không có hóa đơn khấu trừ.</p>
                ) : (
                  <div className="overflow-hidden rounded-md border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Hóa đơn</th>
                          <th className="px-3 py-2 text-left font-medium">Loại</th>
                          <th className="px-3 py-2 text-left font-medium">Ngày lập</th>
                          <th className="px-3 py-2 text-right font-medium">Số tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.hoaDons.map((invoice) => (
                          <tr key={invoice.maHoaDon} className="border-t border-gray-100">
                            <td className="px-3 py-2 font-mono font-medium text-blue-700">
                              {invoice.maHoaDon}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{invoice.loaiHoaDon}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {new Date(invoice.ngayLap).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums">
                              {money(invoice.tongTien)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {detail.ghiChu && (
                <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3 text-sm">
                  <span className="shrink-0 text-xs font-medium text-gray-500">
                    Ghi chú Kế toán
                  </span>
                  <span className="text-gray-800">{detail.ghiChu}</span>
                </div>
              )}
            </section>
          </div>

          <section className="border-t border-gray-200 px-5 py-4">
            {!canConfirm && (
              <div className="mb-3 flex items-start gap-2 border-l-2 border-red-500 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>
                  {detail.lyDoKhongDuDieuKien ||
                    "Yêu cầu Sale cập nhật thông tin khách hàng trước khi xác nhận."}
                </span>
              </div>
            )}
            <label
              className={cn(
                "flex items-start gap-2 border-l-2 px-3 py-2.5 text-sm",
                canConfirm
                  ? "border-amber-400 bg-amber-50"
                  : "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-500",
              )}
            >
              <input
                type="checkbox"
                className="mt-1"
                disabled={!canConfirm || isSubmitting}
                {...form.register("khachHangDongY")}
              />
              <span>
                Tôi xác nhận đã liên hệ <strong>{detail.tenKhachHang}</strong> qua thông tin trên,
                thông báo kết quả và khách hàng đồng ý.
              </span>
            </label>
            {form.formState.errors.khachHangDongY && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.khachHangDongY.message}
              </p>
            )}
          </section>
        </section>
      </main>

      <footer className="flex min-h-14 shrink-0 items-center justify-between border-t border-gray-200 bg-white px-5 py-2 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <span className="text-xs text-gray-400">
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd> : Xác nhận
        </span>
        <Button
          type="button"
          className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700"
          disabled={!canConfirm || !watchedAgreement || isSubmitting}
          onClick={() => void openConfirmation()}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Xác nhận khách đã đồng ý
        </Button>
      </footer>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => !isSubmitting && setConfirmOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận kết quả đối soát?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn xác nhận đã thông báo cho <strong>{detail.tenKhachHang}</strong> và khách đồng ý
              với kết quả: <strong>{confirmationText}</strong>. Phiếu sẽ chuyển sang bước nghiệp vụ
              tiếp theo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

function WorkspaceState({
  icon,
  message,
  action,
}: {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center text-sm text-gray-500">
      {icon}
      <p className="max-w-md">{message}</p>
      {action}
    </section>
  );
}

function Definition({
  label,
  value,
  href,
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  href?: string;
  icon?: ReactNode;
  mono?: boolean;
}) {
  const content = (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1.5 break-all font-medium text-gray-900",
        mono && "font-mono",
      )}
    >
      {icon}
      {value}
    </span>
  );
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd>
        {href ? (
          <a className="text-blue-700 hover:underline" href={href}>
            {content}
          </a>
        ) : (
          content
        )}
      </dd>
    </>
  );
}

function FinancialRow({
  label,
  value,
  emphasized = false,
  tone = "HoaVon",
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  tone?: ReconciliationResultType;
}) {
  return (
    <tr
      className={cn(
        "border-b border-gray-100 last:border-0",
        emphasized && tone === "Hoan" && "bg-emerald-50",
        emphasized && tone === "ThuThem" && "bg-orange-50",
        emphasized && tone === "HoaVon" && "bg-slate-50",
      )}
    >
      <td className={cn("px-4 py-2 text-gray-600", emphasized && "font-semibold text-gray-950")}>
        {label}
      </td>
      <td
        className={cn(
          "px-4 py-2 text-right font-mono font-semibold tabular-nums",
          emphasized && "text-base",
          emphasized && resultMeta[tone].value,
        )}
      >
        {value}
      </td>
    </tr>
  );
}
