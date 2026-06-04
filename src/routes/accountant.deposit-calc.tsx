import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { DepositCalcPanel } from "@/components/contract/DepositCalcPanel";
import { DepositQueue } from "@/components/contract/DepositQueue";
import type { DepositRequest } from "@/lib/workflow-store";

export const Route = createFileRoute("/accountant/deposit-calc")({
  component: AccountantDepositCalcPage,
});

function AccountantDepositCalcPage() {
  const allowed = useRoleGuard("accountant");
  const [selected, setSelected] = useState<DepositRequest | null>(null);

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/deposit-calc">
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
    </RoleShell>
  );
}
