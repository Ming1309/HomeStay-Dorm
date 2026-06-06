import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import { ReconciliationPanel } from "@/components/contract/ReconciliationPanel";
import { ReconciliationQueue } from "@/components/contract/ReconciliationQueue";
import type { DepositRequest } from "@/lib/workflow-store";

export const Route = createFileRoute("/manager/confirm-deposit")({
  component: ManagerConfirmDepositPage,
});

function ManagerConfirmDepositPage() {
  const allowed = useRoleGuard("manager");
  const [selected, setSelected] = useState<DepositRequest | null>(null);

  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath="/manager/confirm-deposit">
      <div className="flex h-full overflow-hidden">
        <ReconciliationQueue selectedId={selected?.id ?? null} onSelect={setSelected} />
        {!selected ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn phiếu cọc để đối chiếu.</p>
          </section>
        ) : (
          <ReconciliationPanel deposit={selected} onDone={() => setSelected(null)} />
        )}
      </div>
    </RoleShell>
  );
}
