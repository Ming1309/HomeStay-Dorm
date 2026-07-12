import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DepositCalcPanel } from "@/features/deposits/components/DepositCalcPanel";
import { DepositQueue } from "@/features/deposits/components/DepositQueue";
import {
  confirmDepositCalculation,
  getDepositCalculation,
  listInitialDeposits,
  type DepositCalculation,
  type DepositInitialSummary,
} from "@/features/deposits/services/deposit-calc-service";

export const Route = createFileRoute("/accountant/deposit-calc")({ component: MHTinhTienCoc });

function MHTinhTienCoc() {
  const [items, setItems] = useState<DepositInitialSummary[]>([]);
  const [selected, setSelected] = useState<DepositCalculation | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const loadItems = async (text: string) => {
    setLoading(true);
    try { setItems(await listInitialDeposits(text)); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Không thể tải danh sách phiếu cọc."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const selectItem = async (item: DepositInitialSummary) => {
    try { setSelected(await getDepositCalculation(item.maPhieuCoc)); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết phiếu cọc."); }
  };

  const confirm = async () => {
    if (!selected) return;
    setConfirming(true);
    try {
      await confirmDepositCalculation(selected.maPhieuCoc);
      toast.success("Tạo phiếu cọc thành công");
      setSelected(null);
      await loadItems(query);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xác nhận phiếu cọc.");
    } finally { setConfirming(false); }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <DepositQueue items={items} loading={loading} selectedId={selected?.maPhieuCoc ?? null} onSearch={setQuery} onSelect={selectItem} />
      {!selected ? <section className="flex flex-1 items-center justify-center bg-gray-50/60"><p className="text-sm text-gray-500">Chọn phiếu cọc để tính tiền.</p></section> : <DepositCalcPanel deposit={selected} confirming={confirming} onConfirm={confirm} />}
    </div>
  );
}
