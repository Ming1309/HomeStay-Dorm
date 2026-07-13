import { Calculator, CheckCircle2 } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import type { DepositCalculation } from "@/features/deposits/services/deposit-calc-service";

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

export function DepositCalcPanel({
  deposit,
  confirming,
  onConfirm,
}: {
  deposit: DepositCalculation;
  confirming: boolean;
  onConfirm: () => void;
}) {
  const isShared = deposit.hinhThucThue === "OGhep";
  const rentalTypeLabel = isShared ? "Thuê ở ghép" : "Thuê nguyên phòng";
  const formula = `${formatCurrency(deposit.giaThue)} × 2 × ${deposit.soGiuongTinhTien} giường`;

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{deposit.maPhieuCoc}</h1>
          <Badge className="h-5 bg-gray-100 text-[10px] text-gray-600">Khởi tạo</Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {deposit.hoTenKhachHang} • P. {deposit.soPhong}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin phiếu cọc</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow label="Mã phiếu" value={deposit.maPhieuCoc} mono />
              <DetailRow label="Khách hàng" value={deposit.hoTenKhachHang} />
              <DetailRow label="Phòng" value={`P. ${deposit.soPhong}`} />
              <DetailRow label="Hình thức thuê" value={rentalTypeLabel} />
              <DetailRow label="Đơn giá phòng" value={formatCurrency(deposit.giaThue)} />
              <DetailRow
                label="Số giường tính tiền"
                value={
                  isShared
                    ? `${deposit.soGiuongTinhTien} giường`
                    : `${deposit.soGiuongTinhTien} giường (sức chứa tối đa)`
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Calculator className="size-3.5" /> Tính toán tiền cọc
            </h3>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <p className="mb-1 text-xs font-medium text-blue-700">Công thức áp dụng</p>
              <p className="font-mono text-sm text-blue-800">Tiền cọc = {formula}</p>
              <div className="mt-2 border-t border-blue-100 pt-2">
                <p className="text-xs text-blue-600">Kết quả</p>
                <p className="font-mono text-2xl font-bold text-blue-700">
                  {formatCurrency(deposit.tongTien)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">
              Giường đã chọn ({deposit.giuongs.length})
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2 text-xs">Mã giường</TableHead>
                  <TableHead className="px-2 py-2 text-xs">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposit.giuongs.map((bed) => (
                  <TableRow key={bed.maGiuong}>
                    <TableCell className="px-2 py-2 font-mono text-sm text-gray-800">
                      {bed.soGiuong}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Badge
                        variant="outline"
                        className="h-5 border-amber-200 text-[10px] text-amber-700"
                      >
                        {bed.trangThai}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <span className="text-xs text-gray-400">
          <kbd className="rounded border bg-gray-50 px-1">Ctrl</kbd> +{" "}
          <kbd className="rounded border bg-gray-50 px-1">Enter</kbd> xác nhận
        </span>
        <Button
          type="button"
          className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700"
          disabled={confirming}
          onClick={onConfirm}
        >
          <CheckCircle2 className="mr-1 size-3.5" /> {confirming ? "Đang xác nhận..." : "Xác nhận"}
        </Button>
      </footer>
    </section>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={mono ? "font-mono text-gray-800" : "text-gray-800"}>{value}</p>
    </div>
  );
}
