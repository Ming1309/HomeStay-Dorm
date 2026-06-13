import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PaymentProofForm } from "@/features/deposits/components/PaymentProofForm";
import { PendingDepositQueue } from "@/features/deposits/components/PendingDepositQueue";
import type { DepositRequest } from "@/app/providers/workflow-store";

export const Route = createFileRoute("/sale/ghi-nhan-coc")({
  component: SalePaymentProofPage,
});

function SalePaymentProofPage() {
  const [selected, setSelected] = useState<DepositRequest | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      <PendingDepositQueue selectedId={selected?.id ?? null} onSelect={setSelected} />
      {!selected ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Chọn phiếu cọc để ghi nhận thanh toán.</p>
        </section>
      ) : (
        <PaymentProofForm deposit={selected} onDone={() => setSelected(null)} />
      )}
    </div>
  );
}
