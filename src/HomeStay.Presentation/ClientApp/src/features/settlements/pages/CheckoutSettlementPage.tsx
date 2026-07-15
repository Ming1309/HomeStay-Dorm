import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Search } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ReceiptCollectionDialog } from "@/features/payments/components/ReceiptCollectionDialog";
import { useAuth } from "@/features/auth/model/auth-store";
import { cn } from "@/shared/lib/utils";

const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

interface PhieuDoiSoatDto {
  maPDS: string;
  maHD?: string;
  maPhieuCoc: string;
  tenKhachHang: string;
  phong: string;
  tienThuThem: number;
  ngayDoiSoat: string;
  trangThai: string;
}

interface HoaDonDto {
  maHoaDon: string;
  loaiHoaDon: string;
  tongTien: number;
  ngayLap: string;
}

interface ChiTietPhieuDoiSoatDto {
  maPDS: string;
  maHD?: string;
  maPhieuCoc: string;
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
  hoaDons: HoaDonDto[];
}

export function AccountantSettlementPage() {
  return <AccountantSettlementScreen currentPath="/accountant/thanh-toan-tra-phong" />;
}

export function AccountantSettlementScreen({ currentPath }: { currentPath: string }) {
  const { user } = useAuth();
  const accountantLabel = user
    ? user.hoTen || user.tenDangNhap
    : "Kế toán đang đăng nhập";
  const [queue, setQueue] = useState<PhieuDoiSoatDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("maPDS"),
  );
  const [selectedDetails, setSelectedDetails] = useState<ChiTietPhieuDoiSoatDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/payments/pds-cho-thu");
      if (!res.ok) throw new Error(await readApiError(res, "Không thể tải danh sách phiếu cần thu."));
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      toast.error("Không thể tải danh sách phiếu cần thu", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const fetchDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/payments/pds-details/${id}`);
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
      <SettlementWorkspace
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

// ─── Left panel ──────────────────────────────────────────────────────────────

function QueuePanel({
  items,
  selectedId,
  onSelect,
}: {
  items: PhieuDoiSoatDto[];
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
        <h2 className="text-sm font-bold text-gray-800">Phiếu đối soát cần thu</h2>
        <p className="mt-0.5 text-xs text-gray-400">{filtered.length} phiếu cần thu thêm</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm phiếu đối soát, khách, phòng..."
            className="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-xs text-gray-400">
            Không có phiếu đối soát nào cần thu thêm.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((item) => {
              return (
                <li key={item.maPDS}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.maPDS)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-rose-50/40",
                      selectedId === item.maPDS && "border-l-rose-500 bg-rose-50/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {item.maPDS}
                      </span>
                      <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                        Cần thu thêm
                      </Badge>
                    </div>
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {item.tenKhachHang}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-500">
                        {item.phong} {item.maHD ? `· ${item.maHD}` : ""}
                      </span>
                      <span className="font-mono font-semibold text-rose-700">
                        {formatCurrency(item.tienThuThem)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

// ─── Main workspace ───────────────────────────────────────────────────────────

function SettlementWorkspace({
  details,
  isLoading,
  accountantLabel,
  onSuccess,
}: {
  details: ChiTietPhieuDoiSoatDto | null;
  isLoading: boolean;
  accountantLabel: string;
  onSuccess: () => void;
}) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [issuedVoucher, setIssuedVoucher] = useState<{ code: string; amount: number } | null>(null);

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
            <CreditCard className="size-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">Chọn phiếu đối soát để xử lý</p>
          <p className="mt-1 text-xs text-gray-400">
            Chọn một phiếu trong danh sách bên trái để xem chi tiết
          </p>
        </div>
      </section>
    );
  }

  const handleCreateReceipt = async (data: {
    amount: number;
    paymentMethod: "cash" | "bank-transfer";
    evidenceName: string;
    evidenceFile: File;
    note: string;
  }) => {
    try {
      const body = new FormData();
      body.append("maPDS", details.maPDS);
      body.append("phuongThucThanhToan", data.paymentMethod === "bank-transfer" ? "ChuyenKhoan" : "TienMat");
      body.append("chungTu", data.evidenceFile);
      const res = await fetch("/api/payments/phieu-thu", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Không thể lập phiếu thu."));
      }

      const phieuThu = await res.json();
      setIssuedVoucher({ code: phieuThu.maPT, amount: phieuThu.soTienThu });
      setReceiptOpen(false);
      setSuccessOpen(true);

      toast.success("Lập phiếu thu thành công", {
        description: `Mã phiếu thu: ${phieuThu.maPT}`,
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      });
    } catch (err) {
      toast.error("Lỗi lập phiếu thu", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const dialogInvoices = details.hoaDons.map((hd) => ({
    code: hd.maHoaDon,
    type: hd.loaiHoaDon === "DichVu" ? "Dịch vụ" : "Bồi thường",
    description: hd.loaiHoaDon === "DichVu" ? "Hóa đơn dịch vụ" : "Hóa đơn bồi thường",
    amount: hd.tongTien,
    paid: 0,
    remaining: hd.tongTien,
  }));

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{details.maPDS}</h1>
          <Badge className="h-5 bg-slate-100 text-[10px] font-semibold text-slate-600 hover:bg-slate-100">
            Đã chốt
          </Badge>
          <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
            Cần thu thêm
          </Badge>
          <span className="hidden text-xs text-gray-500 md:inline">
            {details.tenKhachHang} · {details.phong} {details.maHD ? `· ${details.maHD}` : ""}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500">
            Cần thu thêm
          </p>
          <p className="font-mono text-lg font-bold leading-tight text-rose-700">
            {formatCurrency(details.tienThuThem)}
          </p>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">

          {/* 1. Thông tin phiếu đối soát */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Thông tin phiếu đối soát
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                <InfoField label="Mã phiếu đối soát" value={details.maPDS} mono />
                <InfoField label="Hợp đồng / Phiếu cọc" value={details.maHD || details.maPhieuCoc} mono />
                <InfoField label="Khách hàng" value={details.tenKhachHang} />
                <InfoField label="Phòng" value={details.phong} />
                <InfoField label="Ngày đối soát" value={formatDate(details.ngayDoiSoat)} />
                <InfoField label="Kế toán đang xử lý" value={accountantLabel} />
              </div>
            </CardContent>
          </Card>

          {/* 2. Bảng: Các khoản khấu trừ trong phiếu đối soát */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-0">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Các khoản khấu trừ
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 text-xs">Mã hóa đơn</TableHead>
                    <TableHead className="text-xs">Loại hóa đơn</TableHead>
                    <TableHead className="text-xs">Nội dung khấu trừ</TableHead>
                    <TableHead className="text-right text-xs">Số tiền</TableHead>
                    <TableHead className="px-4 text-xs">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.hoaDons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-xs text-gray-400">
                        Không có khoản khấu trừ nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    details.hoaDons.map((row) => (
                      <TableRow key={row.maHoaDon} className="hover:bg-transparent">
                        <TableCell className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-700">
                          {row.maHoaDon}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-600">
                          {row.loaiHoaDon === "DichVu" ? "Dịch vụ" : "Bồi thường"}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-gray-700">
                          {row.loaiHoaDon === "DichVu" ? "Hóa đơn dịch vụ" : "Hóa đơn bồi thường"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right font-mono text-sm text-gray-800">
                          {formatCurrency(row.tongTien)}
                        </TableCell>
                        <TableCell className="px-4 py-2.5">
                          <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                            Chưa thanh toán
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter className="bg-gray-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={3} className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">
                      Tổng khấu trừ:
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono text-sm font-bold text-gray-900">
                      {formatCurrency(details.tongKhauTru)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* 3. Kết quả đối soát đã chốt */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Kết quả đối soát</h3>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {/* Thông tin cọc */}
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <h4 className="mb-2.5 border-b border-gray-100 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Thông tin cọc
                  </h4>
                  <div className="space-y-2">
                    <SummaryLine
                      label="Tiền cọc ban đầu"
                      value={formatCurrency(details.soTienCoc)}
                    />
                    <SummaryLine
                      label="Tỷ lệ hoàn cọc áp dụng"
                      value={`${Math.round(details.tyLeHoanCoc * 100)}%`}
                    />
                    <div className="flex items-center justify-between gap-3 rounded bg-gray-50 px-2 py-1 text-xs">
                      <span className="font-medium text-gray-600">Cọc được xét hoàn</span>
                      <span className="font-mono font-bold text-gray-900">
                        {formatCurrency(details.soTienCoc * details.tyLeHoanCoc)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Khấu trừ */}
                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <h4 className="mb-2.5 border-b border-gray-100 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Khấu trừ
                  </h4>
                  <div className="space-y-2">
                    <SummaryLine
                      label="Tổng khấu trừ"
                      value={formatCurrency(details.tongKhauTru)}
                    />
                    <SummaryLine
                      label="Đã bù trừ bằng cọc"
                      value={formatCurrency(Math.min(details.soTienCoc * details.tyLeHoanCoc, details.tongKhauTru))}
                    />
                  </div>
                </div>

                {/* Kết quả */}
                <div className="flex flex-col rounded-md border border-rose-200 bg-rose-50/40 p-3">
                  <h4 className="mb-2.5 border-b border-rose-100 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-500">
                    Kết quả
                  </h4>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-[11px] text-gray-500">Khách cần thanh toán thêm</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-rose-700">
                      {formatCurrency(details.tienThuThem)}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                      = Tổng khấu trừ ({formatCurrency(details.tongKhauTru)}) −
                      Cọc được xét hoàn ({formatCurrency(details.soTienCoc * details.tyLeHoanCoc)})
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Chính sách áp dụng: Hoàn {Math.round(details.tyLeHoanCoc * 100)}%
              </p>
            </CardContent>
          </Card>

          {/* 4. Tổng quan công nợ */}
          <Card className="rounded-lg border-gray-200">
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tổng quan công nợ
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                <DebtMetric
                  label="Tổng phải thu thêm"
                  value={details.tienThuThem}
                />
                <DebtMetric label="Đã thu" value={0} />
                <DebtMetric
                  label="Còn phải thu"
                  value={details.tienThuThem}
                  danger={details.tienThuThem > 0}
                />
              </div>
              {details.tienThuThem > 0 && (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Khách còn công nợ cần thanh toán trước khi thanh lý hợp đồng.
                </p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Sticky footer ── */}
      <footer className="sticky bottom-0 flex items-center justify-end border-t border-gray-200 bg-white px-5 py-3">
        <Button
          type="button"
          onClick={() => setReceiptOpen(true)}
          className="shrink-0 bg-blue-600 hover:bg-blue-700"
          disabled={details.tienThuThem <= 0}
        >
          <CreditCard className="size-4" />
          Xác nhận đã thu và lập phiếu
        </Button>
      </footer>

      <ReceiptCollectionDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        source="checkout_settlement"
        contextLabel="Thanh toán trả phòng"
        customerName={details.tenKhachHang}
        room={details.phong}
        contractCode={details.maHD || ""}
        reconciliationCode={details.maPDS}
        invoices={dialogInvoices}
        totalDebt={details.tienThuThem}
        onSubmit={handleCreateReceipt}
      />
      <SuccessDialog
        open={successOpen}
        onOpenChange={(open) => {
          setSuccessOpen(open);
          if (!open) {
            onSuccess();
          }
        }}
        voucher={issuedVoucher}
        reconciliationCode={details.maPDS}
      />
    </section>
  );
}

// ─── Success dialog ───────────────────────────────────────────────────────────

function SuccessDialog({
  open,
  onOpenChange,
  voucher,
  reconciliationCode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: { code: string; amount: number } | null;
  reconciliationCode: string;
}) {
  if (!voucher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thu tiền trả phòng thành công</DialogTitle>
          <DialogDescription>
            Phiếu thu {voucher.code} đã được tạo. Công nợ của Phiếu đối soát {reconciliationCode} đã được thanh toán đầy đủ ({formatCurrency(voucher.amount)}).
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Phiếu đối soát đã được cập nhật thành &apos;Đã tất toán&apos;.
        </div>
        <DialogFooter>
          <Button
            type="button"
            className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
            onClick={() => onOpenChange(false)}
          >
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function InfoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-800", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function DebtMetric({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className={cn("rounded-md border bg-white p-3", danger ? "border-rose-200" : "border-gray-200")}>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={cn("mt-1 font-mono text-base font-bold", danger ? "text-rose-700" : "text-gray-900")}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN");
}

async function readApiError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await response.json().catch(() => null);
    return body?.message ?? fallback;
  }

  return (await response.text()) || fallback;
}
