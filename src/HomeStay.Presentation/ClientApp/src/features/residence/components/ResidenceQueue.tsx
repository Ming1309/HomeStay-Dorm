import { Lock, Search } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { PhieuCocSummary } from "@/features/residence/services/residence-service";

export function ResidenceQueue({
  items,
  selectedId,
  loading,
  onSearch,
  onSelect,
}: {
  items: PhieuCocSummary[];
  selectedId: string | null;
  loading: boolean;
  onSearch: (value: string) => void;
  onSelect: (item: PhieuCocSummary) => void;
}) {
  return (
    <aside className="flex h-full w-[344px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-5 py-5">
        <h2 className="text-base font-bold tracking-tight text-gray-900">Phiếu cọc chờ nhận phòng</h2>
        <p className="mt-1 text-sm text-gray-500">{items.length} phiếu hôm nay</p>
      </div>
      <div className="sticky top-0 z-10 bg-white px-4 pb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm mã, tên, SĐT, phòng..."
            className="h-10 rounded-lg border-gray-200 bg-white pl-10 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">Đang tải danh sách...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">Không có phiếu cọc chờ nhận phòng hôm nay.</div>
        ) : (
          <ul className="space-y-2 px-3 pb-4">
            {items.map((item) => (
              <li key={item.maPhieuCoc}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group relative flex w-full flex-col gap-2 rounded-lg border border-transparent border-l-2 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                    selectedId === item.maPhieuCoc && "border-blue-200 border-l-blue-600 bg-blue-50/70 hover:bg-blue-50/70",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-blue-600">#{item.maPhieuCoc}</span>
                    <Badge className="h-6 border-transparent bg-emerald-50 px-2 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50">
                      <Lock className="mr-1 size-3" />
                      Đã thanh toán
                    </Badge>
                  </div>
                  <div>
                    <div className="truncate text-sm font-bold text-gray-900">{item.hoTenKhachHang}</div>
                    <div className="mt-1 text-sm text-gray-700">{item.sdt}</div>
                  </div>
                  <div className="flex items-center gap-5 text-xs text-gray-600">
                    <span className="font-mono">{item.soPhong}</span>
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
