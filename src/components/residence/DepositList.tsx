import { Search, Lock } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mockDeposits, type Deposit } from "@/lib/residence/mock-deposits";

type Props = {
  selectedId: string | null;
  onSelect: (d: Deposit) => void;
};

export function DepositList({ selectedId, onSelect }: Props) {
  const [q, setQ] = useState("");
  const filtered = mockDeposits.filter((d) => {
    const s = q.toLowerCase().trim();
    if (!s) return true;
    return (
      d.code.toLowerCase().includes(s) ||
      d.customerName.toLowerCase().includes(s) ||
      d.phone.includes(s) ||
      d.room.toLowerCase().includes(s)
    );
  });

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Phiếu cọc chờ nhận phòng</h2>
        <p className="text-xs text-muted-foreground">{filtered.length} phiếu hôm nay</p>
      </div>
      <div className="sticky top-0 z-10 border-b bg-card px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm mã, tên, SĐT, phòng..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            Không tìm thấy phiếu cọc.
          </div>
        )}
        <ul className="divide-y">
          {filtered.map((d) => {
            const active = d.id === selectedId;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onSelect(d)}
                  className={cn(
                    "group relative flex w-full flex-col gap-1 border-l-2 border-transparent px-4 py-2.5 text-left transition-colors hover:bg-accent/60",
                    active && "border-l-primary bg-primary/5 hover:bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">#{d.code}</span>
                    <Badge className="h-5 border-transparent bg-success px-1.5 text-[10px] font-medium text-success-foreground hover:bg-success">
                      <Lock className="mr-0.5 size-2.5" />
                      Đã thanh toán
                    </Badge>
                  </div>
                  <div className="truncate text-sm font-medium">{d.customerName}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{d.phone}</span>
                    <span className="flex items-center gap-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                        {d.room}
                      </span>
                      <span className="tabular-nums">{d.time}</span>
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
