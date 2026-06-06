import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ReceiptVoucherPanel } from "@/components/contract/ReceiptVoucherPanel";
import { cn } from "@/lib/utils";
import { useWorkflowStore, type ContractItem } from "@/lib/workflow-store";

export const Route = createFileRoute("/accountant/receipts")({
  component: AccountantReceiptsPage,
});

function AccountantReceiptsPage() {
  const allowed = useRoleGuard("accountant");
  const { contracts } = useWorkflowStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const receivableContracts = useMemo(
    () => contracts.filter((contract) => getOutstandingAmount(contract) > 0),
    [contracts],
  );

  const filteredContracts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return receivableContracts;
    return receivableContracts.filter((contract) =>
      [contract.id, getCustomerCode(contract), contract.customerName, contract.room, contract.phone]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, receivableContracts]);

  const selected =
    filteredContracts.find((contract) => contract.id === selectedId) ??
    filteredContracts[0] ??
    null;

  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/receipts">
      <div className="flex h-full overflow-hidden bg-gray-50">
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-4">
            <h1 className="text-base font-bold text-gray-900">Lập phiếu thu</h1>
            <p className="mt-1 text-sm text-gray-500">Ghi nhận khoản tiền khách hàng thanh toán</p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm khách, hợp đồng, hóa đơn…"
                className="h-10 rounded-lg border-gray-200 pl-9 text-sm shadow-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract) => {
                const status = getReceivableStatus(contract);
                const selectedItem = selected?.id === contract.id;
                return (
                  <button
                    key={contract.id}
                    type="button"
                    onClick={() => setSelectedId(contract.id)}
                    className={cn(
                      "mb-2 w-full rounded-lg border px-3 py-3 text-left transition-colors",
                      selectedItem
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-blue-700">
                          {contract.id}
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                          {contract.customerName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {contract.room} • {getCustomerCode(contract)}
                        </p>
                      </div>
                      <Badge className={cn("shrink-0 text-[10px]", status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Tổng công nợ cần thu</span>
                      <span className="font-mono font-bold text-rose-700">
                        {formatCurrency(getOutstandingAmount(contract))}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                Không có khách hàng hoặc hợp đồng nào còn công nợ phù hợp.
              </div>
            )}
          </div>
        </aside>

        {!selected ? (
          <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn một khách hàng để lập phiếu thu.</p>
          </section>
        ) : (
          <ReceiptVoucherPanel contract={selected} />
        )}
      </div>
    </RoleShell>
  );
}

function getCustomerCode(contract: ContractItem) {
  return `KH-${contract.id.replace(/\D/g, "").padStart(5, "0").slice(-5)}`;
}

function getOutstandingAmount(contract: ContractItem) {
  return Math.max(contract.invoiceTotal - contract.paidAmount, 0);
}

function getReceivableStatus(contract: ContractItem) {
  const outstanding = getOutstandingAmount(contract);
  const createdAt = new Date(contract.createdAt);
  const dueDate = new Date(createdAt);
  dueDate.setDate(createdAt.getDate() + 7);
  const overdue = outstanding > 0 && dueDate < new Date();

  if (overdue) return { label: "Quá hạn", className: "bg-red-100 text-red-700" };
  if (contract.paidAmount > 0) {
    return { label: "Thanh toán một phần", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Chờ thanh toán", className: "bg-orange-100 text-orange-700" };
}

function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
}
