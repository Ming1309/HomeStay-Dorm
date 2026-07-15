import { Badge } from "@/shared/ui/badge";
import type { DepositLookupDetail } from "@/features/deposits/services/deposit-lookup-service";
import { formatMoney } from "./deposit-format";

const statusLabels: Record<string, string> = {
  KhoiTao: "Mới lập",
  ChoThanhToan: "Chờ thanh toán",
  ChoDoiChieu: "Chờ đối chiếu",
  DaThanhToan: "Đã thanh toán",
  ChoDuyet: "Chờ duyệt",
  DaDuyet: "Đã duyệt",
  DaHuy: "Đã hủy",
};

export function DepositStatusBadge({ status }: { status: string }) {
  const color =
    status === "DaHuy"
      ? "bg-red-100 text-red-700"
      : status === "DaThanhToan" || status === "DaDuyet"
        ? "bg-emerald-100 text-emerald-700"
        : status === "KhoiTao"
          ? "bg-gray-100 text-gray-700"
          : "bg-amber-100 text-amber-700";
  return (
    <Badge className={`${color} border-0 text-[11px]`}>{statusLabels[status] ?? status}</Badge>
  );
}

export function DepositDetailPanel({ deposit }: { deposit: DepositLookupDetail }) {
  return (
    <>
      <header className="shrink-0 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-blue-700">{deposit.maPhieuCoc}</h1>
          <DepositStatusBadge status={deposit.trangThai} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {deposit.hoTenKhachHang} · P.{deposit.soPhong}
        </p>
      </header>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">Thông tin phiếu cọc</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 xl:grid-cols-4">
              <Info label="Mã phiếu" value={deposit.maPhieuCoc} mono />
              <Info label="Khách hàng" value={deposit.hoTenKhachHang} />
              <Info label="Số điện thoại" value={deposit.sdt || "—"} />
              <Info label="Email" value={deposit.email || "—"} />
              <Info
                label="Giấy tờ"
                value={[deposit.loaiGiayTo, deposit.soGiayTo].filter(Boolean).join(" · ") || "—"}
              />
              <Info
                label="Phòng"
                value={`P.${deposit.soPhong}${deposit.toaNha ? ` · ${deposit.toaNha}` : ""}`}
              />
              <Info
                label="Hình thức thuê"
                value={deposit.hinhThucThue === "OGhep" ? "Ở ghép" : "Nguyên phòng"}
              />
              <Info label="Ngày lập" value={formatDate(deposit.thoiDiemCoc)} />
              <Info label="Tiền cọc" value={formatMoney(deposit.tongTien)} />
              <Info
                label="Thanh toán"
                value={deposit.daDongTien ? "Đã thanh toán" : "Chưa thanh toán"}
              />
              {deposit.thoiDiemHuy && (
                <Info label="Thời điểm hủy" value={formatDate(deposit.thoiDiemHuy)} />
              )}
              {deposit.thoiDiemHuy && (
                <Info
                  label="Người hủy"
                  value={deposit.maNVHuy || "Hệ thống (quá hạn thanh toán)"}
                  mono={Boolean(deposit.maNVHuy)}
                />
              )}
            </div>
          </section>
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">Danh sách giường liên quan</h2>
            <div className="flex flex-wrap gap-2">
              {deposit.giuongs.map((bed) => (
                <Badge key={bed.maGiuong} variant="secondary" className="font-mono text-xs">
                  {bed.soGiuong || bed.maGiuong}
                </Badge>
              ))}
              {!deposit.giuongs.length && (
                <p className="text-xs text-gray-500">Không có giường liên quan.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 break-all text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}
