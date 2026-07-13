import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { CompensationPanel } from "@/features/settlements/components/CompensationPanel";
import {
  formatDateVi,
  loadBienBanChuaXuLy,
  type BienBanThuHoiChuaXuLy,
} from "@/features/settlements/services/compensation-invoice-service";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/accountant/compensation")({
  component: AccountantCompensationPage,
});

function AccountantCompensationPage() {
  const [items, setItems] = useState<BienBanThuHoiChuaXuLy[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const loadList = useCallback(async (text?: string) => {
    setLoading(true);
    try {
      const data = await loadBienBanChuaXuLy(text);
      setItems(data);
      setSelectedId((current) => {
        if (current && data.some((x) => x.maBienBan === current)) return current;
        return data.length > 0 ? data[0].maBienBan : null;
      });
    } catch (err) {
      toast.error("Không thể tải danh sách biên bản thu hồi", {
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

  // Debounced search
  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadList(query);
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, loadList]);

  const selected = useMemo(
    () => items.find((i) => i.maBienBan === selectedId) ?? null,
    [items, selectedId],
  );

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-900">Chờ lập hóa đơn bồi thường</h2>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Biên bản thu hồi có hư hỏng/mất mát chưa xử lý
          </p>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm mã BB, HĐ, khách..."
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-rose-500" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-gray-400">
              Không có biên bản thu hồi nào cần lập hóa đơn.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {items.map((item) => {
                const active = item.maBienBan === selectedId;
                const phong = item.toaNha
                  ? `${item.toaNha} - ${item.soPhong}`
                  : item.soPhong;
                return (
                  <li key={item.maBienBan}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.maBienBan)}
                      className={cn(
                        "w-full border-l-4 px-4 py-3 text-left transition-colors",
                        active
                          ? "border-l-rose-500 bg-rose-50"
                          : "border-l-transparent hover:bg-rose-50/60",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-rose-700">
                          {item.maBienBan}
                        </span>
                        <Badge className="h-5 bg-rose-100 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                          Chưa xử lý
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                        {item.tenKhachHang}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {phong}
                        <span className="mx-1 text-gray-300">·</span>
                        <span className="font-mono">{item.maHD}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {formatDateVi(item.ngayBanGiao)}
                        {item.tenNguoiLap ? ` · ${item.tenNguoiLap}` : ""}
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
        <section className="flex h-full flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">
              Không có biên bản thu hồi nào cần lập hóa đơn.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Hóa đơn bồi thường chỉ xuất hiện khi Quản lý đã gửi biên bản thu hồi tài sản
              có hư hỏng/mất mát.
            </p>
          </div>
        </section>
      ) : (
        <CompensationPanel
          maBienBan={selected.maBienBan}
          onIssued={() => {
            void loadList(query);
          }}
        />
      )}
    </div>
  );
}
