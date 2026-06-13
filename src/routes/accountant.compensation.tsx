import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import { CompensationPanel } from "@/components/contract/CompensationPanel";
import { SettlementQueue } from "@/components/contract/SettlementQueue";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/accountant/compensation")({
  component: AccountantCompensationPage,
});

function AccountantCompensationPage() {
  const allowed = useRoleGuard("accountant");
  const { contracts, assetRecoveries, getReconciliation } = useWorkflowStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Only show contracts that have an asset recovery record
  const items = useMemo(
    () =>
      contracts.filter(
        (c) =>
          c.status === "pending_settlement" &&
          assetRecoveries.some((a) => a.contractId === c.id),
      ),
    [contracts, assetRecoveries],
  );

  const reconciliations = useMemo(() => {
    const map: Record<string, ReturnType<typeof getReconciliation>> = {};
    items.forEach((c) => {
      map[c.id] = getReconciliation(c.id);
    });
    return map;
  }, [items, getReconciliation]);

  // Auto-select first if none selected
  const selected = items.find((i) => i.id === selectedId) ?? (items.length > 0 ? items[0] : null);

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/compensation">
      <div className="flex h-full overflow-hidden">
        <SettlementQueue
          items={items}
          reconciliations={reconciliations}
          filter="compensation"
          selectedId={selected?.id ?? null}
          onSelect={(c) => setSelectedId(c.id)}
          assetRecoveries={assetRecoveries}
        />
        {!selected ? (
          <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                Không có biên bản thu hồi nào cần lập hóa đơn.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Hóa đơn bồi thường chỉ xuất hiện khi Quản lý đã gửi biên bản thu hồi tài sản.
              </p>
            </div>
          </section>
        ) : (
          <CompensationPanel contract={selected} />
        )}
      </div>
    </RoleShell>
  );
}
