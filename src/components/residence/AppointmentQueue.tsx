import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkflowStore, type Appointment } from "@/lib/workflow-store";

export function AppointmentQueue({
  selectedId,
  excludedIds,
  onSelect,
}: {
  selectedId: string | null;
  excludedIds: string[];
  onSelect: (item: Appointment) => void;
}) {
  const { appointments } = useWorkflowStore();
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const relevant = appointments.filter(
      (a) => a.type === "viewing" && a.status === "success" && !excludedIds.includes(a.id),
    );
    if (!query.trim()) return relevant;
    const q = query.trim().toLowerCase();
    return relevant.filter(
      (a) =>
        a.customerName.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q),
    );
  }, [appointments, excludedIds, query]);

  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-800">Khách hàng chờ cọc</h2>
        <p className="mt-0.5 text-xs text-gray-400">{items.length} lịch hẹn xem phòng thành công</p>
      </div>
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm lịch hẹn, khách hàng..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center p-6 text-center text-sm text-gray-400">
            Không có lịch hẹn phù hợp.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const appointmentDate = new Date(item.createdAt);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-emerald-50/60",
                      selectedId === item.id && "border-l-emerald-500 bg-emerald-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{item.code}</span>
                      <Badge className="h-5 bg-emerald-100 text-[10px] text-emerald-700">
                        Xem phòng thành công
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.customerName}</p>
                    <p className="text-xs text-gray-500">SĐT: {item.phone}</p>
                    <p className="text-xs text-gray-500">
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(appointmentDate)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
