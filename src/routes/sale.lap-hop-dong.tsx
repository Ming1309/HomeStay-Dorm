import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SaleShell } from "@/components/app/SaleShell";
import { ContractPanel } from "@/components/contract/ContractPanel";
import { ContractQueue } from "@/components/contract/ContractQueue";
import { mockApprovedDeposits, type ContractDeposit } from "@/lib/residence/mock-contracts";

export const Route = createFileRoute("/sale/lap-hop-dong")({
  component: SaleContractWorkspacePage,
});

function SaleContractWorkspacePage() {
  const [items, setItems] = useState<ContractDeposit[]>(mockApprovedDeposits);
  const [selected, setSelected] = useState<ContractDeposit | null>(null);

  return (
    <SaleShell currentPath="/sale/lap-hop-dong" showWorkspaceNav>
      <div className="flex h-full overflow-hidden">
        <ContractQueue items={items} selectedId={selected?.id ?? null} onSelect={setSelected} />
        <ContractPanel
          deposit={selected}
          onCancelContract={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
            setSelected(null);
          }}
          onConfirmSigned={(id) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
            setSelected(null);
          }}
        />
      </div>
    </SaleShell>
  );
}
