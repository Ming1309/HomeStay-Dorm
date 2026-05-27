import { useState } from "react";
import { Building2, Bell, UserCircle2 } from "lucide-react";
import { DepositList } from "./DepositList";
import { ResidenceForm } from "./ResidenceForm";
import type { Deposit } from "@/lib/residence/mock-deposits";

export function ResidenceCheckInPage() {
  const [selected, setSelected] = useState<Deposit | null>(null);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Topbar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <span className="text-sm font-semibold">Quản lý lưu trú</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Tiếp nhận khách</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Nhập hồ sơ lưu trú</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button className="rounded p-1 hover:bg-accent" aria-label="Thông báo">
            <Bell className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <UserCircle2 className="size-5" />
            <span className="text-sm font-medium text-foreground">NV. Sale</span>
          </div>
        </div>
      </header>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        <DepositList selectedId={selected?.id ?? null} onSelect={setSelected} />
        <ResidenceForm deposit={selected} />
      </div>
    </div>
  );
}
