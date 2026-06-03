import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { SettlementQueue } from "@/components/contract/SettlementQueue";
import { TerminationPanel } from "@/components/contract/TerminationPanel";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/manager/termination")({
  component: ManagerTerminationPage,
});

function ManagerTerminationPage() {
  const allowed = useRoleGuard("manager");
  const { contracts, getReconciliation } = useWorkflowStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useMemo(
    () =>
      contracts.filter(
        (c) => c.status === "pending_settlement" || c.status === "liquidated",
      ),
    [contracts],
  );

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
    <RoleShell role="manager" currentPath="/manager/termination">
      <div className="flex h-full overflow-hidden">
        <SettlementQueue
          items={items}
          reconciliations={reconciliations}
          filter="termination"
          selectedId={selectedId}
          onSelect={(c) => setSelectedId(c.id)}
        />
        {!selected ? (
          <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn hợp đồng để thanh lý.</p>
          </section>
        ) : (
          <TerminationPanel contract={selected} />
        )}
      </div>
    </RoleShell>
  );
}
