import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ResidenceQueue } from "@/features/residence/components/ResidenceQueue";
import { ResidenceForm } from "@/features/handovers/components/ResidenceForm";
import {
  layDanhSachChoNhap,
  layChiTiet,
  type PhieuCocDetail,
  type PhieuCocSummary,
} from "@/features/residence/services/residence-service";

export const Route = createFileRoute("/sale/ho-so-luu-tru")({
  component: SaleResidenceWorkspacePage,
});

function SaleResidenceWorkspacePage() {
  const [items, setItems] = useState<PhieuCocSummary[]>([]);
  const [selected, setSelected] = useState<PhieuCocDetail | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const taiDanhSach = async (text: string) => {
    setLoading(true);
    try {
      setItems(await layDanhSachChoNhap(text));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách phiếu cọc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void taiDanhSach(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("maPhieuCoc");
    if (target) void layChiTiet(target).then(setSelected).catch(() => toast.error("Phiếu cọc không còn chờ nhập hồ sơ."));
  }, []);

  const chonPhieuCoc = async (item: PhieuCocSummary) => {
    try {
      setSelected(await layChiTiet(item.maPhieuCoc));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết phiếu cọc.");
    }
  };

  const xuLySauKhiLuu = () => {
    setSelected(null);
    void taiDanhSach(query);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <ResidenceQueue
        items={items}
        loading={loading}
        selectedId={selected?.maPhieuCoc ?? null}
        onSearch={setQuery}
        onSelect={chonPhieuCoc}
      />
      {!selected ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Chọn phiếu cọc từ danh sách bên trái để bắt đầu nhập hồ sơ lưu trú.</p>
        </section>
      ) : (
        <ResidenceForm deposit={selected} onSaved={xuLySauKhiLuu} />
      )}
    </div>
  );
}
