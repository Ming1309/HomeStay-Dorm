import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Lock, Search } from "lucide-react";
import * as z from "zod";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import {
  APPOINTMENT_TYPES,
  type AppointmentDocument,
  type AppointmentRecord,
  AppointmentType,
  appointmentService,
} from "@/features/appointments/services/appointment-service";
import { useAuth } from "@/features/auth/model/auth-store";

const appointmentSchema = z.object({
  branch: z.string().min(1, "Chi nhánh hẹn là bắt buộc"),
  date: z.string().min(1, "Ngày hẹn là bắt buộc"),
  time: z.string().min(1, "Giờ hẹn là bắt buộc"),
});

const APPOINTMENT_STATUSES = [
  "Đã xác nhận",
  "Đã huỷ",
  "Đã Check-in",
  "Vắng mặt",
  "Hoàn thành",
];

function getStatusBadgeClass(status: string) {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("hủy") || s.includes("huy")) return "shrink-0 rounded bg-red-100 px-2 py-1 text-[11px] text-red-700";
  if (s.includes("chờ") || s.includes("chờ xác")) return "shrink-0 rounded bg-amber-100 px-2 py-1 text-[11px] text-amber-700";
  if (s.includes("xác") || s.includes("đã xác")) return "shrink-0 rounded bg-emerald-100 px-2 py-1 text-[11px] text-emerald-700";
  if (s.includes("check-in") || s.includes("checkin")) return "shrink-0 rounded bg-blue-100 px-2 py-1 text-[11px] text-blue-700";
  if (s.includes("vắng")) return "shrink-0 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-700";
  return "shrink-0 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-700";
}

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function SaleAppointmentPage() {
  const { user } = useAuth();
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("view-room");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("Đã xác nhận");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [documentList, setDocumentList] = useState<AppointmentDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      branch: user?.maCN ?? "",
      date: "",
      time: "",
    },
  });

  useEffect(() => {
    setSelectedId(null);
    setSearch("");
  }, [appointmentType]);

  useEffect(() => {
    appointmentService.list().then(setAppointments).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Không thể tải lịch hẹn.");
    });
    if (user?.maCN) setValue("branch", user.maCN);
  }, [setValue, user?.maCN]);

  useEffect(() => {
    let isMounted = true;
    const loadDocs = async () => {
      try {
        setIsLoadingDocuments(true);
        const typeStr = appointmentType === 'view-room' ? 'XemPhong' : appointmentType === 'checkin' ? 'NhanPhong' : 'TraPhong';
        const raw = await appointmentService.fetchDocuments(typeStr, search);
        if (!isMounted) return;
        
        setDocumentList(raw);
      } catch (e) {
        if (isMounted) {
          setDocumentList([]);
          toast.error(e instanceof Error ? e.message : "Không thể tải chứng từ.");
        }
      } finally {
        if (isMounted) setIsLoadingDocuments(false);
      }
    };
    const timer = setTimeout(loadDocs, 300);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [appointmentType, search]);

  const allowedResults = documentList;
  const excludedResults: AppointmentDocument[] = [];

  const selectedReference = useMemo(() => {
    return allowedResults.find((item) => item.id === selectedId) ?? null;
  }, [allowedResults, selectedId]);

  const currentTypeInfo = APPOINTMENT_TYPES.find((item) => item.value === appointmentType)!;

  const handleSave = handleSubmit(async (formData) => {
    if (!selectedReference) {
      toast.error("Vui lòng chọn chứng từ liên kết cho lịch hẹn.");
      return;
    }

    try {
      const record = await appointmentService.create({
        loaiLichHen: appointmentType === 'checkin' ? 'NhanPhong' : appointmentType === 'checkout' ? 'TraPhong' : 'XemPhong',
        maChungTu: selectedReference.id,
        ngayHen: formData.date,
        gioHen: formData.time + ':00'
      });
      setAppointments((prev) => [record, ...prev]);
      toast.success("Tạo lịch hẹn thành công");
      reset({ branch: user?.maCN ?? "", date: "", time: "" });
      } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tạo lịch hẹn');
    }
  });

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
        <aside className="flex w-full max-w-[340px] flex-col border-r border-gray-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <CalendarDays className="size-4 text-blue-600" />
                <span>Tạo lịch hẹn</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Chọn loại lịch hẹn và chứng từ liên kết.</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="appointmentType"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
                >
                  Loại lịch hẹn
                </Label>
                <Select
                  value={appointmentType}
                  onValueChange={(value) => setAppointmentType(value as AppointmentType)}
                >
                  <SelectTrigger id="appointmentType" className="mt-1 h-10 text-sm">
                    <SelectValue placeholder="Chọn loại lịch hẹn" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="search"
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
                >
                  Tìm kiếm chứng từ
                </Label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search"
                    value={search}
                    className="h-10 pl-10 text-sm"
                    placeholder={`Tìm theo mã, tên, SĐT hoặc phòng`}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">{currentTypeInfo.helper}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-3 py-3">
              <div className="space-y-3">
                <div className="rounded-lg border border-gray-200 bg-slate-50 p-3 text-xs text-gray-600">
                  {allowedResults.length > 0 ? (
                    <>
                      {allowedResults.length} chứng từ phù hợp với loại {currentTypeInfo.label}.
                    </>
                  ) : (
                    isLoadingDocuments ? "Đang tải chứng từ..." : "Không tìm thấy chứng từ phù hợp. Thử lại với tiêu chí khác."
                  )}
                </div>

                <div className="space-y-2">
                  {allowedResults.map((item) => {
                    const active = item.id === selectedId;
                    const label = `${item.code} · ${item.customerName}`;
                    const subtitle = `${item.phone}`;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          "group w-full overflow-hidden rounded-lg border px-3 py-3 text-left transition",
                          active
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-gray-900">{label}</p>
                          {appointmentType === "view-room" && (
                            <Badge className="h-6 rounded bg-emerald-100 px-2 text-[11px] text-emerald-700">
                              {item.status}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
                      </button>
                    );
                  })}


                </div>
              </div>
            </ScrollArea>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <div className="shrink-0 border-b border-gray-200 bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Nhập thông tin chi nhánh và thời gian hẹn.
                </p>
              </div>
              <Badge className={getStatusBadgeClass(status)}>{status}</Badge>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Loại lịch hẹn
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {currentTypeInfo.label}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Chứng từ liên kết
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                  {selectedReference
                    ? `${selectedReference.code} • ${selectedReference.customerName}`
                    : "Chưa chọn chứng từ"}
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-4 py-4">
            <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-h-0 overflow-y-auto pr-1">
                <Card className="h-fit rounded-lg border-gray-200">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-base">Thông tin lịch hẹn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-sm font-medium">
                        Chi nhánh hẹn <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="branch"
                          value={user?.tenChiNhanh ?? user?.maCN ?? ""}
                          readOnly
                          className="h-10 bg-gray-50 pr-9 text-sm"
                        />
                        <Lock className="absolute right-3 top-3 size-4 text-gray-400" />
                      </div>
                      {errors.branch && (
                        <p className="text-sm text-red-500">{errors.branch.message}</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium">
                          Ngày hẹn <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          {...register("date")}
                          className="h-10 text-sm"
                        />
                        {errors.date && (
                          <p className="text-sm text-red-500">{errors.date.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-sm font-medium">
                          Giờ hẹn <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          {...register("time")}
                          className="h-10 text-sm"
                        />
                        {errors.time && (
                          <p className="text-sm text-red-500">{errors.time.message}</p>
                        )}
                      </div>

                    </div>

                    <Button type="button" className="w-full" onClick={handleSave}>
                      Lưu lịch hẹn
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="flex min-h-0 flex-col rounded-lg border-gray-200">
                <CardHeader className="shrink-0 px-4 py-3">
                  <CardTitle className="text-base">Lịch hẹn vừa tạo</CardTitle>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                  {appointments.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có lịch hẹn mới nào được tạo.</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 text-sm font-semibold text-gray-900">
                              {item.referenceLabel}
                            </p>
                            <Badge className={getStatusBadgeClass(item.status)}>{item.status}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{item.branch}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.date} • {item.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
    </div>
  );
}
