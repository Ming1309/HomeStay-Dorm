import { useState } from "react";
import { CheckCircle2, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useWorkflowStore, type DepositRequest } from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

const statusLabels: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  supplement_required: "Cần bổ sung",
};

const statusBadgeClass: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  supplement_required: "bg-rose-100 text-rose-700",
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function PaymentProofForm({
  deposit,
  onDone,
}: {
  deposit: DepositRequest;
  onDone: () => void;
}) {
  const { recordDepositPayment } = useWorkflowStore();

  const [paymentMethod, setPaymentMethod] = useState<"bank-transfer" | "cash" | "">(
    deposit.supplementReason ? "" : "bank-transfer",
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setProofFile(null);
      setProofPreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Định dạng tệp không hỗ trợ. Vui lòng tải lên file ảnh hoặc PDF dưới 5MB.");
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Dung lượng quá lớn. Vui lòng tải lên file ảnh hoặc PDF dưới 5MB.");
      return;
    }

    setProofFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = () => {
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán.");
      return;
    }
    if (!proofFile) {
      toast.error("Vui lòng tải lên chứng từ thanh toán để tiếp tục.");
      return;
    }

    setSubmitting(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      recordDepositPayment(deposit.id, paymentMethod as "bank-transfer" | "cash", base64);
      toast.success("Đã gửi chứng từ cho Quản lý đối chiếu thành công.");
      setSubmitting(false);
    };
    reader.readAsDataURL(proofFile);
  };

  const isLocked =
    deposit.status === "pending_reconciliation" ||
    deposit.status === "paid" ||
    deposit.status === "cancelled";

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{deposit.code}</h1>
          <Badge className={statusBadgeClass[deposit.status] ?? ""}>
            {statusLabels[deposit.status] ?? deposit.status}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {deposit.customerName} • {deposit.room}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        {deposit.supplementReason && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="mb-1 text-xs font-semibold text-red-700">Yêu cầu bổ sung từ Quản lý</h3>
            <p className="text-sm text-red-600">{deposit.supplementReason}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin phiếu cọc</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Mã phiếu" value={deposit.code} mono />
              <InfoRow label="Khách hàng" value={deposit.customerName} />
              <InfoRow label="Phòng" value={deposit.room} />
              <InfoRow
                label="Hình thức thuê"
                value={deposit.rentalType === "shared" ? "Ở ghép" : "Nguyên phòng"}
              />
              {deposit.depositAmount != null && (
                <InfoRow label="Số tiền cần thanh toán" value={formatCurrency(deposit.depositAmount)} />
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">Phương thức thanh toán</h3>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "bank-transfer" | "cash")}
              disabled={isLocked}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank-transfer" className="text-xs">Chuyển khoản ngân hàng</SelectItem>
                <SelectItem value="cash" className="text-xs">Tiền mặt</SelectItem>
              </SelectContent>
            </Select>

            {paymentMethod === "cash" && (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                <p className="text-xs text-blue-700">
                  Hướng dẫn: Nhận đủ tiền mặt từ khách hàng, lập Phiếu biên nhận viết tay
                  và ký cùng khách hàng. Sau đó chụp ảnh Phiếu biên nhận đã ký và tải lên
                  tại mục chứng từ bên dưới.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <ImageIcon className="size-3.5" />
              Chứng từ thanh toán
            </h3>

            <div
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                dragging
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("proof-upload")?.click()}
            >
              <Upload className="mb-2 size-6 text-gray-400" />
              <p className="text-sm text-gray-500">
                Kéo thả file hoặc nhấp để chọn
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Hỗ trợ JPG, PNG, PDF (tối đa 5MB)
              </p>
              <input
                id="proof-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                disabled={isLocked}
              />
            </div>

            {proofPreview && (
              <div className="mt-3">
                <img
                  src={proofPreview}
                  alt="Proof preview"
                  className="max-h-[200px] rounded-lg border border-gray-200 object-contain"
                />
              </div>
            )}

            {proofFile && !proofPreview && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <ImageIcon className="size-4 text-gray-400" />
                <span className="flex-1 text-sm text-gray-700">{proofFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setProofFile(null);
                    setProofPreview(null);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-200"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <span className="text-xs text-gray-400">
          {submitting ? "Đang gửi..." : "Vui lòng kiểm tra thông tin trước khi gửi"}
        </span>
        <Button
          type="button"
          className="h-8 text-xs"
          onClick={handleSubmit}
          disabled={submitting || isLocked || !paymentMethod || !proofFile}
        >
          <CheckCircle2 className="mr-1 size-3.5" />
          Gửi
        </Button>
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
