import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
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

  // Only show contracts with a settled reconciliation that has a positive netRefund
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

  // Auto-select first item if nothing selected
  const selected = items.find((i) => i.id === selectedId) ?? (items.length > 0 ? items[0] : null);

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/refunds">
      <div className="flex h-full overflow-hidden">
        <SettlementQueue
          items={items}
          reconciliations={reconciliations}
          filter="refund"
          selectedId={selected?.id ?? null}
          onSelect={(c) => setSelectedId(c.id)}
        />
        {!selected ? (
          <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                Không có phiếu đối soát nào cần lập phiếu hoàn cọc.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Phiếu hoàn cọc chỉ xuất hiện khi phiếu đối soát đã được chốt và còn dư cọc.
              </p>
            </div>
          </section>
        ) : (
          <RefundVoucherPanel contract={selected} />
        )}
      </div>
    </RoleShell>
  );
}
