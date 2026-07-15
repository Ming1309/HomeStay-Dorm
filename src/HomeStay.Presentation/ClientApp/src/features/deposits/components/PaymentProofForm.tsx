import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock3, FileText, ImageIcon, TriangleAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import {
  DepositPaymentApiError,
  submitDepositPayment,
  type DepositPaymentDetail,
  type DepositPaymentMethod,
} from "@/features/deposits/services/deposit-payment-service";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const MISSING_PROOF_MESSAGE = "Vui lòng tải lên chứng từ thanh toán để tiếp tục.";
const INVALID_PROOF_MESSAGE =
  "Định dạng tệp không hỗ trợ hoặc dung lượng quá lớn. Vui lòng tải lên file ảnh hoặc PDF dưới 5MB.";

const paymentSchema = z.object({
  paymentMethod: z.enum(["ChuyenKhoan", "TienMat"], {
    errorMap: () => ({ message: "Vui lòng chọn phương thức thanh toán." }),
  }),
  proofFile: z.custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    MISSING_PROOF_MESSAGE,
  ),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function validFile(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return file.size > 0 && file.size <= MAX_SIZE && ALLOWED_EXTENSIONS.includes(extension);
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days} ngày ${hours} giờ ${minutes} phút`;
  if (hours > 0) return `${hours} giờ ${minutes} phút ${seconds} giây`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PaymentProofForm({
  deposit,
  onDone,
  onExpired,
}: {
  deposit: DepositPaymentDetail;
  onDone: () => void;
  onExpired: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const expiryHandled = useRef(false);
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: deposit.phuongThucThanhToan ?? undefined,
      proofFile: undefined,
    },
  });

  const paymentMethod = watch("paymentMethod");
  const proofFile = watch("proofFile");
  const deadline = deposit.hanThanhToan ? new Date(deposit.hanThanhToan).getTime() : Number.NaN;
  const deadlineValid = Number.isFinite(deadline);
  const remaining = deadlineValid ? deadline - now : 0;
  const expired = !deadlineValid || remaining <= 0;
  const previewUrl = useMemo(
    () => (proofFile ? URL.createObjectURL(proofFile) : null),
    [proofFile],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!expired || expiryHandled.current) return;
    expiryHandled.current = true;
    toast.error(
      deadlineValid
        ? "Phiếu cọc đã hết hạn thanh toán và sẽ được hệ thống tự động hủy."
        : "Phiếu cọc không có hạn thanh toán hợp lệ.",
    );
    onExpired();
  }, [deadlineValid, expired, onExpired]);

  const chonTepChungTu = (file: File | null) => {
    if (expired) return;
    if (!file) {
      setValue("proofFile", undefined as unknown as File);
      return;
    }
    if (!validFile(file)) {
      setValue("proofFile", undefined as unknown as File);
      setError("proofFile", { type: "validate", message: INVALID_PROOF_MESSAGE });
      toast.error(INVALID_PROOF_MESSAGE);
      return;
    }
    clearErrors("proofFile");
    setValue("proofFile", file, { shouldValidate: true, shouldDirty: true });
  };

  const guiChungTu = handleSubmit(async (values) => {
    if (expired) return;
    try {
      await submitDepositPayment(deposit.maPhieuCoc, values.paymentMethod, values.proofFile);
      toast.success("Đã gửi chứng từ cho Quản lý đối chiếu thành công.");
      onDone();
    } catch (error) {
      if (error instanceof DepositPaymentApiError && error.status === 409) {
        toast.error(error.message);
        onDone();
        return;
      }
      toast.error(error instanceof Error ? error.message : "Không thể gửi chứng từ thanh toán.");
    }
  });

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter" && !expired && !isSubmitting) {
        event.preventDefault();
        void guiChungTu();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [expired, guiChungTu, isSubmitting]);

  const openPreview = () => {
    if (!previewUrl || !proofFile) return;
    if (proofFile.type === "application/pdf" || proofFile.name.toLowerCase().endsWith(".pdf")) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    } else {
      setPreviewOpen(true);
    }
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{deposit.maPhieuCoc}</h1>
          <Badge
            className={
              deposit.lyDoYeuCauBoSung ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            }
          >
            {deposit.lyDoYeuCauBoSung ? "Cần bổ sung" : "Chờ thanh toán"}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {deposit.hoTenKhachHang} • P. {deposit.soPhong}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        <div className="space-y-4">
          {deposit.lyDoYeuCauBoSung && (
            <section className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h2 className="mb-1 text-xs font-semibold text-red-700">Quản lý yêu cầu bổ sung</h2>
              <p className="text-sm text-red-700">{deposit.lyDoYeuCauBoSung}</p>
              <p className="mt-1 text-xs text-red-600">
                Vui lòng kiểm tra lại phương thức thanh toán và tải chứng từ mới.
              </p>
            </section>
          )}
          <section
            className={cn(
              "flex items-center justify-between rounded-lg border px-4 py-3",
              remaining <= 60_000
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-800",
            )}
          >
            <div className="flex items-center gap-2">
              {expired ? <TriangleAlert className="size-4" /> : <Clock3 className="size-4" />}
              <div>
                <p className="text-xs font-semibold">
                  {expired ? "Đã hết hạn thanh toán" : "Thời gian còn lại"}
                </p>
                <p className="text-[11px] opacity-80">
                  Hết hạn lúc {deadlineValid ? new Date(deadline).toLocaleString("vi-VN") : "—"}
                </p>
              </div>
            </div>
            {!expired && <strong className="font-mono text-sm">{formatRemaining(remaining)}</strong>}
          </section>
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
              <InfoRow label="Số giường thuê" value={`${deposit.soGiuongThue} giường`} />
              <InfoRow label="Số tiền cần thanh toán" value={formatCurrency(deposit.tongTien)} />
              <InfoRow
                label="Hạn thanh toán"
                value={
                  deposit.hanThanhToan
                    ? new Date(deposit.hanThanhToan).toLocaleString("vi-VN")
                    : "—"
                }
              />
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-xs font-semibold text-gray-700">
              Phương thức thanh toán <span className="text-red-500">*</span>
            </h2>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select
                  disabled={expired}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as DepositPaymentMethod)}
                >
                  <SelectTrigger
                    className={cn("h-8 text-xs", errors.paymentMethod && "border-red-500")}
                  >
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ChuyenKhoan" className="text-xs">
                      Chuyển khoản ngân hàng
                    </SelectItem>
                    <SelectItem value="TienMat" className="text-xs">
                      Tiền mặt
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="mt-1 text-xs text-red-600">{errors.paymentMethod.message}</p>
            )}
            {paymentMethod === "TienMat" && (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                <p className="text-xs text-blue-700">
                  Nhận đủ tiền mặt, lập Phiếu biên nhận viết tay và ký cùng khách hàng. Sau đó chụp
                  ảnh Phiếu biên nhận đã ký và tải lên bên dưới.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <ImageIcon className="size-3.5" />
              Chứng từ thanh toán <span className="text-red-500">*</span>
            </h2>
            {!proofFile ? (
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors",
                  errors.proofFile
                    ? "border-red-500 bg-red-50"
                    : dragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100/60",
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  chonTepChungTu(event.dataTransfer.files[0] ?? null);
                }}
                onClick={() => document.getElementById("deposit-proof-upload")?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    document.getElementById("deposit-proof-upload")?.click();
                }}
              >
                <Upload
                  className={cn("mb-2 size-6", errors.proofFile ? "text-red-500" : "text-gray-400")}
                />
                <p className="text-sm font-medium text-gray-500">Kéo thả file hoặc nhấp để chọn</p>
                <p className="mt-1 text-xs text-gray-400">Hỗ trợ JPG, PNG, PDF (tối đa 5MB)</p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-gray-50">
                    {proofFile.type.startsWith("image/") && previewUrl ? (
                      <img src={previewUrl} alt="Ảnh chứng từ" className="size-full object-cover" />
                    ) : (
                      <FileText className="size-6 text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{proofFile.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {(proofFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 flex-1 text-xs"
                    onClick={openPreview}
                  >
                    Xem chứng từ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 flex-1 text-xs"
                    onClick={() => document.getElementById("deposit-proof-upload")?.click()}
                  >
                    Thay đổi
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 flex-1 text-xs text-rose-600"
                    onClick={() => chonTepChungTu(null)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            )}
            <input
              id="deposit-proof-upload"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(event) => {
                chonTepChungTu(event.target.files?.[0] ?? null);
                event.target.value = "";
              }}
            />
            {errors.proofFile && (
              <p className="mt-1 text-xs text-red-600">{errors.proofFile.message}</p>
            )}
          </section>
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-end border-t border-gray-200 bg-white px-5 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <Button
          type="button"
          className="h-8 text-xs"
          onClick={() => void guiChungTu()}
          disabled={isSubmitting || expired}
        >
          <CheckCircle2 className="mr-1 size-3.5" />
          {isSubmitting ? "Đang gửi..." : "Gửi"}
        </Button>
      </footer>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          {previewUrl && proofFile?.type.startsWith("image/") && (
            <img
              src={previewUrl}
              alt="Chứng từ thanh toán"
              className="mx-auto max-h-[85vh] rounded-lg object-contain shadow-2xl"
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
