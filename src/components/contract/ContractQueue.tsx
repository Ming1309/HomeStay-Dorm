import { Search, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ContractDeposit } from "@/lib/residence/mock-contracts";
import { useState } from "react";

type Props = {
  items: ContractDeposit[];
  selectedId: string | null;
  onSelect: (item: ContractDeposit) => void;
};

export function ContractQueue({ items, selectedId, onSelect }: Props) {
  const [q, setQ] = useState("");

  const filtered = items.filter((item) => {
    const s = q.toLowerCase().trim();
    if (!s) return true;
    return (
      item.code.toLowerCase().includes(s) ||
      item.representativeName.toLowerCase().includes(s) ||
      item.room.toLowerCase().includes(s)
    );
  });

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold tracking-tight text-gray-800">Chờ lập hợp đồng</h2>
        <p className="mt-0.5 text-xs text-gray-400">{filtered.length} hồ sơ đã duyệt</p>
      </div>

      {/* Search */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm mã phiếu, tên, phòng..."
            className="h-8 border-gray-200 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            Không tìm thấy hồ sơ nào.
          </div>
        )}
        <ul className="divide-y divide-gray-100">
          {filtered.map((item) => {
            const active = item.id === selectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group relative flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-emerald-50/60",
                    active && "border-l-emerald-500 bg-emerald-50 hover:bg-emerald-50",
                  )}
                >
                  {/* Row 1 */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">#{item.code}</span>
                    <Badge className="h-5 border-transparent bg-emerald-100 px-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
                      Đã duyệt
                    </Badge>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-1.5">
                    <User className="size-3 shrink-0 text-gray-400" />
                    <span className="truncate text-sm font-semibold text-gray-800">
                      {item.representativeName}
                    </span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-600">
                      {item.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {item.membersCount} người
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
