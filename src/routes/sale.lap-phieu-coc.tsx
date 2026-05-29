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

  return (
    <SaleShell currentPath="/sale/lap-phieu-coc" showWorkspaceNav>
      <div className="flex h-full overflow-hidden">
        <AppointmentQueue
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
        {!selected ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn khách hàng để lập phiếu cọc.</p>
          </section>
        ) : (
          <DepositForm
            appointment={selected}
            onDone={() => setSelected(null)}
          />
        )}
      </div>
    </SaleShell>
  );
}
