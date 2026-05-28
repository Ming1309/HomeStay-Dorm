import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SaleShell } from "@/components/app/SaleShell";
import { DepositList } from "@/components/residence/DepositList";
import { ResidenceForm } from "@/components/residence/ResidenceForm";
import type { Deposit } from "@/lib/residence/mock-deposits";

export const Route = createFileRoute("/sale/ho-so-luu-tru")({
  component: SaleResidenceWorkspacePage,
});

function SaleResidenceWorkspacePage() {
  const [selected, setSelected] = useState<Deposit | null>(null);

  return (
    <SaleShell currentPath="/sale/ho-so-luu-tru" showWorkspaceNav>
      <div className="flex h-full overflow-hidden">
        <DepositList selectedId={selected?.id ?? null} onSelect={setSelected} />
        <ResidenceForm deposit={selected} />
      </div>
    </SaleShell>
  );
}
