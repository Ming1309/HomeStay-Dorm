import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ReconciliationPanel } from "@/features/deposits/components/ReconciliationPanel";
import { ReconciliationQueue } from "@/features/deposits/components/ReconciliationQueue";
import type { DepositRequest } from "@/app/providers/workflow-store";

export const Route = createFileRoute("/manager/confirm-deposit")({
  component: ManagerConfirmDepositPage,
});

function ManagerConfirmDepositPage() {
  const [selected, setSelected] = useState<DepositRequest | null>(null);

  return (
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
  );
}
