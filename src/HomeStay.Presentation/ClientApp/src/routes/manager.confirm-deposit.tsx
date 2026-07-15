import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { ReconciliationPanel } from "@/features/deposits/components/ReconciliationPanel";
import { ReconciliationQueue } from "@/features/deposits/components/ReconciliationQueue";
import {
  loadReconciliationDeposits,
  loadReconciliationDetail,
  type ReconciliationDeposit,
  type ReconciliationDetail,
} from "@/features/deposits/services/deposit-reconciliation-service";

export const Route = createFileRoute("/manager/confirm-deposit")({
  component: ManagerConfirmDepositPage,
});

function ManagerConfirmDepositPage() {
  const [items, setItems] = useState<ReconciliationDeposit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("maPhieuCoc"),
  );
  const [detail, setDetail] = useState<ReconciliationDetail | null>(null);
  const [query, setQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingList(true);
      try {
        setItems(await loadReconciliationDeposits(query, controller.signal));
      } catch (error) {
        if (!controller.signal.aborted)
          toast.error(
            error instanceof Error ? error.message : "Không thể tải danh sách phiếu cọc.",
          );
      } finally {
        if (!controller.signal.aborted) setLoadingList(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, refreshKey]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    const controller = new AbortController();
    setLoadingDetail(true);
    loadReconciliationDetail(selectedId, controller.signal)
      .then(setDetail)
      .catch((error) => {
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết phiếu cọc.");
          setSelectedId(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false);
      });
    return () => controller.abort();
  }, [selectedId]);

  const completeAction = () => {
    setSelectedId(null);
    setDetail(null);
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <ReconciliationQueue
        items={items}
        selectedId={selectedId}
        query={query}
        loading={loadingList}
        onQueryChange={setQuery}
        onSelect={(item) => setSelectedId(item.maPhieuCoc)}
      />
      {!selectedId ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Chọn phiếu cọc để đối chiếu.</p>
        </section>
      ) : loadingDetail || !detail ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
        </section>
      ) : (
        <ReconciliationPanel deposit={detail} onDone={completeAction} />
      )}
    </div>
  );
}
