import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  APPOINTMENT_TYPES,
  AppointmentRecord,
  loadAppointments,
  seedMockAppointments,
} from "@/lib/appointments";

const getTypeLabel = (type: string) =>
  APPOINTMENT_TYPES.find((item) => item.value === type)?.label ?? "Không xác định";

export function AppointmentLookupWorkspace() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [appliedTime, setAppliedTime] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    seedMockAppointments();
    setAppointments(loadAppointments());
  }, []);

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(appointments.map((a) => a.date))).sort();
  }, [appointments]);

  const uniqueTimes = useMemo(() => {
    return Array.from(new Set(appointments.map((a) => a.time))).sort();
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const query = appliedSearch.toLowerCase().trim();

    return appointments.filter((item) => {
      if (appliedDate && item.date !== appliedDate) return false;
      if (appliedTime && item.time !== appliedTime) return false;

      if (!query) return true;

      return [
        item.referenceLabel,
        item.branch,
        item.date,
        item.time,
        item.status,
        getTypeLabel(item.appointmentType),
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [appointments, appliedSearch, appliedDate, appliedTime]);

  const selectedAppointment = selectedId
    ? (filteredAppointments.find((item) => item.id === selectedId) ?? null)
    : null;

  useEffect(() => {
    if (selectedId && !filteredAppointments.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredAppointments, selectedId]);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <aside className="flex w-full max-w-[380px] flex-col border-r border-gray-200 bg-white">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Tra cứu lịch hẹn</h1>
            <p className="mt-1 text-xs text-gray-500">
              Tìm nhanh lịch hẹn theo mã/tên khách hàng, chi nhánh, ngày, giờ hoặc trạng thái.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Gõ mã, tên, chi nhánh, ngày, giờ hoặc trạng thái"
              className="h-10 pl-10 text-sm"
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              type="time"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-9 text-sm"
            />
            <Button
              onClick={() => {
                setAppliedSearch(search);
                setAppliedDate(dateFilter);
                setAppliedTime(timeFilter);
              }}
              className="ml-2 h-9"
            >
              Tra cứu
            </Button>
            <button
              type="button"
              onClick={() => {
                setDateFilter("");
                setTimeFilter("");
                setSearch("");
                setAppliedSearch("");
                setAppliedDate("");
                setAppliedTime("");
              }}
              className="ml-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
            >
              Xóa
            </button>
          </div>
          <div className="mt-3 rounded-lg border border-gray-200 bg-slate-50 p-3 text-xs text-gray-600">
            {filteredAppointments.length === 0 ? (
              appliedSearch ? (
                <>Không tìm thấy lịch hẹn phù hợp với từ khóa.</>
              ) : (
                <>Hiện có {appointments.length} lịch hẹn đã lưu.</>
              )
            ) : (
              <>Hiện có {filteredAppointments.length} lịch hẹn phù hợp.</>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => {
                const active = appointment.id === selectedId;
                return (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => setSelectedId(appointment.id)}
                    className={
                      active
                        ? "w-full rounded-lg border border-blue-600 bg-blue-50 px-4 py-3 text-left"
                        : "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-blue-300 hover:bg-gray-50"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {appointment.referenceLabel}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {appointment.branch} • {appointment.date} • {appointment.time}
                        </p>
                      </div>
                      <Badge className="h-6 rounded bg-slate-100 px-2 text-[11px] text-slate-700">
                        {getTypeLabel(appointment.appointmentType)}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </aside>

      <section className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto px-6 py-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Chi tiết lịch hẹn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedAppointment ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Mã / khách hàng
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {selectedAppointment.referenceLabel}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                        Loại lịch hẹn
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {getTypeLabel(selectedAppointment.appointmentType)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Trạng thái</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {selectedAppointment.status}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Chi nhánh</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {selectedAppointment.branch}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Ngày</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {selectedAppointment.date}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Giờ</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {selectedAppointment.time}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-slate-50 p-8 text-center text-sm text-gray-600">
                  <p className="text-base font-semibold text-gray-900">
                    Chọn một lịch hẹn để xem chi tiết
                  </p>
                  <p className="mt-2">
                    Danh sách lịch hẹn sẽ được tải từ dữ liệu đã lưu trên trình duyệt.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
