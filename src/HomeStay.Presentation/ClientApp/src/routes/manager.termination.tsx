import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { TerminationPanel } from "@/features/settlements/components/TerminationPanel";
import {
  formatCurrencyVnd,
  formatDateVi,
  formatPhong,
  loadDanhSachChoThanhLy,
  type HopDongChoThanhLy,
} from "@/features/settlements/services/termination-service";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/manager/termination")({
  component: ManagerTerminationPage,
});

function ManagerTerminationPage() {
  const [items, setItems] = useState<HopDongChoThanhLy[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async (text?: string) => {
    setLoading(true);
    try {
      const data = await loadDanhSachChoThanhLy(text);
      setItems(data);
      setSelectedId((current) => {
        if (current && data.some((x) => x.maHD === current)) return current;
        return data.length > 0 ? data[0].maHD : null;
      });
    } catch (err) {
      toast.error("Không thể tải danh sách hợp đồng chờ thanh lý", {
        description: err instanceof Error ? err.message : undefined,
      });
      setItems([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadList(query);
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, loadList]);

  const selected = useMemo(
    () => items.find((i) => i.maHD === selectedId) ?? null,
    [items, selectedId],
  );

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-900">Chờ thanh lý hợp đồng</h2>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Hợp đồng đã có phiếu đối soát, chờ Quản lý chốt thanh lý
          </p>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm mã HĐ, khách, phòng..."
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-slate-500" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-gray-400">
              Không có hợp đồng nào chờ thanh lý.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {items.map((item) => {
                const active = item.maHD === selectedId;
                const resultLabel =
                  item.tienThuThem > 0
                    ? `Thu thêm: ${formatCurrencyVnd(item.tienThuThem)}`
                    : item.tienHoan > 0
                      ? `Hoàn: ${formatCurrencyVnd(item.tienHoan)}`
                      : "Hòa vốn";
                return (
                  <li key={item.maHD}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.maHD)}
                      className={cn(
                        "w-full border-l-4 px-4 py-3 text-left transition-colors",
                        active
                          ? "border-l-slate-500 bg-slate-50"
                          : "border-l-transparent hover:bg-slate-50/60",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {item.maHD}
                        </span>
                        <Badge
                          className={cn(
                            "h-5 text-[10px] font-semibold hover:bg-inherit",
                            item.coTheThanhLy
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {item.coTheThanhLy ? "Sẵn sàng" : "Còn nợ"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                        {item.tenKhachHang}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatPhong(item.toaNha, item.soPhong)}
                        <span className="mx-1 text-gray-300">·</span>
                        <span className="font-mono">{item.maPDS}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {resultLabel}
                        <span className="mx-1 text-gray-300">·</span>
                        {formatDateVi(item.ngayKetThuc)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {!selected ? (
        <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Chọn hợp đồng để thanh lý.</p>
            <p className="mt-1 text-xs text-gray-400">
              Danh sách gồm các hợp đồng đang hiệu lực đã có phiếu đối soát.
            </p>
          </div>
        </section>
      ) : (
        <TerminationPanel
          maHD={selected.maHD}
          onTerminated={() => {
            void loadList(query);
          }}
        />
      )}
    </div>
  );
}
