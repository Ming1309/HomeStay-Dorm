import { useEffect, useMemo, useState } from "react";
import { Search, X, Edit2 } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { 
  APPOINTMENT_TYPES,
  AppointmentRecord,
  loadAppointments,
  seedMockAppointments,
  saveAppointments,
} from "@/features/appointments/services/appointment-service";

const getTypeLabel = (type: string) =>
  APPOINTMENT_TYPES.find((item) => item.value === type)?.label ?? "Không xác định";

const APPOINTMENT_STATUSES = [
  "Đã xác nhận",
  "Đã huỷ",
  "Đã Check-in",
  "Vắng mặt",
  "Hoàn thành",
];

export function AppointmentLookupWorkspace() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [appliedTime, setAppliedTime] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState<AppointmentRecord | null>(null);

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

  function getTypeBadgeClass(type: string) {
    switch (type) {
      case "view-room":
        return "h-6 rounded bg-sky-100 px-2 text-[11px] text-sky-700";
      case "checkin":
        return "h-6 rounded bg-emerald-100 px-2 text-[11px] text-emerald-700";
      case "checkout":
        return "h-6 rounded bg-amber-100 px-2 text-[11px] text-amber-700";
      default:
        return "h-6 rounded bg-slate-100 px-2 text-[11px] text-slate-700";
    }
  }

  function getStatusBadgeClass(status: string) {
    const s = status?.toLowerCase() ?? "";
    if (s.includes("hủy")) return "h-6 rounded bg-red-100 px-2 text-[11px] text-red-700";
    if (s.includes("chờ") || s.includes("chờ xác")) return "h-6 rounded bg-amber-100 px-2 text-[11px] text-amber-700";
    if (s.includes("xác")) return "h-6 rounded bg-emerald-100 px-2 text-[11px] text-emerald-700";
    return "h-6 rounded bg-slate-100 px-2 text-[11px] text-slate-700";
  }

  function startEdit() {
    if (!selectedAppointment) return;
    setEditedAppointment({ ...selectedAppointment });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditedAppointment(null);
  }

  function saveEdit() {
    if (!editedAppointment) return;
    const updated = appointments.map((a) => (a.id === editedAppointment.id ? editedAppointment : a));
    saveAppointments(updated);
    setAppointments(updated);
    setIsEditing(false);
    setEditedAppointment(null);
  }
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
              className="h-10 pl-10 pr-10 text-sm"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
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
                const disabled = isEditing && appointment.id !== selectedId;
                return (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => {
                      if (!disabled) setSelectedId(appointment.id);
                    }}
                    disabled={disabled}
                    className={
                      disabled
                        ? "w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-left opacity-60 cursor-not-allowed"
                        : active
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
                      <Badge className={getTypeBadgeClass(appointment.appointmentType)}>
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
              <CardHeader className="flex items-center gap-4">
                <CardTitle className="text-lg">Chi tiết lịch hẹn</CardTitle>
                <div className="ml-auto">
                  <Button
                    onClick={startEdit}
                    disabled={!selectedAppointment}
                    className="h-8"
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Sửa
                  </Button>
                </div>
              </CardHeader>
            <CardContent className="space-y-6">
              {selectedAppointment ? (
                isEditing && editedAppointment ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Mã / khách hàng</label>
                      <Input
                        value={editedAppointment.referenceLabel}
                        onChange={(e) =>
                          setEditedAppointment({ ...editedAppointment, referenceLabel: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Loại lịch hẹn</label>
                        <select
                          value={editedAppointment.appointmentType}
                          onChange={(e) =>
                            setEditedAppointment({ ...editedAppointment, appointmentType: e.target.value as any })
                          }
                          className="mt-2 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                          {APPOINTMENT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Trạng thái</label>
                        <select
                          value={editedAppointment.status}
                          onChange={(e) => setEditedAppointment({ ...editedAppointment, status: e.target.value })}
                          className="mt-2 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                          {APPOINTMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Chi nhánh</label>
                        <Input
                          value={editedAppointment.branch}
                          onChange={(e) => setEditedAppointment({ ...editedAppointment, branch: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Ngày</label>
                        <Input
                          type="date"
                          value={editedAppointment.date}
                          onChange={(e) => setEditedAppointment({ ...editedAppointment, date: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Giờ</label>
                        <Input
                          type="time"
                          value={editedAppointment.time}
                          onChange={(e) => setEditedAppointment({ ...editedAppointment, time: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveEdit} className="h-9">
                        Lưu
                      </Button>
                      <Button variant="outline" onClick={cancelEdit} className="h-9">
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
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
                        <div className="mt-2">
                          <Badge className={getTypeBadgeClass(selectedAppointment.appointmentType)}>
                            {getTypeLabel(selectedAppointment.appointmentType)}
                          </Badge>
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Trạng thái</p>
                        <div className="mt-2">
                          <Badge className={getStatusBadgeClass(selectedAppointment.status)}>
                            {selectedAppointment.status}
                          </Badge>
                        </div>
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
                )
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
