import { Search } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { DepositInitialSummary } from "@/features/deposits/services/deposit-calc-service";

export function DepositQueue({
  items,
  selectedId,
  loading,
  onSearch,
  onSelect,
}: {
  items: DepositInitialSummary[];
  selectedId: string | null;
  loading: boolean;
  onSearch: (value: string) => void;
  onSelect: (item: DepositInitialSummary) => void;
}) {
  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Tính tiền cọc</h2>
        <p className="mt-0.5 text-xs text-gray-400">{items.length} phiếu chờ tính</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm phiếu..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-400">Đang tải danh sách...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            Không có phiếu cọc nào chờ tính tiền.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.maPhieuCoc}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-blue-50/60",
                    selectedId === item.maPhieuCoc && "border-l-blue-500 bg-blue-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {item.maPhieuCoc}
                    </span>
                    <Badge className="h-5 bg-gray-100 text-[10px] text-gray-600">Khởi tạo</Badge>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.hoTenKhachHang}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-mono">P. {item.soPhong}</span>
                    <span>{new Date(item.thoiDiemCoc).toLocaleDateString("vi-VN")}</span>
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
