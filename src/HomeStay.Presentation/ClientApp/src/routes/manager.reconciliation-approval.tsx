import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ReconciliationApprovalPanel } from "@/features/settlements/components/ReconciliationApprovalPanel";
import { ReconciliationApprovalQueue } from "@/features/settlements/components/ReconciliationApprovalQueue";
import {
  loadReconciliationApprovalDetail,
  loadReconciliationApprovalQueue,
  type ReconciliationApprovalDetail,
  type ReconciliationApprovalQueueItem,
} from "@/features/settlements/services/reconciliation-approval-service";

export const Route = createFileRoute("/manager/reconciliation-approval")({
  component: ManagerReconciliationApprovalPage,
});

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

function ManagerReconciliationApprovalPage() {
  const [items, setItems] = useState<ReconciliationApprovalQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReconciliationApprovalDetail | null>(null);
  const [query, setQuery] = useState("");
  const [queueLoading, setQueueLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailVersion, setDetailVersion] = useState(0);

  const reloadQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const data = await loadReconciliationApprovalQueue();
      setItems(data);
      setSelectedId((current) =>
        current && data.some((item) => item.maPDS === current) ? current : null,
      );
    } catch (caught) {
      setItems([]);
      setSelectedId(null);
      setDetail(null);
      setQueueError(errorMessage(caught, "Không thể tải hàng đợi xác nhận đối soát."));
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadQueue();
  }, [reloadQueue]);

  useEffect(() => {
    setDetail(null);
    setDetailError(null);
    if (!selectedId) {
      setDetailLoading(false);
      return;
    }

    const controller = new AbortController();
    setDetailLoading(true);
    void loadReconciliationApprovalDetail(selectedId, controller.signal)
      .then(setDetail)
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setDetailError(errorMessage(caught, "Không thể tải chi tiết phiếu đối soát."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selectedId, detailVersion]);

  const reloadDetail = useCallback(() => {
    if (!selectedId) return;
    setDetailVersion((current) => current + 1);
  }, [selectedId]);

  const finishAndReload = useCallback(async () => {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
    await reloadQueue();
  }, [reloadQueue]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ReconciliationApprovalQueue
        items={items}
        selectedId={selectedId}
        query={query}
        loading={queueLoading}
        error={queueError}
        onQueryChange={setQuery}
        onSelect={setSelectedId}
        onRetry={() => void reloadQueue()}
      />
      <ReconciliationApprovalPanel
        detail={detail}
        loading={detailLoading}
        error={detailError}
        onRetry={reloadDetail}
        onConfirmed={finishAndReload}
        onConflict={finishAndReload}
      />
    </div>
  );
}
