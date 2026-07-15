import { Search } from "lucide-react";

import type { ReconciliationDeposit } from "@/features/deposits/services/deposit-reconciliation-service";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function ReconciliationQueue({
  items,
  selectedId,
  query,
  loading,
  onQueryChange,
  onSelect,
}: {
  items: ReconciliationDeposit[];
  selectedId: string | null;
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSelect: (item: ReconciliationDeposit) => void;
}) {
  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Đối chiếu tiền cọc</h2>
        <p className="mt-0.5 text-xs text-gray-400">
          {loading ? "Đang tải..." : `${items.length} phiếu chờ xử lý`}
        </p>
      </div>
      <div className="border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Mã phiếu, khách hàng, phòng..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!loading && items.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-gray-400">
            Không có phiếu cọc nào chờ đối chiếu.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.maPhieuCoc}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                    selectedId === item.maPhieuCoc && "border-l-amber-500 bg-amber-50",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {item.maPhieuCoc}
                    </span>
                    <Badge className="bg-amber-100 text-[10px] text-amber-700">Chờ đối chiếu</Badge>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.hoTenKhachHang}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      P. {item.soPhong}
                      {item.toaNha ? ` • ${item.toaNha}` : ""}
                    </span>
                    <span className="font-semibold text-gray-700">
                      {formatCurrency(item.tongTien)}
                    </span>
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
