import { FileX2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DepositDetailPanel, DepositStatusBadge } from "./DepositDetailPanel";
import { formatMoney } from "./deposit-format";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
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
import {
  cancelDeposit,
  loadCancellableDeposits,
  loadDepositLookupDetail,
  type DepositLookupDetail,
  type DepositLookupItem,
} from "@/features/deposits/services/deposit-lookup-service";

export function DepositCancellationWorkspace() {
  const [items, setItems] = useState<DepositLookupItem[]>([]);
  const [selected, setSelected] = useState<DepositLookupDetail | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadCancellableDeposits(query, controller.signal)
        .then(setItems)
        .catch((error) => {
          if (!controller.signal.aborted)
            toast.error(
              error instanceof Error ? error.message : "Không thể tải danh sách phiếu cọc.",
            );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, refreshKey]);

  const select = async (id: string) => {
    setLoading(true);
    try {
      setSelected(await loadDepositLookupDetail(id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết phiếu cọc.");
      setSelected(null);
      setRefreshKey((v) => v + 1);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!selected) return;
    const cancelledId = selected.maPhieuCoc;
    const cancelledIndex = items.findIndex((item) => item.maPhieuCoc === cancelledId);
    setSubmitting(true);
    try {
      await cancelDeposit(cancelledId);
      toast.success("Hủy hồ sơ đặt cọc thành công");
      setConfirmOpen(false);
      const remaining = items.filter((item) => item.maPhieuCoc !== cancelledId);
      setItems(remaining);
      const next = remaining[Math.min(Math.max(cancelledIndex, 0), remaining.length - 1)];
      setSelected(null);
      if (next) {
        try {
          setSelected(await loadDepositLookupDetail(next.maPhieuCoc));
        } catch {
          toast.info("Danh sách đã được cập nhật. Vui lòng chọn lại phiếu tiếp theo.");
        }
      }
      setRefreshKey((v) => v + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể hủy phiếu cọc.");
      setConfirmOpen(false);
      setSelected(null);
      setRefreshKey((v) => v + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex h-full w-[365px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <header className="shrink-0 border-b p-4">
          <h1 className="text-base font-semibold">Hủy phiếu cọc</h1>
          <p className="mt-1 text-xs text-gray-500">{items.length} phiếu có thể xử lý</p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm mã phiếu, khách, SĐT, phòng..."
              className="h-9 pl-9 text-xs"
            />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {loading && !items.length ? (
            <Empty text="Đang tải danh sách..." />
          ) : !items.length ? (
            <Empty text="Không có phiếu cọc có thể hủy." />
          ) : (
            items.map((item) => (
              <button
                key={item.maPhieuCoc}
                type="button"
                onClick={() => void select(item.maPhieuCoc)}
                className={`w-full border-b px-4 py-3 text-left hover:bg-gray-50 ${selected?.maPhieuCoc === item.maPhieuCoc ? "bg-red-50" : "bg-white"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {item.maPhieuCoc}
                  </span>
                  <DepositStatusBadge status={item.trangThai} />
                </div>
                <p className="mt-2 text-sm font-semibold">{item.hoTenKhachHang}</p>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>P.{item.soPhong}</span>
                  <span>{item.sdt || "—"}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50/60">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            Chọn phiếu cọc cần hủy.
          </div>
        ) : (
          <>
            <DepositDetailPanel deposit={selected} />
            <footer className="flex min-h-14 shrink-0 items-center justify-end border-t bg-white px-5 py-2">
              <Button
                disabled={submitting}
                onClick={() => setConfirmOpen(true)}
                className="h-8 bg-rose-600 text-xs hover:bg-rose-700"
              >
                <FileX2 className="mr-1 size-3.5" />
                Hủy đặt cọc
              </Button>
            </footer>
          </>
        )}
      </section>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy phiếu cọc {selected?.maPhieuCoc}?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ chuyển phiếu cọc sang trạng thái Đã hủy, giải phóng giường liên quan
              {selected?.daDongTien
                ? ` và chuyển khoản cọc ${formatMoney(selected.tongTien)} cho Kế toán chờ đối soát hoàn tiền`
                : ""}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Bỏ qua</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700"
              onClick={(event) => {
                event.preventDefault();
                void confirm();
              }}
            >
              {submitting ? "Đang xử lý..." : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="p-8 text-center text-xs text-gray-500">{text}</div>;
}
