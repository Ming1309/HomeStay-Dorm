import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ContractItem, ReconciliationResult } from "@/lib/workflow-store";

export type SettlementQueueFilter = "compensation" | "receipt" | "refund" | "termination";

const filterConfig: Record<
  SettlementQueueFilter,
  { title: string; emptyHint: string; variant: "rose" | "emerald" | "amber" | "slate" }
> = {
  compensation: {
    title: "Chờ lập hóa đơn bồi thường",
    emptyHint: "Không có hợp đồng nào chờ lập hóa đơn bồi thường.",
    variant: "rose",
  },
  receipt: {
    title: "Chờ lập phiếu thu",
    emptyHint: "Không có hợp đồng nào chờ lập phiếu thu.",
    variant: "amber",
  },
  refund: {
    title: "Chờ lập phiếu hoàn cọc",
    emptyHint: "Không có hợp đồng nào chờ hoàn cọc.",
    variant: "emerald",
  },
  termination: {
    title: "Chờ thanh lý hợp đồng",
    emptyHint: "Không có hợp đồng nào chờ thanh lý.",
    variant: "slate",
  },
};

const variantActiveClass: Record<keyof typeof filterConfig, string> = {
  compensation: "border-l-rose-500 bg-rose-50",
  receipt: "border-l-amber-500 bg-amber-50",
  refund: "border-l-emerald-500 bg-emerald-50",
  termination: "border-l-slate-500 bg-slate-50",
};

const variantHoverClass: Record<keyof typeof filterConfig, string> = {
  compensation: "hover:bg-rose-50/60",
  receipt: "hover:bg-amber-50/60",
  refund: "hover:bg-emerald-50/60",
  termination: "hover:bg-slate-50/60",
};

const variantBadgeClass: Record<keyof typeof filterConfig, string> = {
  compensation: "bg-rose-100 text-rose-700",
  receipt: "bg-amber-100 text-amber-700",
  refund: "bg-emerald-100 text-emerald-700",
  termination: "bg-slate-200 text-slate-700",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

export function SettlementQueue({
  items,
  reconciliations,
  filter,
  selectedId,
  onSelect,
}: {
  items: ContractItem[];
  reconciliations: Record<string, ReconciliationResult | null>;
  filter: SettlementQueueFilter;
  selectedId: string | null;
  onSelect: (item: ContractItem) => void;
}) {
  const [query, setQuery] = useState("");
  const config = filterConfig[filter];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">{config.title}</h2>
        <p className="mt-0.5 text-xs text-gray-400">{filtered.length} hợp đồng cần xử lý</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm hợp đồng, khách, phòng..."
            className="h-8 border-gray-200 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-xs text-gray-400">
            {config.emptyHint}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((item) => {
              const recon = reconciliations[item.id];
              const highlight =
                filter === "refund" && recon
                  ? `Hoàn: ${formatCurrency(recon.netRefund)}`
                  : filter === "receipt" && recon
                    ? `Thu thêm: ${formatCurrency(recon.additionalDue)}`
                    : filter === "termination" && recon
                      ? `Hoàn: ${formatCurrency(recon.netRefund)}`
                      : `Cọc: ${formatCurrency(item.invoiceTotal)}`;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left",
                      variantHoverClass[filter],
                      selectedId === item.id && variantActiveClass[filter],
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{item.id}</span>
                      <Badge
                        className={cn(
                          "h-5 text-[10px] font-semibold",
                          variantBadgeClass[filter],
                        )}
                      >
                        {item.status === "liquidated" ? "Đã thanh lý" : "Chờ quyết toán"}
                      </Badge>
                    </div>
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {item.customerName}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-500">{item.room}</span>
                      <span
                        className={cn(
                          "font-semibold",
                          filter === "receipt" && recon && recon.additionalDue > 0
                            ? "text-rose-700"
                            : "text-gray-700",
                        )}
                      >
                        {highlight}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
