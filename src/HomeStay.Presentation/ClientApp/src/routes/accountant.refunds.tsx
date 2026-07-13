import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, Landmark, Search, Undo2, User } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth/model/auth-store";

export const Route = createFileRoute("/accountant/refunds")({
  component: AccountantRefundsPage,
});

const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

interface PhieuDoiSoatChoHoan {
  maPDS: string;
  maHD?: string;
  maPhieuCoc: string;
  tenKhachHang: string;
  phong: string;
  tienHoan: number;
  ngayDoiSoat: string;
  trangThai: string;
}

interface ChiTietDoiSoatChoHoan {
  maPDS: string;
  maHD?: string;
  maPhieuCoc: string;
  maKH: string;
  tenKhachHang: string;
  phone: string;
  email: string;
  phong: string;
  soTienCoc: number;
  ngayDoiSoat: string;
  tyLeHoanCoc: number;
  tongKhauTru: number;
  tienHoan: number;
  tienThuThem: number;
  trangThai: string;
  policyCode: string;
  refundRate: number;
}

function AccountantRefundsPage() {
  const { user } = useAuth();
  const accountantLabel = user
    ? user.hoTen || user.tenDangNhap
    : "Kế toán đang đăng nhập";
  const [queue, setQueue] = useState<PhieuDoiSoatChoHoan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<ChiTietDoiSoatChoHoan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/refunds/pds-cho-hoan");
      if (!res.ok) throw new Error(await readApiError(res, "Không thể tải danh sách phiếu chờ hoàn."));
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      toast.error("Không thể tải danh sách phiếu chờ hoàn", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const fetchDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/refunds/pds-details/${id}`);
      if (!res.ok) throw new Error(await readApiError(res, "Không thể tải chi tiết phiếu đối soát."));
      const data = await res.json();
      setSelectedDetails(data);
    } catch (err) {
      toast.error("Không thể tải chi tiết phiếu đối soát", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchDetails(selectedId);
    } else {
      setSelectedDetails(null);
    }
  }, [selectedId]);

  return (
    <div className="flex h-full overflow-hidden">
      <QueuePanel
        items={queue}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <RefundWorkspace
        details={selectedDetails}
        isLoading={isLoading}
        accountantLabel={accountantLabel}
        onSuccess={() => {
          setSelectedId(null);
          setSelectedDetails(null);
          fetchQueue();
        }}
      />
    </div>
  );
}

// ─── Queue Panel ─────────────────────────────────────────────────────────────

function QueuePanel({
  items,
  selectedId,
  onSelect,
}: {
  items: PhieuDoiSoatChoHoan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.maPDS.toLowerCase().includes(q) ||
      (item.maHD || "").toLowerCase().includes(q) ||
      item.tenKhachHang.toLowerCase().includes(q) ||
      item.phong.toLowerCase().includes(q)
    );
  });

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Cần lập phiếu hoàn cọc</h2>
        <p className="mt-0.5 text-xs text-gray-400">{filtered.length} phiếu đối soát chờ hoàn</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm phiếu đối soát, khách, phòng..."
            className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-xs text-gray-400">
            Không có phiếu đối soát nào chờ hoàn cọc.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <li key={item.maPDS}>
                <button
                  type="button"
                  onClick={() => onSelect(item.maPDS)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-emerald-50/40",
                    selectedId === item.maPDS && "border-l-emerald-500 bg-emerald-50/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {item.maPDS}
                    </span>
                    <Badge className="h-5 bg-emerald-100 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
                      Đã chốt
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {item.tenKhachHang}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500">
                      {item.phong} {item.maHD ? `· ${item.maHD}` : ""}
                    </span>
                    <span className="font-mono font-semibold text-emerald-700">
                      {formatCurrency(item.tienHoan)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

// ─── Workspace Panel ─────────────────────────────────────────────────────────

function RefundWorkspace({
  details,
  isLoading,
  accountantLabel,
  onSuccess,
}: {
  details: ChiTietDoiSoatChoHoan | null;
  isLoading: boolean;
  accountantLabel: string;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState<"cash" | "bank-transfer">("bank-transfer");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [note, setNote] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [issued, setIssued] = useState<{
    code: string;
    customerName: string;
    amount: number;
    method: string;
    date: string;
    executor: string;
  } | null>(null);

  // Form validation
  const isFormValid =
    method === "cash" ||
    (bankAccount.trim().length >= 6 && bankName.trim().length > 0 && accountHolder.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details || !isFormValid) return;

    const thongTinTaiKhoan =
      method === "bank-transfer"
        ? `Số TK: ${bankAccount} - Ngân hàng: ${bankName} - Chủ TK: ${accountHolder}`
        : "Nhận tiền mặt tại quầy";

    try {
      const res = await fetch("/api/refunds/phieu-hoan-coc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maPDS: details.maPDS,
          phuongThucHoan: method === "bank-transfer" ? "ChuyenKhoan" : "TienMat",
          thongTinNhanTien: thongTinTaiKhoan,
        }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Lỗi lập phiếu hoàn cọc."));
      }

      const phc = await res.json();
      setIssued({
        code: phc.maPHC,
        customerName: details.tenKhachHang,
        amount: phc.soTienHoan,
        method: phc.phuongThucHoan,
        date: phc.thoiGian,
        executor: accountantLabel,
      });
      setSuccessOpen(true);

      toast.success("Lập phiếu hoàn cọc thành công", {
        description: `Mã phiếu hoàn: ${phc.maPHC}`,
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      });
    } catch (err) {
      toast.error("Lỗi lập phiếu hoàn cọc", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  useEffect(() => {
    // Reset form when selection changes
    setMethod("bank-transfer");
    setBankAccount("");
    setBankName("");
    setAccountHolder("");
    setNote("");
    setIssued(null);
    setSuccessOpen(false);
  }, [details?.maPDS]);

  if (isLoading) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Đang tải chi tiết phiếu đối soát...</p>
      </section>
    );
  }

  if (!details) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100">
            <Undo2 className="size-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">Chọn phiếu đối soát để lập hoàn cọc</p>
          <p className="mt-1 text-xs text-gray-400">
            Chọn một phiếu trong danh sách bên trái để bắt đầu lập phiếu hoàn tiền
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{details.maPDS}</h1>
          <Badge className="h-5 bg-emerald-100 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
            Đã chốt
          </Badge>
          <span className="hidden text-xs text-gray-500 md:inline">
            {details.tenKhachHang} · {details.phong} {details.maHD ? `· ${details.maHD}` : ""}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
            Số tiền cần hoàn
          </p>
          <p className="font-mono text-lg font-bold leading-tight text-emerald-700">
            {formatCurrency(details.tienHoan)}
          </p>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="mx-auto max-w-3xl space-y-4">

          {/* 1. Thông tin khách hàng */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="size-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900">Thông tin khách hàng</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <InfoField label="Mã khách" value={details.maKH} mono />
                <InfoField label="Họ tên" value={details.tenKhachHang} />
                <InfoField label="Số điện thoại" value={details.phone} mono />
              </div>
            </CardContent>
          </Card>

          {/* 2. Kết quả đối soát đã chốt */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="size-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900">Kết quả đối soát đã chốt</h3>
                <span className="ml-auto font-mono text-[11px] text-gray-400">
                  {details.policyCode} · Hoàn {details.refundRate}% cọc
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <SummaryLine
                  label="Tiền cọc ban đầu"
                  value={formatCurrency(details.soTienCoc)}
                />
                <SummaryLine
                  label={`Tiền hoàn cọc cơ bản (${details.refundRate}% cọc)`}
                  value={formatCurrency(details.soTienCoc * details.tyLeHoanCoc)}
                />
                {details.tongKhauTru > 0 && (
                  <SummaryLine
                    label="Tổng khấu trừ"
                    value={`− ${formatCurrency(details.tongKhauTru)}`}
                  />
                )}
                <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Số tiền thực tế hoàn</span>
                  <span className="font-mono text-base font-bold text-emerald-700">
                    {formatCurrency(details.tienHoan)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Thông tin phiếu hoàn cọc */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Undo2 className="size-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900">Thông tin phiếu hoàn cọc</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Số tiền hoàn *</label>
                  <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 font-mono text-sm font-semibold text-emerald-700">
                    {formatCurrency(details.tienHoan)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Hình thức hoàn cọc *</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1"
                  >
                    <option value="bank-transfer">Chuyển khoản ngân hàng</option>
                    <option value="cash">Tiền mặt</option>
                  </select>
                </div>
              </div>

              {/* Conditional bank account details */}
              {method === "bank-transfer" && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="size-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">
                      Thông tin tài khoản nhận tiền
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Số tài khoản *</label>
                      <input
                        required
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="VD: 0123456789"
                        className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 font-mono text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Ngân hàng *</label>
                      <input
                        required
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="VD: Vietcombank"
                        className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Chủ tài khoản *</label>
                      <input
                        required
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="VD: NGUYEN VAN A"
                        className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Người lập phiếu *</label>
                  <input
                    disabled
                    type="text"
                    value={accountantLabel}
                    className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Ngày lập phiếu *</label>
                  <input
                    disabled
                    type="text"
                    value={new Date().toLocaleDateString("vi-VN")}
                    className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Ghi chú hoàn cọc</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập lý do hoặc mô tả..."
                  rows={2}
                  className="w-full rounded-md border border-gray-200 bg-white p-3 text-sm outline-none focus:border-blue-400 focus:ring-1"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── Sticky footer ── */}
        <footer className="sticky bottom-0 flex items-center justify-end border-t border-gray-200 bg-white px-5 py-3">
          <Button
            type="submit"
            onClick={handleSubmit}
            className="h-9 bg-blue-600 hover:bg-blue-700"
            disabled={!isFormValid || details.tienHoan <= 0}
          >
            <Undo2 className="size-4" />
            Lập phiếu hoàn cọc
          </Button>
        </footer>

        {/* ── Success dialog ── */}
        <SuccessDialog
          open={successOpen}
          onOpenChange={(open) => {
            setSuccessOpen(open);
            if (!open) {
              onSuccess();
            }
          }}
          voucher={issued}
          pdsCode={details.maPDS}
        />
      </form>
    </section>
  );
}

// ─── Success Dialog ──────────────────────────────────────────────────────────

function SuccessDialog({
  open,
  onOpenChange,
  voucher,
  pdsCode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: {
    code: string;
    customerName: string;
    amount: number;
    method: string;
    date: string;
    executor: string;
  } | null;
  pdsCode: string;
}) {
  if (!voucher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Lập phiếu hoàn cọc thành công</DialogTitle>
          <DialogDescription className="text-center">
            Phiếu hoàn cọc{" "}
            <span className="font-mono font-semibold text-emerald-700">{voucher.code}</span> đã được tạo.
            Phiếu đối soát <span className="font-semibold">{pdsCode}</span> đã được cập nhật thành{" "}
            <span className="font-semibold text-emerald-700">Đã tất toán</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Mã phiếu hoàn</span>
            <span className="font-mono font-semibold text-emerald-700">{voucher.code}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Khách hàng</span>
            <span className="font-medium text-gray-900">{voucher.customerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Số tiền hoàn</span>
            <span className="font-mono font-bold text-emerald-700">
              {formatCurrency(voucher.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Hình thức</span>
            <span className="font-medium text-gray-900">
              {voucher.method === "TienMat" ? "Tiền mặt" : "Chuyển khoản"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Ngày lập</span>
            <span className="font-medium text-gray-900">
              {new Date(voucher.date).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Người lập</span>
            <span className="font-medium text-gray-900">{voucher.executor}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="h-9 w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onOpenChange(false)}
          >
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-900", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-semibold text-gray-900">{value}</span>
    </div>
  );
}

async function readApiError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await response.json().catch(() => null);
    return body?.message ?? fallback;
  }

  return (await response.text()) || fallback;
}
