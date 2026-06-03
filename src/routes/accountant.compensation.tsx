import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { CompensationPanel } from "@/components/contract/CompensationPanel";
import { SettlementQueue } from "@/components/contract/SettlementQueue";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/accountant/compensation")({
  component: AccountantCompensationPage,
});

function AccountantCompensationPage() {
  const allowed = useRoleGuard("accountant");
  const { contracts, getReconciliation } = useWorkflowStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useMemo(
    () => contracts.filter((c) => c.status === "pending_settlement"),
    [contracts],
  );
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const reconciliations = useMemo(() => {
    const map: Record<string, ReturnType<typeof getReconciliation>> = {};
    items.forEach((c) => {
      map[c.id] = getReconciliation(c.id);
    });
    return map;
  }, [items, getReconciliation]);

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/compensation">
      <div className="flex h-full overflow-hidden">
        <SettlementQueue
          items={items}
          reconciliations={reconciliations}
          filter="compensation"
          selectedId={selectedId}
          onSelect={(c) => setSelectedId(c.id)}
        />
        {!selected ? (
          <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn hợp đồng để lập hóa đơn bồi thường.</p>
          </section>
        ) : (
          <CompensationPanel contract={selected} />
        )}
      </div>
    </RoleShell>
  );
}
