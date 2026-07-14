import { AlertCircle, Loader2, Search } from "lucide-react";

import type {
  ReconciliationApprovalQueueItem,
  ReconciliationResultType,
} from "@/features/settlements/services/reconciliation-approval-service";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`;

const resultLabel: Record<ReconciliationResultType, string> = {
  Hoan: "Hoàn khách",
  ThuThem: "Thu thêm",
  HoaVon: "Hòa vốn",
};

const resultTone: Record<ReconciliationResultType, string> = {
  Hoan: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  ThuThem: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  HoaVon: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

export function ReconciliationApprovalQueue({
  items,
  selectedId,
  query,
  loading,
  error,
  onQueryChange,
  onSelect,
  onRetry,
}: {
  items: ReconciliationApprovalQueueItem[];
  selectedId: string | null;
  query: string;
  loading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (maPDS: string) => void;
  onRetry: () => void;
}) {
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const filtered = items.filter(
    (item) =>
      !normalizedQuery ||
      [
        item.maPDS,
        item.maHD,
        item.maPhieuCoc,
        item.tenKhachHang,
        item.soDienThoai,
        item.phong,
      ].some((value) => value?.toLocaleLowerCase("vi").includes(normalizedQuery)),
  );

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900">PĐS chờ xác nhận</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          {loading ? "Đang tải..." : `${filtered.length} phiếu cần trao đổi với khách`}
        </p>
      </div>
      <div className="border-b border-gray-100 px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Tìm PĐS, khách, SĐT, phòng..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <Loader2 className="mx-auto mt-8 size-5 animate-spin text-gray-400" />
        ) : error ? (
          <div className="m-3 rounded-md border border-red-200 bg-red-50 p-3 text-center">
            <AlertCircle className="mx-auto size-5 text-red-600" />
            <p className="mt-2 text-xs text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 h-7 text-xs"
              onClick={onRetry}
            >
              Tải lại
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-400">Không có phiếu phù hợp.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <li key={item.maPDS}>
                <button
                  type="button"
                  onClick={() => onSelect(item.maPDS)}
                  className={cn(
                    "w-full border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                    selectedId === item.maPDS && "border-amber-500 bg-amber-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{item.maPDS}</span>
                    <Badge className={cn("text-[10px]", resultTone[item.loaiKetQua])}>
                      {resultLabel[item.loaiKetQua]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-semibold text-gray-900">
                    {item.tenKhachHang}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate">{item.soDienThoai || "Chưa có SĐT"}</span>
                    <span className="shrink-0">{item.phong}</span>
                  </div>
                  <div className="mt-1.5 flex items-end justify-between gap-2">
                    <span className="font-mono text-[11px] text-gray-500">
                      {item.maHD ?? item.maPhieuCoc}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        item.loaiKetQua === "Hoan" && "text-emerald-700",
                        item.loaiKetQua === "ThuThem" && "text-orange-700",
                      )}
                    >
                      {money(item.soTienKetQua)}
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
