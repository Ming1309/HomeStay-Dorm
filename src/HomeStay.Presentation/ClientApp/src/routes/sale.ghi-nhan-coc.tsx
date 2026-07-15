import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PaymentProofForm } from "@/features/deposits/components/PaymentProofForm";
import { PendingDepositQueue } from "@/features/deposits/components/PendingDepositQueue";
import {
  loadDepositPaymentDetail,
  loadPendingDeposits,
  type DepositPaymentDetail,
  type PendingDeposit,
} from "@/features/deposits/services/deposit-payment-service";

export const Route = createFileRoute("/sale/ghi-nhan-coc")({ component: SalePaymentProofPage });

function SalePaymentProofPage() {
  const [items, setItems] = useState<PendingDeposit[]>([]);
  const [selected, setSelected] = useState<DepositPaymentDetail | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("maPhieuCoc");
    if (!target) return;
    setDetailLoading(true);
    void loadDepositPaymentDetail(target)
      .then(setSelected)
      .catch(() => toast.error("Phiếu cọc không còn chờ ghi nhận."))
      .finally(() => setDetailLoading(false));
  }, []);

  const reloadQueue = useCallback(() => {
    setSelected(null);
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      loadPendingDeposits(query, controller.signal)
        .then(setItems)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          toast.error(
            error instanceof Error ? error.message : "Không thể tải danh sách phiếu cọc.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, refreshKey]);

  const chonPhieuCoc = async (item: PendingDeposit) => {
    setDetailLoading(true);
    try {
      setSelected(await loadDepositPaymentDetail(item.maPhieuCoc));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết phiếu cọc.");
      setSelected(null);
      setRefreshKey((value) => value + 1);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <PendingDepositQueue
        items={items}
        loading={loading}
        selectedId={selected?.maPhieuCoc ?? null}
        query={query}
        onSearch={setQuery}
        onSelect={(item) => void chonPhieuCoc(item)}
      />
      {detailLoading ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Đang tải chi tiết phiếu cọc...</p>
        </section>
      ) : !selected ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Chọn phiếu cọc để ghi nhận thanh toán.</p>
        </section>
      ) : (
        <PaymentProofForm
          key={selected.maPhieuCoc}
          deposit={selected}
          onDone={reloadQueue}
          onExpired={reloadQueue}
        />
      )}
    </div>
  );
}
