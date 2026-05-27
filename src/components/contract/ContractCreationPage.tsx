import { useState } from "react";
import { Bell, Building2, PenLine, UserCircle2 } from "lucide-react";

import {
  mockApprovedDeposits,
  type ContractDeposit,
} from "@/lib/residence/mock-contracts";
import { ContractQueue } from "./ContractQueue";
import { ContractPanel } from "./ContractPanel";

export function ContractCreationPage() {
  const [items, setItems] = useState<ContractDeposit[]>(mockApprovedDeposits);
  const [selected, setSelected] = useState<ContractDeposit | null>(null);

  const handleCancelContract = (id: string) => {
    // Reset selection and remove from list
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelected(null);
  };

  const handleConfirmSigned = (id: string) => {
    // Contract is complete, remove from pending list
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelected(null);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">
            Quản lý lưu trú
          </span>
          <span className="text-gray-300">/</span>
          <PenLine className="size-4 text-emerald-500" />
          <span className="text-sm font-medium text-gray-600">
            Lập hợp đồng thuê
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Thông báo"
          >
            <Bell className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <UserCircle2 className="size-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sale</span>
          </div>
        </div>
      </header>

      {/* ── Split view ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <ContractQueue
          items={items}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
        <ContractPanel
          deposit={selected}
          onCancelContract={handleCancelContract}
          onConfirmSigned={handleConfirmSigned}
        />
      </div>
    </div>
  );
}
