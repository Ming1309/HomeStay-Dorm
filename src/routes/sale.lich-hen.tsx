import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Search } from "lucide-react";
import * as z from "zod";

import { SaleShell } from "@/components/app/SaleShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_TYPES,
  AppointmentRecord,
  AppointmentType,
  BRANCHES,
  loadAppointments,
  saveAppointments,
} from "@/lib/appointments";

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

type RegistrationItem = {
  id: string;
  registrationNumber: string;
  customerName: string;
  phone: string;
  email: string;
  status: string;
};

type DepositItem = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  room: string;
};

type ContractItem = {
  id: string;
  contractNumber: string;
  customerName: string;
  phone: string;
  room: string;
};

const mockRegistrations: RegistrationItem[] = [
  {
    id: "reg-1",
    registrationNumber: "REG-20260601-10001",
    customerName: "Nguyễn Văn A",
    phone: "0912345678",
    email: "nguyenvana@example.com",
    status: "Đã duyệt",
  },
  {
    id: "reg-2",
    registrationNumber: "REG-20260529-10002",
    customerName: "Trần Thị B",
    phone: "0987654321",
    email: "tranthib@gmail.com",
    status: "Chờ duyệt",
  },
  {
    id: "reg-3",
    registrationNumber: "REG-20260528-10003",
    customerName: "Phạm Hoàng C",
    phone: "0968887777",
    email: "phamhoangc@company.vn",
    status: "Nháp",
  },
];

const mockApprovedDeposits: DepositItem[] = [
  {
    id: "dep-1",
    code: "PC001",
    customerName: "Nguyễn Văn An",
    phone: "0901234567",
    room: "P.101",
  },
  {
    id: "dep-2",
    code: "PC002",
    customerName: "Trần Thị Bình",
    phone: "0912345678",
    room: "P.203",
  },
  {
    id: "dep-3",
    code: "PC003",
    customerName: "Lê Hoàng Cường",
    phone: "0987654321",
    room: "P.305",
  },
];

const mockActiveContracts: ContractItem[] = [
  {
    id: "ctr-1",
    contractNumber: "HD-20260601-001",
    customerName: "Lê Gia Bảo",
    phone: "0938000456",
    room: "P.206",
  },
  {
    id: "ctr-2",
    contractNumber: "HD-20260601-002",
    customerName: "Trần Hoàng Nam",
    phone: "0938456789",
    room: "P.203",
  },
  {
    id: "ctr-3",
    contractNumber: "HD-20260601-003",
    customerName: "Ngô Quốc Anh",
    phone: "0977111222",
    room: "P.410",
  },
];

export const Route = createFileRoute("/sale/lich-hen")({
  component: SaleAppointmentPage,
});

function SaleAppointmentPage() {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("view-room");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("Đã xác nhận");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => loadAppointments());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      branch: BRANCHES[0].value,
      date: "",
      time: "",
    },
  });

  const branch = watch("branch");

  useEffect(() => {
    setSelectedId(null);
    setSearch("");
  }, [appointmentType]);

  useEffect(() => {
    saveAppointments(appointments);
  }, [appointments]);

  const { allowedResults, excludedResults } = useMemo(() => {
    const query = search.toLowerCase().trim();

    const filterByQuery = <T extends Record<string, string>>(arr: T[], fields: Array<keyof T>) =>
      arr.filter((item) => {
        if (!query) return true;
        return fields.some((f) =>
          String(item[f] ?? "")
            .toLowerCase()
            .includes(query),
        );
      });

    if (appointmentType === "view-room") {
      const raw = filterByQuery(mockRegistrations, [
        "registrationNumber",
        "customerName",
        "phone",
        "email",
      ]);
      const allowed = raw.filter((r) => r.status === "Đã duyệt");
      const excluded = raw.filter((r) => r.status !== "Đã duyệt");
      return { allowedResults: allowed, excludedResults: excluded };
    }

    if (appointmentType === "checkin") {
      const raw = filterByQuery(mockApprovedDeposits, ["code", "customerName", "phone", "room"]);
      return { allowedResults: raw, excludedResults: [] };
    }

    const raw = filterByQuery(mockActiveContracts, [
      "contractNumber",
      "customerName",
      "phone",
      "room",
    ]);
    return { allowedResults: raw, excludedResults: [] };
  }, [appointmentType, search]);

  const selectedReference = useMemo(() => {
    return allowedResults.find((item) => item.id === selectedId) ?? null;
  }, [allowedResults, selectedId]);

  const currentTypeInfo = APPOINTMENT_TYPES.find((item) => item.value === appointmentType)!;

  const handleSave = handleSubmit((formData) => {
    if (!selectedReference) {
      toast.error("Vui lòng chọn chứng từ liên kết cho lịch hẹn.");
      return;
    }

    const conflict = appointments.some(
      (item) => item.date === formData.date && item.time === formData.time,
    );

    if (conflict) {
      toast.error("Nhân viên đã bận vào thời điểm này. Vui lòng chọn lại giờ hoặc ngày.");
      return;
    }

    const record: AppointmentRecord = {
      id: `appt-${Date.now()}`,
      appointmentType,
      referenceLabel:
        appointmentType === "view-room"
          ? `${(selectedReference as RegistrationItem).registrationNumber} • ${(selectedReference as RegistrationItem).customerName}`
          : appointmentType === "checkin"
            ? `${(selectedReference as DepositItem).code} • ${(selectedReference as DepositItem).customerName}`
            : `${(selectedReference as ContractItem).contractNumber} • ${(selectedReference as ContractItem).customerName}`,
      branch: formData.branch,
      date: formData.date,
      time: formData.time,
      status,
    };

    setAppointments((prev) => [record, ...prev]);
    toast.success("Tạo lịch hẹn thành công", {
      description: "Email/SMS thông báo đã được gửi đến khách hàng.",
    });
    reset({ branch: BRANCHES[0].value, date: "", time: "" });
  });

  return (
    <SaleShell currentPath="/sale/lich-hen" showWorkspaceNav>
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
                    "Không tìm thấy chứng từ phù hợp. Thử lại với tiêu chí khác."
                  )}
                </div>

                <div className="space-y-2">
                  {allowedResults.map((item) => {
                    const active = item.id === selectedId;
                    const label =
                      appointmentType === "view-room"
                        ? `${(item as RegistrationItem).registrationNumber} · ${(item as RegistrationItem).customerName}`
                        : appointmentType === "checkin"
                          ? `${(item as DepositItem).code} · ${(item as DepositItem).customerName}`
                          : `${(item as ContractItem).contractNumber} · ${(item as ContractItem).customerName}`;
                    const subtitle =
                      appointmentType === "view-room"
                        ? `${(item as RegistrationItem).phone} • ${(item as RegistrationItem).email}`
                        : appointmentType === "checkin"
                          ? `${(item as DepositItem).phone} • ${(item as DepositItem).room}`
                          : `${(item as ContractItem).phone} • ${(item as ContractItem).room}`;

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
                              {(item as RegistrationItem).status}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
                      </button>
                    );
                  })}

                  {excludedResults.length > 0 && (
                    <div className="pt-2">
                      <div className="mb-2 text-xs font-semibold text-gray-500">
                        Chứng từ không phù hợp (không thể chọn)
                      </div>
                      <div className="space-y-2">
                        {appointmentType === "view-room" &&
                          (excludedResults as RegistrationItem[]).map((item) => (
                            <div
                              key={item.id}
                              className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-left opacity-60"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-sm font-semibold text-gray-700">{`${item.registrationNumber} · ${item.customerName}`}</p>
                                <Badge className="h-6 rounded bg-amber-100 px-2 text-[11px] text-amber-700">
                                  {item.status}
                                </Badge>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">{`${item.phone} • ${item.email}`}</p>
                            </div>
                          ))}

                        {appointmentType === "checkin" &&
                          (excludedResults as DepositItem[]).map((item) => (
                            <div
                              key={item.id}
                              className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-left opacity-60"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-sm font-semibold text-gray-700">{`${item.code} · ${item.customerName}`}</p>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">{`${item.phone} • ${item.room}`}</p>
                            </div>
                          ))}

                        {appointmentType === "checkout" &&
                          (excludedResults as ContractItem[]).map((item) => (
                            <div
                              key={item.id}
                              className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-left opacity-60"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-sm font-semibold text-gray-700">{`${item.contractNumber} · ${item.customerName}`}</p>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">{`${item.phone} • ${item.room}`}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
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
                    ? appointmentType === "view-room"
                      ? `${(selectedReference as RegistrationItem).registrationNumber} • ${(selectedReference as RegistrationItem).customerName}`
                      : appointmentType === "checkin"
                        ? `${(selectedReference as DepositItem).code} • ${(selectedReference as DepositItem).customerName}`
                        : `${(selectedReference as ContractItem).contractNumber} • ${(selectedReference as ContractItem).customerName}`
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
                      <Select value={branch} onValueChange={(value) => setValue("branch", value)}>
                        <SelectTrigger id="branch" className="h-10 text-sm">
                          <SelectValue placeholder="Chọn chi nhánh" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRANCHES.map((branchOption) => (
                            <SelectItem key={branchOption.value} value={branchOption.value}>
                              {branchOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">
                          Trạng thái
                        </Label>
                        <Select value={status} onValueChange={(v) => setStatus(v)}>
                          <SelectTrigger id="status" className="h-10 text-sm">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            {APPOINTMENT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed border-gray-200 bg-slate-50 p-3 text-sm text-gray-600">
                      <p className="font-semibold text-gray-900">Ghi chú luồng</p>
                      <p className="mt-2 leading-6">
                        Sau khi lưu, hệ thống ghi nhận lịch hẹn mới và hiển thị trạng thái "Đã xác
                        nhận". Một thông báo Email/SMS sẽ được kích hoạt đến khách hàng.
                      </p>
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
    </SaleShell>
  );
}
