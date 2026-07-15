import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { ContractPanel } from "@/features/contracts/components/ContractPanel";
import { ContractQueue } from "@/features/contracts/components/ContractQueue";
import {
  layPhieuCocDaDuyet,
  type PhieuCocDaDuyet,
} from "@/features/contracts/services/contract-service";

export const Route = createFileRoute("/sale/lap-hop-dong")({
  component: SaleContractWorkspacePage,
});

function SaleContractWorkspacePage() {
  const [items, setItems] = useState<PhieuCocDaDuyet[]>([]);
  const [selected, setSelected] = useState<PhieuCocDaDuyet | null>(null);
  const [searchText, setSearchText] = useState("");

  const fetchItems = useCallback(
    async (text?: string) => {
      try {
        const data = await layPhieuCocDaDuyet(text);
        setItems(data);
      } catch {
        // ignore fetch error
      }
    },
    [],
  );

  useEffect(() => {
    fetchItems(searchText);
  }, [fetchItems, searchText]);

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("maPhieuCoc");
    if (target) setSelected(items.find((item) => item.maPhieuCoc === target) ?? null);
  }, [items]);

  return (
    <div className="flex h-full overflow-hidden">
      <ContractQueue
        items={items}
        selectedId={selected?.maPhieuCoc ?? null}
        onSelect={setSelected}
        onSearch={(text) => {
          setSearchText(text);
        }}
      />
      <ContractPanel
        deposit={selected}
        onCancelContract={(id) => {
          setItems((prev) => prev.filter((item) => item.maPhieuCoc !== id));
          setSelected(null);
        }}
        onConfirmSigned={(id) => {
          setItems((prev) => prev.filter((item) => item.maPhieuCoc !== id));
          setSelected(null);
        }}
      />
    </div>
  );
}
