import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ExternalLink, FileText, FileX2, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  approveDeposit,
  requestDepositSupplement,
  type ReconciliationDetail,
} from "@/features/deposits/services/deposit-reconciliation-service";
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
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";

const supplementSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập lý do yêu cầu bổ sung.")
    .max(500, "Lý do không được vượt quá 500 ký tự."),
});

type SupplementForm = z.infer<typeof supplementSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function ReconciliationPanel({
  deposit,
  onDone,
}: {
  deposit: ReconciliationDetail;
  onDone: () => void;
}) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplementForm>({
    resolver: zodResolver(supplementSchema),
    defaultValues: { reason: "" },
  });

  const proofUrl = deposit.anhMinhChung;
  const isPdf = proofUrl?.toLowerCase().split("?")[0].endsWith(".pdf") ?? false;

  const confirmApproval = async () => {
    setSubmitting(true);
    try {
      const result = await approveDeposit(deposit.maPhieuCoc);
      toast.success(
        `Đặt cọc thành công. Đã tạo Phiếu thu ${result.maPhieuThu} với số tiền ${formatCurrency(result.soTienThu)}.`,
      );
      setApproveOpen(false);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xác nhận khoản tiền cọc.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitSupplement = handleSubmit(async ({ reason }) => {
    setSubmitting(true);
    try {
      await requestDepositSupplement(deposit.maPhieuCoc, reason.trim());
      toast.success(`Đã gửi yêu cầu bổ sung cho phiếu ${deposit.maPhieuCoc}.`);
      setRejectOpen(false);
      reset();
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi yêu cầu bổ sung.");
    } finally {
      setSubmitting(false);
    }
  });

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;
      if (event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        setRejectOpen(true);
      } else if (event.key === "Enter") {
        event.preventDefault();
        setApproveOpen(true);
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const openProof = () => {
    if (!proofUrl) return;
    if (isPdf) window.open(proofUrl, "_blank", "noopener,noreferrer");
    else setPreviewOpen(true);
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{deposit.maPhieuCoc}</h1>
          <Badge className="bg-amber-100 text-amber-700">Chờ đối chiếu</Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {deposit.hoTenKhachHang} • P. {deposit.soPhong}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        <div className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold text-gray-700">Thông tin phiếu cọc</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Mã phiếu" value={deposit.maPhieuCoc} mono />
              <InfoRow label="Khách hàng" value={deposit.hoTenKhachHang} />
              <InfoRow label="Số điện thoại" value={deposit.sdt || "—"} />
              <InfoRow
                label="Phòng"
                value={`P. ${deposit.soPhong}${deposit.toaNha ? ` • ${deposit.toaNha}` : ""}`}
              />
              <InfoRow
                label="Hình thức thuê"
                value={deposit.hinhThucThue === "OGhep" ? "Ở ghép" : "Nguyên phòng"}
              />
              <InfoRow label="Số giường" value={`${deposit.soGiuongThue} giường`} />
              <InfoRow label="Tiền cọc" value={formatCurrency(deposit.tongTien)} />
              <InfoRow
                label="Phương thức"
                value={deposit.phuongThucThanhToan === "ChuyenKhoan" ? "Chuyển khoản" : "Tiền mặt"}
              />
              <InfoRow label="Nhân viên Sale" value={deposit.maNVSale || "—"} mono />
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs font-medium text-gray-500">Giường sẽ được khóa</p>
              <div className="flex flex-wrap gap-2">
                {deposit.giuongs.map((bed) => (
                  <Badge key={bed.maGiuong} variant="outline" className="font-mono text-xs">
                    {bed.soGiuong} • {bed.trangThai === "GiuCho" ? "Giữ chỗ" : bed.trangThai}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <ImageIcon className="size-3.5" />
              Chứng từ thanh toán
            </h2>
            {proofUrl ? (
              <button
                type="button"
                onClick={openProof}
                className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-gray-50">
                  {isPdf ? (
                    <FileText className="size-7 text-red-500" />
                  ) : (
                    <img
                      src={proofUrl}
                      alt="Chứng từ thanh toán"
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {isPdf ? "Chứng từ PDF" : "Ảnh chứng từ thanh toán"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Nhấp để {isPdf ? "mở tệp" : "xem ảnh kích thước lớn"}
                  </p>
                </div>
                <ExternalLink className="size-4 text-gray-400" />
              </button>
            ) : (
              <div className="rounded-lg border border-dashed border-red-300 bg-red-50 p-8 text-center text-xs text-red-600">
                Phiếu cọc không có chứng từ thanh toán.
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="sticky bottom-0 flex min-h-14 items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-2 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <span className="text-xs text-gray-400">Ctrl+Enter: xác nhận • Ctrl+Shift+R: bổ sung</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 border-red-300 text-xs text-red-700 hover:bg-red-50"
            disabled={submitting}
            onClick={() => setRejectOpen(true)}
          >
            <FileX2 className="mr-1 size-3.5" />
            Yêu cầu bổ sung
          </Button>
          <Button
            type="button"
            className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700"
            disabled={submitting || !proofUrl}
            onClick={() => setApproveOpen(true)}
          >
            <CheckCircle2 className="mr-1 size-3.5" />
            Xác nhận hợp lệ
          </Button>
        </div>
      </footer>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khoản tiền cọc?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ chốt phiếu, tạo Phiếu thu và chuyển {deposit.giuongs.length} giường sang
              trạng thái Đã cọc. Thao tác này không thể hoàn tác tại màn hình này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={(event) => {
                event.preventDefault();
                void confirmApproval();
              }}
            >
              {submitting ? "Đang xử lý..." : "Xác nhận hợp lệ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) reset();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yêu cầu bổ sung chứng từ</AlertDialogTitle>
            <AlertDialogDescription>
              Lý do sẽ hiển thị cho Nhân viên Sale phụ trách để cập nhật lại thanh toán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            {...register("reason")}
            placeholder="Ví dụ: Số tiền trên chứng từ không khớp với phiếu cọc..."
            className="min-h-[100px] text-sm"
            maxLength={500}
          />
          {errors.reason && <p className="text-xs text-red-600">{errors.reason.message}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={(event) => {
                event.preventDefault();
                void submitSupplement();
              }}
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl bg-black/90 p-2">
          {proofUrl && (
            <img
              src={proofUrl}
              alt="Chứng từ thanh toán"
              className="max-h-[80vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={mono ? "font-mono text-gray-800" : "text-gray-800"}>{value}</p>
    </div>
  );
}
