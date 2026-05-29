import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkflowStore, type DepositRequest } from "@/lib/workflow-store";

const depositStatusLabels: Record<string, string> = {
  pending_payment: "Chờ thanh toán",
  supplement_required: "Cần bổ sung",
};

const depositStatusBadge: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  supplement_required: "bg-rose-100 text-rose-700",
};

export function PendingDepositQueue({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (item: DepositRequest) => void;
}) {
  const { depositRequests } = useWorkflowStore();
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const relevant = depositRequests.filter(
      (d) => d.status === "pending_payment" || d.status === "supplement_required",
    );
    if (!query.trim()) return relevant;
    const q = query.trim().toLowerCase();
    return relevant.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.room.toLowerCase().includes(q),
    );
  }, [depositRequests, query]);

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Ghi nhận thanh toán</h2>
        <p className="mt-0.5 text-xs text-gray-400">{items.length} phiếu chờ thanh toán</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm phiếu..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-gray-400">
            Không có phiếu cọc nào chờ thanh toán.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                    selectedId === item.id && "border-l-amber-500 bg-amber-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{item.code}</span>
                    <Badge
                      className={cn("h-5 text-[10px]", depositStatusBadge[item.status] ?? "")}
                    >
                      {depositStatusLabels[item.status] ?? item.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.customerName}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-mono">{item.room}</span>
                    {item.depositAmount != null && (
                      <span className="font-mono">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.depositAmount)}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
