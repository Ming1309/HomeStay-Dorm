import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ContractPanel } from "@/features/contracts/components/ContractPanel";
import { ContractQueue } from "@/features/contracts/components/ContractQueue";
import { mockApprovedDeposits, type ContractDeposit } from "@/features/contracts/model/mock-contracts";

export const Route = createFileRoute("/sale/lap-hop-dong")({
  component: SaleContractWorkspacePage,
});

function SaleContractWorkspacePage() {
  const [items, setItems] = useState<ContractDeposit[]>(mockApprovedDeposits);
  const [selected, setSelected] = useState<ContractDeposit | null>(null);

  return (
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
  );
}
