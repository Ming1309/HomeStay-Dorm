import { useState } from "react";
import { Calculator, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkflowStore, type DepositRequest } from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function DepositCalcPanel({
  deposit,
}: {
  deposit: DepositRequest;
}) {
  const { updateDepositAmount, rooms } = useWorkflowStore();
  const [confirmed, setConfirmed] = useState(false);

  const room = rooms.find((r) => r.id === deposit.roomId);
  const selectedBeds = room?.beds.filter((b) => deposit.selectedBedIds.includes(b.id)) ?? [];
  const bedCount = selectedBeds.length;
  const maxCapacity = room?.maxCapacity ?? 0;
  const isShared = deposit.rentalType === "shared";
  const effectiveBeds = isShared ? bedCount : maxCapacity;
  const calculatedAmount = deposit.basePrice * 2 * effectiveBeds;

  const handleConfirm = () => {
    updateDepositAmount(deposit.id, calculatedAmount);
    toast.success(`Phiếu cọc ${deposit.code} đã được xác nhận. Chuyển sang trạng thái chờ thanh toán.`, {
      icon: <CheckCircle2 className="size-4 text-emerald-100" />,
    });
    setConfirmed(true);
  };

  const rentalTypeLabel = isShared ? "Thuê ở ghép" : "Thuê nguyên phòng";
  const formula = isShared
    ? `${formatCurrency(deposit.basePrice)} × 2 × ${bedCount} giường`
    : `${formatCurrency(deposit.basePrice)} × 2 × ${maxCapacity} giường (sức chứa tối đa)`;

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{deposit.code}</h1>
          <Badge className="h-5 bg-gray-100 text-[10px] text-gray-600">Khởi tạo</Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {deposit.customerName} • {deposit.room}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin phiếu cọc</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow label="Mã phiếu" value={deposit.code} mono />
              <DetailRow label="Khách hàng" value={deposit.customerName} />
              <DetailRow label="Phòng" value={deposit.room} />
              <DetailRow label="Hình thức thuê" value={rentalTypeLabel} />
              <DetailRow label="Đơn giá phòng" value={formatCurrency(deposit.basePrice)} />
              <DetailRow
                label="Số giường thuê"
                value={isShared ? `${bedCount} giường` : `${maxCapacity} giường (tối đa)`}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Calculator className="size-3.5" />
              Tính toán tiền cọc
            </h3>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <p className="mb-1 text-xs font-medium text-blue-700">Công thức áp dụng</p>
              <p className="font-mono text-sm text-blue-800">
                Tiền cọc = {formula}
              </p>

              <div className="mt-2 border-t border-blue-100 pt-2">
                <p className="text-xs text-blue-600">Kết quả</p>
                <p className="font-mono text-2xl font-bold text-blue-700">
                  {formatCurrency(calculatedAmount)}
                </p>
              </div>
            </div>
          </div>

          {room && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold text-gray-700">
                Giường đã chọn ({selectedBeds.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2 text-xs">Mã giường</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBeds.map((bed) => (
                    <TableRow key={bed.id}>
                      <TableCell className="px-2 py-2 font-mono text-sm text-gray-800">
                        {bed.code}
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <Badge variant="outline" className="h-5 text-[10px] border-amber-200 text-amber-700">
                          Giữ chỗ
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-end border-t border-gray-200 bg-white px-5 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <Button
          type="button"
          className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700"
          disabled={confirmed}
          onClick={handleConfirm}
        >
          <CheckCircle2 className="mr-1 size-3.5" />
          Xác nhận
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
