import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SaleShell } from "@/components/app/SaleShell";
import { AppointmentQueue } from "@/components/residence/AppointmentQueue";
import { DepositForm } from "@/components/residence/DepositForm";
import type { Appointment } from "@/lib/workflow-store";

export const Route = createFileRoute("/sale/lap-phieu-coc")({
  component: SaleDepositWorkspacePage,
});

function SaleDepositWorkspacePage() {
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [processedIds, setProcessedIds] = useState<string[]>([]);

  return (
    <SaleShell currentPath="/sale/lap-phieu-coc" showWorkspaceNav>
      <div className="flex h-full overflow-hidden">
        <AppointmentQueue
          selectedId={selected?.id ?? null}
          excludedIds={processedIds}
          onSelect={setSelected}
        />
        {!selected ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn khách hàng để lập phiếu cọc.</p>
          </section>
        ) : (
          <DepositForm
            appointment={selected}
            onDone={(appointmentId) => {
              setProcessedIds((prev) => [...prev, appointmentId]);
              setSelected(null);
            }}
          />
        )}
      </div>
    </SaleShell>
  );
}
