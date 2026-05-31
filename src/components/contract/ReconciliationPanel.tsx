import { useState } from "react";
import { CheckCircle2, FileX2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore, type DepositRequest } from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function ReconciliationPanel({
  deposit,
  onDone,
}: {
  deposit: DepositRequest;
  onDone: () => void;
}) {
  const { confirmDepositPayment, rejectDepositPayment } = useWorkflowStore();
  const [supplementReason, setSupplementReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  const handleConfirm = () => {
    confirmDepositPayment(deposit.id);
    toast.success(`Phiếu cọc ${deposit.code} đã được xác nhận hợp lệ.`, {
      icon: <CheckCircle2 className="size-4 text-emerald-100" />,
    });
  };

  const handleReject = () => {
    if (!supplementReason.trim()) return;
    rejectDepositPayment(deposit.id, supplementReason.trim());
    toast.success(`Đã yêu cầu bổ sung cho ${deposit.code}.`);
    setRejectOpen(false);
    setSupplementReason("");
  };

  const isLocked = deposit.status === "paid" || deposit.status === "cancelled";

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
        <h1 className="font-mono text-sm font-bold text-gray-900">{deposit.code}</h1>
        <p className="mt-0.5 text-xs text-gray-500">
          {deposit.customerName} • {deposit.room}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin phiếu cọc</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Mã phiếu" value={deposit.code} mono />
              <InfoRow label="Trạng thái" value="Chờ đối chiếu" />
              <InfoRow label="Khách hàng" value={deposit.customerName} />
              <InfoRow label="Số điện thoại" value={deposit.phone} />
              <InfoRow label="Phòng" value={deposit.room} />
              <InfoRow
                label="Hình thức thuê"
                value={deposit.rentalType === "shared" ? "Ở ghép" : "Nguyên phòng"}
              />
              <InfoRow label="Đơn giá phòng" value={formatCurrency(deposit.basePrice)} />
              {deposit.depositAmount != null && (
                <InfoRow label="Tiền cọc" value={formatCurrency(deposit.depositAmount)} />
              )}
              <InfoRow
                label="Phương thức thanh toán"
                value={
                  deposit.paymentMethod === "bank-transfer"
                    ? "Chuyển khoản"
                    : deposit.paymentMethod === "cash"
                      ? "Tiền mặt"
                      : "—"
                }
              />
            </div>
          </div>

          {deposit.supplementReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-1 text-xs font-semibold text-red-700">Lý do yêu cầu bổ sung</h3>
              <p className="text-sm text-red-600">{deposit.supplementReason}</p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <ImageIcon className="size-3.5" />
              Chứng từ thanh toán
            </h3>
            {deposit.paymentProof ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
                <p className="text-xs text-gray-400">Chứng từ đã được tải lên (hình ảnh preview)</p>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
                <p className="text-xs text-gray-400">
                  {deposit.status === "supplement_required"
                    ? "Chưa có chứng từ bổ sung"
                    : "Chưa tải lên chứng từ"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <span className="text-xs text-gray-400">
          {deposit.paymentMethod === "bank-transfer"
            ? "Đối chiếu với sao kê tài khoản ngân hàng"
            : deposit.paymentMethod === "cash"
              ? "Kiểm tra biên nhận tiền mặt"
              : ""}
        </span>
        <div className="flex items-center gap-2">
          <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 border-red-300 text-xs text-red-700 hover:bg-red-50"
                disabled={isLocked}
              >
                <FileX2 className="mr-1 size-3.5" />
                Yêu cầu bổ sung
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Yêu cầu bổ sung chứng từ</AlertDialogTitle>
                <AlertDialogDescription>
                  Nhập lý do yêu cầu bổ sung. Thông báo sẽ được gửi đến Nhân viên Sale phụ trách.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                value={supplementReason}
                onChange={(e) => setSupplementReason(e.target.value)}
                placeholder="Nhập lý do yêu cầu bổ sung..."
                className="min-h-[100px] text-sm"
              />
              <AlertDialogFooter>
                <AlertDialogCancel className="h-8 text-xs">Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="h-8 text-xs"
                  disabled={!supplementReason.trim()}
                  onClick={handleReject}
                >
                  Gửi yêu cầu
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="button"
            className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700"
            disabled={isLocked}
            onClick={handleConfirm}
          >
            <CheckCircle2 className="mr-1 size-3.5" />
            Xác nhận hợp lệ
          </Button>
        </div>
      </footer>
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
