import { useMemo, useState, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, RefreshCw, Search, Loader2, AlertCircle } from "lucide-react";
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
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ReceiptCollectionDialog, type ReceiptCollectionInvoice } from "@/features/payments/components/ReceiptCollectionDialog";
import { cn } from "@/shared/lib/utils";
import {
  useContractPaymentQueue,
  useContractPaymentDetail,
  useSubmitContractPayment,
} from "../hooks/use-contract-payment-data";
import { useAuth } from "@/features/auth/model/auth-store";

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

export function AccountantPaymentsPage() {
  return <AccountantPaymentsScreen currentPath="/accountant/payments" />;
}

export function AccountantPaymentsScreen({ currentPath }: { currentPath: string }) {
  const { items: queue, loading, error, refresh } = useContractPaymentQueue();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.find((q) => q.maHD === selectedId) ?? null;

  return (
    <div className="flex h-full overflow-hidden">
      <QueuePanel
        items={queue}
        selectedId={selectedId}
        onSelect={setSelectedId}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
      <PaymentsWorkspace contract={selected} onPaymentSuccess={refresh} />
    </div>
  );
}

function QueuePanel({
  items,
  selectedId,
  onSelect,
  loading,
  error,
  onRefresh,
}: {
  items: ReturnType<typeof useContractPaymentQueue>["items"];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.maHD.toLowerCase().includes(q) ||
      item.tenKhachHang.toLowerCase().includes(q) ||
      item.soPhong.toLowerCase().includes(q)
    );
  });

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Hợp đồng chờ thanh toán</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </Button>
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          {loading ? "Đang tải..." : `${filtered.length} hợp đồng cần xử lý`}
        </p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm hợp đồng, khách, phòng..."
            className="h-8 border-gray-200 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-3 mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            Không có hợp đồng chờ thanh toán
          </div>
        )}
        <ul className="divide-y divide-gray-100">
          {filtered.map((item) => (
            <li key={item.maHD}>
              <button
                type="button"
                onClick={() => onSelect(item.maHD)}
                className={cn(
                  "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                  selectedId === item.maHD && "border-l-amber-500 bg-amber-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{item.maHD}</span>
                  <Badge className="h-5 bg-amber-100 text-[10px] font-semibold text-amber-700">
                    Chờ thanh toán
                  </Badge>
                </div>
                <p className="truncate text-sm font-semibold text-gray-800">{item.tenKhachHang}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-500">
                    {item.toaNha ? `${item.toaNha} - ` : ""}{item.soPhong}
                  </span>
                  <span className="font-semibold text-gray-700">{formatCurrency(item.tongTienCanThu)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function PaymentsWorkspace({
  contract,
  onPaymentSuccess,
}: {
  contract: ReturnType<typeof useContractPaymentQueue>["items"][number] | null;
  onPaymentSuccess: () => void;
}) {
  const { user } = useAuth();
  const { detail, loading: detailLoading, error: detailError } = useContractPaymentDetail(
    contract?.maHD ?? null,
  );
  const { submit, submitting, error: submitError } = useSubmitContractPayment();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [issuedPT, setIssuedPT] = useState<{ maPT: string; soTienThu: number } | null>(null);

  useEffect(() => {
    if (submitError) {
      toast.error(submitError, { id: "submit-error" });
    }
  }, [submitError]);

  if (!contract) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <p className="text-sm text-gray-500">Chọn hợp đồng để bắt đầu thu tiền.</p>
      </section>
    );
  }

  const tongCong = detail?.tongCong ?? contract.tongTienCanThu;

  const invoices: ReceiptCollectionInvoice[] = detail
    ? detail.khoanThus.map((k, i) => ({
        code: `HD-TH-${String(i + 1).padStart(3, "0")}`,
        type: k.tenKhoanThu,
        description: k.tenKhoanThu,
        amount: k.thanhTien,
        paid: 0,
        remaining: k.thanhTien,
      }))
    : [{ code: "HD-TH-001", description: "Tổng cộng", amount: tongCong, paid: 0, remaining: tongCong }];

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">{contract.maHD}</h1>
          <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">Chờ thanh toán</Badge>
          <span className="text-xs text-gray-500">
            {contract.tenKhachHang} &bull; {contract.toaNha ? `${contract.toaNha} - ` : ""}{contract.soPhong}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase text-gray-400">TỔNG CẦN THANH TOÁN</p>
          <p className="font-mono text-lg font-bold text-gray-900">{formatCurrency(tongCong)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {detailLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Đang tải chi tiết thanh toán...</span>
          </div>
        )}
        {detailError && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{detailError}</span>
          </div>
        )}
        {!detailLoading && !detailError && (
          <div className="space-y-4">
            <Card className="rounded-lg border-gray-200">
              <CardContent className="p-4">
                <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin hợp đồng</h3>
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <Info label="Mã hợp đồng" value={contract.maHD} mono />
                  <Info label="Khách hàng/Đại diện" value={contract.tenKhachHang} />
                  <Info label="Phòng/Giường" value={`${contract.toaNha ? `${contract.toaNha} - ` : ""}${contract.soPhong}`} mono />
                  <Info label="Kỳ thanh toán" value={`${contract.kyThanhToan} tháng`} />
                  <Info label="Giá thuê" value={`${formatCurrency(contract.giaThue)}/tháng`} mono />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-gray-200">
              <CardContent className="p-0">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="text-xs font-semibold text-gray-700">Chi tiết khoản thu kỳ đầu</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 text-xs">Khoản thu</TableHead>
                      <TableHead className="text-xs">Số lượng/Kỳ</TableHead>
                      <TableHead className="px-4 text-right text-xs">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((line) => (
                      <TableRow key={line.code} className="hover:bg-transparent">
                        <TableCell className="px-4 py-2 text-sm">{line.description}</TableCell>
                        <TableCell className="py-2 text-sm text-gray-500">
                          {detail ? `${line.amount > 0 ? detail.kyThanhToan : 0} tháng` : "-"}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-right font-mono text-sm">
                          {formatCurrency(line.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-transparent">
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={2} className="px-4 py-2 text-right text-sm">Tổng khoản thu:</TableCell>
                      <TableCell className="px-4 py-2 text-right font-mono text-sm">{formatCurrency(tongCong)}</TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50/50">
                      <TableCell colSpan={2} className="px-4 py-3 text-right text-base font-bold">Tổng cần thanh toán:</TableCell>
                      <TableCell className="px-4 py-3 text-right font-mono text-lg font-bold text-blue-700">{formatCurrency(tongCong)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <div className="text-xs text-gray-400">Thu tiền hợp đồng kỳ đầu</div>
        <Button
          type="button"
          onClick={() => setReceiptOpen(true)}
          disabled={submitting || detailLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
          {submitting ? "Đang xử lý..." : "Xác nhận đã thu và lập phiếu"}
        </Button>
      </footer>

      <ReceiptCollectionDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        source="contract_payment"
        contextLabel="Thu tiền hợp đồng"
        customerName={contract.tenKhachHang}
        room={`${contract.toaNha ? `${contract.toaNha} - ` : ""}${contract.soPhong}`}
        contractCode={contract.maHD}
        invoices={invoices}
        totalDebt={tongCong}
        onSubmit={async (data) => {
          try {
            const phuongThuc = data.paymentMethod === "bank-transfer" ? "ChuyenKhoan" : "TienMat";
            const result = await submit({
              maHD: contract.maHD,
              phuongThucThanhToan: phuongThuc,
              chungTu: data.evidenceFile,
            });
            if (result) {
              setIssuedPT(result);
              setReceiptOpen(false);
              setSuccessOpen(true);
              toast.success("Thanh toán hợp đồng thành công", {
                icon: <CheckCircle2 className="size-4 text-emerald-600" />,
                description: `Mã phiếu thu: ${result.maPT}`,
              });
              onPaymentSuccess();
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Lỗi không xác định khi thu tiền.");
          }
        }}
      />
      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        pt={issuedPT}
        contractId={contract.maHD}
      />
    </section>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={cn("text-sm text-gray-800", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function SuccessDialog({
  open,
  onOpenChange,
  pt,
  contractId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pt: { maPT: string; soTienThu: number } | null;
  contractId: string;
}) {
  if (!pt) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Thanh toán hợp đồng thành công</DialogTitle>
          <DialogDescription>
            Hóa đơn kỳ đầu và Phiếu thu {pt.maPT} đã được tạo. Hợp đồng {contractId} đã chuyển sang trạng thái &apos;Chờ bàn giao&apos;.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p>Số tiền thu: <span className="font-mono font-bold">{formatCurrency(pt.soTienThu)}</span></p>
        </div>
        <DialogFooter>
          <Button type="button" className="h-8 bg-blue-600 text-xs hover:bg-blue-700" onClick={() => onOpenChange(false)}>
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
