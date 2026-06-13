import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DepositList } from "@/features/deposits/components/DepositList";
import { ResidenceForm } from "@/features/handovers/components/ResidenceForm";
import { mockDeposits, type Deposit } from "@/features/deposits/model/mock-deposits";

export const Route = createFileRoute("/sale/ho-so-luu-tru")({
  component: SaleResidenceWorkspacePage,
});

function SaleResidenceWorkspacePage() {
  const [selected, setSelected] = useState<Deposit | null>(mockDeposits[0] ?? null);

  return (
    <div className="flex h-full overflow-hidden">
      <DepositList selectedId={selected?.id ?? null} onSelect={setSelected} />
      <ResidenceForm deposit={selected} />
    </div>
  );
}
