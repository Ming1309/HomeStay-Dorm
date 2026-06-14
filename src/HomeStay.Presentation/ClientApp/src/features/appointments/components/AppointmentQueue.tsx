import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { Appointment } from "@/app/providers/workflow-store";

export function AppointmentQueue({
  selectedId,
  excludedIds,
  onSelect,
}: {
  selectedId: string | null;
  excludedIds: string[];
  onSelect: (item: Appointment) => void;
}) {
  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const url = query.trim() 
          ? `/api/appointments/search?text=${encodeURIComponent(query)}`
          : `/api/appointments/pending`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Map từ LichHenDTO sang Appointment
          const mapped: Appointment[] = data.map((d: any) => ({
            id: d.maLH,
            code: d.maLH,
            customerId: d.maKH,
            customerName: d.tenKhachHang || "Khách hàng",
            phone: d.sdt || "",
            email: d.email || "",
            gender: d.gioiTinh === "Nam" ? "male" : "female",
            dob: d.ngaySinh ? d.ngaySinh.split("T")[0] : "",
            nationality: d.quocTich,
            docType: d.loaiGiayTo,
            docNumber: d.soGiayTo,
            type: "viewing",
            status: "success",
            createdAt: d.ngayHen || new Date().toISOString()
          }));
          setAppointments(mapped);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch hẹn", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchAppointments();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const items = useMemo(() => {
    return appointments.filter((a) => !excludedIds.includes(a.id));
  }, [appointments, excludedIds]);

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
