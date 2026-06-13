import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DepositCalcPanel } from "@/features/deposits/components/DepositCalcPanel";
import { DepositQueue } from "@/features/deposits/components/DepositQueue";
import type { DepositRequest } from "@/app/providers/workflow-store";

export const Route = createFileRoute("/accountant/deposit-calc")({
  component: AccountantDepositCalcPage,
});

function AccountantDepositCalcPage() {
  const [selected, setSelected] = useState<DepositRequest | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      <DepositQueue selectedId={selected?.id ?? null} onSelect={setSelected} />
      {!selected ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Chọn phiếu cọc để tính tiền.</p>
        </section>
      ) : (
        <DepositCalcPanel deposit={selected} />
      )}
    </div>
  );
}
