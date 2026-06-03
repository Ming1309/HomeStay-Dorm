import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { SettlementQueue } from "@/components/contract/SettlementQueue";
import { RefundVoucherPanel } from "@/components/contract/RefundVoucherPanel";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/accountant/refunds")({
  component: AccountantRefundsPage,
});

function AccountantRefundsPage() {
  const allowed = useRoleGuard("accountant");
  const { contracts, getReconciliation } = useWorkflowStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useMemo(() => {
    return contracts.filter((c) => {
      if (c.status !== "pending_settlement") return false;
      const recon = getReconciliation(c.id);
      return (recon?.netRefund ?? 0) > 0;
    });
  }, [contracts, getReconciliation]);

  const reconciliations = useMemo(() => {
    const map: Record<string, ReturnType<typeof getReconciliation>> = {};
    items.forEach((c) => {
      map[c.id] = getReconciliation(c.id);
    });
    return map;
  }, [items, getReconciliation]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/refunds">
      <div className="flex h-full overflow-hidden">
        <SettlementQueue
          items={items}
          reconciliations={reconciliations}
          filter="refund"
          selectedId={selectedId}
          onSelect={(c) => setSelectedId(c.id)}
        />
        {!selected ? (
          <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">
              Không có hợp đồng nào cần hoàn cọc (cọc được hoàn lớn hơn chi phí phát sinh).
            </p>
          </section>
        ) : (
          <RefundVoucherPanel contract={selected} />
        )}
      </div>
    </RoleShell>
  );
}
