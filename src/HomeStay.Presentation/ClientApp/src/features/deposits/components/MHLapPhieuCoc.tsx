import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Lock, RefreshCw, Search, Send, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import {
  CreateDepositApiError,
  createDeposit,
  formatAppointmentDateTime,
  loadAvailableDepositRooms,
  loadDepositAppointment,
  loadDepositAppointments,
  type DepositAppointment,
  type DepositRentalType,
  type DepositRoom,
} from "@/features/deposits/services/create-deposit-service";

const customerSchema = z
  .object({
    hoTen: z.string().trim().min(1, "Vui lòng nhập họ tên").max(100),
    soDienThoai: z
      .string()
      .trim()
      .regex(/^[0-9+][0-9 ]{7,14}$/, "Số điện thoại không hợp lệ"),
    ngaySinh: z.string().min(1, "Vui lòng chọn ngày sinh"),
    email: z.union([z.literal(""), z.string().trim().email("Email không hợp lệ")]),
    gioiTinh: z.enum(["Nam", "Nữ"]),
    quocTich: z.string().trim().min(1, "Vui lòng nhập quốc tịch").max(100),
    loaiGiayTo: z.enum(["CCCD", "Hộ chiếu"]),
    soGiayTo: z.string().trim().min(1, "Vui lòng nhập số giấy tờ").max(50),
  })
  .superRefine((values, context) => {
    const birthday = new Date(`${values.ngaySinh}T00:00:00`);
    const today = new Date();
    const age = today.getFullYear() - birthday.getFullYear();
    if (!Number.isFinite(birthday.getTime()) || birthday >= today || age < 6 || age > 120) {
      context.addIssue({ code: "custom", path: ["ngaySinh"], message: "Ngày sinh không hợp lệ" });
    }
    if (
      values.loaiGiayTo === "Hộ chiếu" &&
      (values.soGiayTo.length < 7 || values.soGiayTo.length > 15)
    ) {
      context.addIssue({
        code: "custom",
        path: ["soGiayTo"],
        message: "Số hộ chiếu phải có từ 7 đến 15 ký tự",
      });
    }
    if (values.loaiGiayTo === "CCCD" && !/^\d{12}$/.test(values.soGiayTo)) {
      context.addIssue({
        code: "custom",
        path: ["soGiayTo"],
        message: "CCCD phải gồm đúng 12 chữ số",
      });
    }
  });

type CustomerFormValues = z.infer<typeof customerSchema>;

const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.max(amount, 0))} VNĐ`;
const formatMoneyInput = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeMoneyInput = (value: string) => value.replace(/\D/g, "");

function roomGenderLabel(value?: string | null) {
  return value ? `Khu ${value}` : "Không giới hạn giới tính";
}

function bedStatus(status: string) {
  if (status === "Trong") return { text: "Trống", className: "bg-emerald-100 text-emerald-700" };
  if (status === "GiuCho") return { text: "Giữ chỗ", className: "bg-amber-100 text-amber-700" };
  if (status === "DaCoc") return { text: "Đã cọc", className: "bg-orange-100 text-orange-700" };
  if (status === "DangSuDung") return { text: "Đang ở", className: "bg-blue-100 text-blue-700" };
  return { text: "Không khả dụng", className: "bg-gray-200 text-gray-600" };
}

export function MHLapPhieuCoc() {
  const [searchText, setSearchText] = useState("");
  const [appointments, setAppointments] = useState<DepositAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<DepositAppointment | null>(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setQueueLoading(true);
      setQueueError(null);
      try {
        setAppointments(await loadDepositAppointments(searchText, controller.signal));
      } catch (error) {
        if (controller.signal.aborted) return;
        setAppointments([]);
        setQueueError(error instanceof Error ? error.message : "Không thể tải lịch hẹn chờ cọc.");
      } finally {
        if (!controller.signal.aborted) setQueueLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [reloadVersion, searchText]);

  const chonLichHen = async (appointment: DepositAppointment) => {
    setSelectedAppointment(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      setSelectedAppointment(await loadDepositAppointment(appointment.maLH));
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Không thể tải chi tiết lịch hẹn.");
    } finally {
      setDetailLoading(false);
    }
  };

  const reloadAfterConflict = () => {
    setSelectedAppointment(null);
    setDetailError(null);
    setReloadVersion((value) => value + 1);
  };

  const completeAppointment = (appointmentId: string) => {
    setAppointments((current) => current.filter((item) => item.maLH !== appointmentId));
    setSelectedAppointment(null);
  };

  return (
    <main className="flex h-full min-h-0 bg-gray-50">
      <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-800">Khách hàng chờ cọc</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {queueLoading ? "Đang tải..." : `${appointments.length} lịch xem phòng hoàn thành`}
          </p>
        </header>
        <div className="border-b border-gray-100 px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm lịch hẹn, khách hàng..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {queueLoading ? (
            <QueueMessage
              icon={<Loader2 className="size-4 animate-spin" />}
              text="Đang tải lịch hẹn..."
            />
          ) : queueError ? (
            <QueueMessage
              icon={<AlertCircle className="size-4 text-red-500" />}
              text={queueError}
              action={() => setReloadVersion((value) => value + 1)}
            />
          ) : appointments.length === 0 ? (
            <QueueMessage text="Không có lịch hẹn phù hợp." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {appointments.map((appointment) => (
                <li key={appointment.maLH}>
                  <button
                    type="button"
                    onClick={() => void chonLichHen(appointment)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-emerald-50/60",
                      selectedAppointment?.maLH === appointment.maLH &&
                        "border-l-emerald-500 bg-emerald-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {appointment.maLH}
                      </span>
                      <Badge className="h-5 bg-emerald-100 text-[10px] text-emerald-700">
                        Đã xem phòng
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {appointment.khachHang.hoTen}
                    </p>
                    <p className="text-xs text-gray-500">
                      SĐT: {appointment.khachHang.sdt || "Chưa cung cấp"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatAppointmentDateTime(appointment)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {detailLoading ? (
        <WorkspaceMessage
          icon={<Loader2 className="size-5 animate-spin" />}
          text="Đang tải hồ sơ khách hàng..."
        />
      ) : detailError ? (
        <WorkspaceMessage
          icon={<AlertCircle className="size-5 text-red-500" />}
          text={detailError}
          action={reloadAfterConflict}
        />
      ) : selectedAppointment ? (
        <DepositForm
          key={selectedAppointment.maLH}
          appointment={selectedAppointment}
          onComplete={completeAppointment}
          onConflict={reloadAfterConflict}
        />
      ) : (
        <WorkspaceMessage text="Chọn một lịch hẹn để lập phiếu cọc." />
      )}
    </main>
  );
}

function QueueMessage({
  icon,
  text,
  action,
}: {
  icon?: React.ReactNode;
  text: string;
  action?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-gray-500">
      {icon}
      <span>{text}</span>
      {action && (
        <Button type="button" variant="outline" size="sm" onClick={action}>
          <RefreshCw className="size-3.5" /> Tải lại
        </Button>
      )}
    </div>
  );
}

function WorkspaceMessage({
  icon,
  text,
  action,
}: {
  icon?: React.ReactNode;
  text: string;
  action?: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-gray-500">
      {icon}
      <span>{text}</span>
      {action && (
        <Button type="button" variant="outline" size="sm" onClick={action}>
          <RefreshCw className="size-3.5" /> Tải lại danh sách
        </Button>
      )}
    </section>
  );
}

function DepositForm({
  appointment,
  onComplete,
  onConflict,
}: {
  appointment: DepositAppointment;
  onComplete: (appointmentId: string) => void;
  onConflict: () => void;
}) {
  const customer = appointment.khachHang;
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [rentalType, setRentalType] = useState<DepositRentalType>("OGhep");
  const [bedCount, setBedCount] = useState(1);
  const [building, setBuilding] = useState("all");
  const [roomType, setRoomType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState<DepositRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedBedIds, setSelectedBedIds] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      hoTen: customer.hoTen,
      soDienThoai: customer.sdt || "",
      ngaySinh: customer.ngaySinh?.slice(0, 10) || "",
      email: customer.email || "",
      gioiTinh: customer.gioiTinh === "Nữ" || customer.gioiTinh === "Nu" ? "Nữ" : "Nam",
      quocTich: customer.quocTich || "Việt Nam",
      loaiGiayTo: customer.loaiGiayTo === "Hộ chiếu" ? "Hộ chiếu" : "CCCD",
      soGiayTo: customer.soGiayTo || "",
    },
  });

  const gender = form.watch("gioiTinh");
  const documentType = form.watch("loaiGiayTo");
  const previousGender = useRef(gender);
  const minPriceNumber = minPrice ? Number(minPrice) : null;
  const maxPriceNumber = maxPrice ? Number(maxPrice) : null;
  const invalidPriceRange =
    minPriceNumber != null && maxPriceNumber != null && minPriceNumber > maxPriceNumber;

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.maPhong === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );
  const selectedBedCodes = useMemo(() => {
    if (!selectedRoom) return [];
    const lookup = new Map(selectedRoom.giuongs.map((bed) => [bed.maGiuong, bed.soGiuong]));
    return selectedBedIds.map((id) => lookup.get(id) ?? id);
  }, [selectedBedIds, selectedRoom]);
  const chargedBedCount =
    rentalType === "NguyenCan" ? (selectedRoom?.loaiPhong.sucChua ?? 0) : selectedBedIds.length;
  const estimatedDeposit = (selectedRoom?.loaiPhong.giaThue ?? 0) * 2 * chargedBedCount;

  const clearRoomSelection = useCallback((clearResults = false) => {
    setSelectedRoomId(null);
    setSelectedBedIds([]);
    setRoomError(null);
    if (clearResults) {
      setRooms([]);
      setSearched(false);
    }
  }, []);

  useEffect(() => {
    if (previousGender.current === gender) return;
    previousGender.current = gender;
    clearRoomSelection(true);
  }, [clearRoomSelection, gender]);

  const timPhong = async () => {
    if (invalidPriceRange) {
      toast.error("Khoảng giá không hợp lệ.");
      return;
    }
    setRoomLoading(true);
    setRoomError(null);
    clearRoomSelection();
    try {
      const result = await loadAvailableDepositRooms({
        rentalType,
        bedCount,
        building: building === "all" ? undefined : building,
        roomType: roomType === "all" ? undefined : roomType,
        minPrice,
        maxPrice,
        gender,
      });
      setRooms(result);
      setSearched(true);
    } catch (error) {
      setRooms([]);
      setSearched(true);
      setRoomError(error instanceof Error ? error.message : "Không thể tải danh sách phòng.");
    } finally {
      setRoomLoading(false);
    }
  };

  const chonHinhThucThue = (value: DepositRentalType) => {
    setRentalType(value);
    clearRoomSelection(true);
  };

  const changeBedCount = (value: number) => {
    setBedCount(Math.min(20, Math.max(1, value || 1)));
    clearRoomSelection(true);
  };

  const chonNguyenPhong = (room: DepositRoom) => {
    setSelectedRoomId(room.maPhong);
    setSelectedBedIds(room.giuongs.map((bed) => bed.maGiuong));
  };

  const chonBoChonGiuong = (room: DepositRoom, bedId: string) => {
    if (selectedRoomId && selectedRoomId !== room.maPhong) {
      setSelectedRoomId(room.maPhong);
      setSelectedBedIds([bedId]);
      return;
    }
    setSelectedRoomId(room.maPhong);
    setSelectedBedIds((current) => {
      if (current.includes(bedId)) return current.filter((id) => id !== bedId);
      if (current.length >= bedCount) return current;
      return [...current, bedId];
    });
  };

  const moHopThoaiXacNhan = form.handleSubmit(() => {
    if (!selectedRoom || chargedBedCount === 0) {
      toast.error("Vui lòng chọn phòng/giường trước khi tạo yêu cầu cọc.");
      return;
    }
    if (rentalType === "OGhep" && selectedBedIds.length !== bedCount) {
      toast.error("Vui lòng chọn đủ số lượng giường cần cọc.");
      return;
    }
    setConfirmOpen(true);
  });

  const taoPhieuCoc = async () => {
    if (!selectedRoom || submitting) return;
    const values = form.getValues();
    setSubmitting(true);
    try {
      const result = await createDeposit({
        appointmentId: appointment.maLH,
        customer: {
          hoTen: values.hoTen,
          sdt: values.soDienThoai,
          ngaySinh: values.ngaySinh,
          email: values.email,
          gioiTinh: values.gioiTinh,
          quocTich: values.quocTich,
          loaiGiayTo: values.loaiGiayTo,
          soGiayTo: values.soGiayTo,
        },
        roomId: selectedRoom.maPhong,
        bedIds: selectedBedIds,
        rentalType,
      });
      setConfirmOpen(false);
      toast.success(`Đã tạo ${result.maPhieuCoc} và chuyển sang Kế toán tính tiền.`);
      onComplete(appointment.maLH);
    } catch (error) {
      setConfirmOpen(false);
      const message = error instanceof Error ? error.message : "Không thể tạo phiếu cọc.";
      toast.error(message);
      if (
        error instanceof CreateDepositApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        onConflict();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <header className="border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">
            Lập phiếu cọc — {appointment.maLH}
          </h1>
          <Badge className="bg-emerald-100 text-emerald-700">Đã xem phòng</Badge>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {customer.hoTen} • {formatAppointmentDateTime(appointment)}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          <section className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  1. Rà soát thông tin khách hàng
                </h2>
                <p className="text-xs text-gray-500">
                  Cập nhật nếu thông tin đã thay đổi sau khi xem phòng.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingCustomer((v) => !v)}
              >
                {editingCustomer ? "Khóa chỉnh sửa" : "Chỉnh sửa"}
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <TextField label="Họ và tên" required error={form.formState.errors.hoTen?.message}>
                <ReadonlyInput readOnly={!editingCustomer} {...form.register("hoTen")} />
              </TextField>
              <TextField
                label="Số điện thoại"
                required
                error={form.formState.errors.soDienThoai?.message}
              >
                <ReadonlyInput readOnly={!editingCustomer} {...form.register("soDienThoai")} />
              </TextField>
              <TextField label="Ngày sinh" required error={form.formState.errors.ngaySinh?.message}>
                <ReadonlyInput
                  type="date"
                  readOnly={!editingCustomer}
                  {...form.register("ngaySinh")}
                />
              </TextField>
              <TextField label="Giới tính" required error={form.formState.errors.gioiTinh?.message}>
                <Select
                  value={gender}
                  disabled={!editingCustomer}
                  onValueChange={(value) =>
                    form.setValue("gioiTinh", value as "Nam" | "Nữ", { shouldValidate: true })
                  }
                >
                  <SelectTrigger className={cn(!editingCustomer && "bg-gray-50")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </TextField>
              <TextField label="Quốc tịch" required error={form.formState.errors.quocTich?.message}>
                <ReadonlyInput readOnly={!editingCustomer} {...form.register("quocTich")} />
              </TextField>
              <TextField label="Email" error={form.formState.errors.email?.message}>
                <ReadonlyInput readOnly={!editingCustomer} {...form.register("email")} />
              </TextField>
              <TextField
                label="Loại giấy tờ"
                required
                error={form.formState.errors.loaiGiayTo?.message}
              >
                <Select
                  value={documentType}
                  disabled={!editingCustomer}
                  onValueChange={(value) =>
                    form.setValue("loaiGiayTo", value as "CCCD" | "Hộ chiếu", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className={cn(!editingCustomer && "bg-gray-50")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CCCD">CCCD</SelectItem>
                    <SelectItem value="Hộ chiếu">Hộ chiếu</SelectItem>
                  </SelectContent>
                </Select>
              </TextField>
              <TextField
                label="Số giấy tờ"
                required
                error={form.formState.errors.soGiayTo?.message}
              >
                <ReadonlyInput readOnly={!editingCustomer} {...form.register("soGiayTo")} />
              </TextField>
            </div>
          </section>

          <section className="p-4">
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-gray-900">2. Chọn nhu cầu thuê</h2>
              <p className="text-xs text-gray-500">
                Kết quả phòng được giới hạn theo chi nhánh và giới tính khách.
              </p>
            </div>
            <RadioGroup
              value={rentalType}
              onValueChange={(value) => chonHinhThucThue(value as DepositRentalType)}
              className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2"
            >
              <RentalChoice
                value="OGhep"
                selected={rentalType === "OGhep"}
                title="Thuê ở ghép"
                description="Chọn giường cụ thể còn trống"
              />
              <RentalChoice
                value="NguyenCan"
                selected={rentalType === "NguyenCan"}
                title="Thuê nguyên phòng"
                description="Giữ toàn bộ phòng, tính cọc theo sức chứa"
              />
            </RadioGroup>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
              {rentalType === "OGhep" && (
                <div className="xl:col-span-2">
                  <RequiredLabel>Số giường cần cọc</RequiredLabel>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={bedCount}
                    onChange={(e) => changeBedCount(Number(e.target.value))}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              )}
              <div className="xl:col-span-2">
                <Label className="text-xs text-gray-600">Tòa nhà</Label>
                <Select value={building} onValueChange={setBuilding}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Tòa A">Tòa A</SelectItem>
                    <SelectItem value="Tòa B">Tòa B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="xl:col-span-2">
                <Label className="text-xs text-gray-600">Loại phòng</Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="4">Phòng 4</SelectItem>
                    <SelectItem value="6">Phòng 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={cn("xl:col-span-4", rentalType === "NguyenCan" && "xl:col-span-6")}>
                <Label className="text-xs text-gray-600">Khoảng giá tháng</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    value={formatMoneyInput(minPrice)}
                    onChange={(e) => setMinPrice(normalizeMoneyInput(e.target.value))}
                    className="h-8 min-w-0 text-xs"
                    placeholder="Từ"
                  />
                  <span className="text-xs text-gray-400">–</span>
                  <Input
                    inputMode="numeric"
                    value={formatMoneyInput(maxPrice)}
                    onChange={(e) => setMaxPrice(normalizeMoneyInput(e.target.value))}
                    className="h-8 min-w-0 text-xs"
                    placeholder="Đến"
                  />
                  <span className="shrink-0 text-[11px] text-gray-400">VNĐ</span>
                  {(minPrice || maxPrice) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
                {invalidPriceRange && (
                  <p className="mt-1 text-xs text-red-600">Khoảng giá không hợp lệ.</p>
                )}
              </div>
              <div className="flex items-end xl:col-span-2">
                <Button
                  type="button"
                  className="h-8 w-full bg-blue-600 text-xs hover:bg-blue-700"
                  disabled={roomLoading}
                  onClick={() => void timPhong()}
                >
                  {roomLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Search className="size-3.5" />
                  )}{" "}
                  Tìm phòng
                </Button>
              </div>
            </div>
          </section>

          <section className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">3. Chọn phòng và giường</h2>
                <p className="text-xs text-gray-500">
                  Trạng thái sẽ được server kiểm tra lại khi tạo phiếu.
                </p>
              </div>
              {searched && !roomLoading && (
                <span className="text-xs text-gray-500">{rooms.length} phòng phù hợp</span>
              )}
            </div>
            {roomLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" /> Đang kiểm tra phòng trống...
              </div>
            ) : roomError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-sm text-red-600">
                <AlertCircle className="size-5" />
                <span>{roomError}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void timPhong()}
                >
                  <RefreshCw className="size-3.5" /> Thử lại
                </Button>
              </div>
            ) : !searched ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Chọn nhu cầu và tìm phòng để xem giường còn trống.
              </p>
            ) : rooms.length === 0 ? (
              <p className="py-8 text-center text-sm text-amber-600">
                Không tìm thấy phòng phù hợp. Vui lòng đổi tiêu chí.
              </p>
            ) : (
              <div className="space-y-2">
                {rooms.map((room) => (
                  <RoomOption
                    key={room.maPhong}
                    room={room}
                    rentalType={rentalType}
                    selected={selectedRoomId === room.maPhong}
                    selectedBedIds={selectedBedIds}
                    onSelectWhole={() => chonNguyenPhong(room)}
                    onToggleBed={(bedId) => chonBoChonGiuong(room, bedId)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="sticky bottom-0 flex min-h-16 items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-2">
        <div className="min-w-0 text-xs text-gray-600">
          {selectedRoom ? (
            <>
              <p className="truncate">
                <strong className="text-gray-900">P. {selectedRoom.soPhong}</strong> •{" "}
                {rentalType === "NguyenCan"
                  ? `Toàn bộ ${chargedBedCount} giường`
                  : selectedBedCodes.join(", ")}
              </p>
              <p>
                {formatCurrency(selectedRoom.loaiPhong.giaThue)} × 2 tháng × {chargedBedCount}{" "}
                giường ={" "}
                <strong className="text-emerald-700">{formatCurrency(estimatedDeposit)}</strong>
              </p>
            </>
          ) : (
            <p>Chưa chọn phòng/giường.</p>
          )}
        </div>
        <Button
          type="button"
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
          disabled={submitting}
          onClick={() => void moHopThoaiXacNhan()}
        >
          <Send className="size-4" /> Tạo phiếu & gửi Kế toán
        </Button>
      </footer>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !submitting && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận tạo phiếu cọc?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Khách hàng: <strong className="text-gray-900">{form.getValues("hoTen")}</strong>
                </p>
                <p>
                  Phòng: <strong className="text-gray-900">{selectedRoom?.soPhong}</strong> •{" "}
                  {rentalType === "NguyenCan"
                    ? `Toàn bộ ${chargedBedCount} giường`
                    : selectedBedCodes.join(", ")}
                </p>
                <p>
                  Tạm tính:{" "}
                  <strong className="text-emerald-700">{formatCurrency(estimatedDeposit)}</strong>
                </p>
                <p className="rounded-md bg-amber-50 p-2 text-amber-800">
                  Bằng việc xác nhận, Sale xác nhận khách đã đồng ý điều kiện thuê và nội quy ký túc
                  xá.
                </p>
                <p>Số tiền chính thức vẫn do Kế toán tính và xác nhận trước khi thu.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Kiểm tra lại</AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={(event) => {
                event.preventDefault();
                void taoPhieuCoc();
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />} Xác nhận tạo phiếu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function TextField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs text-gray-600">
      {children}
      <span className="ml-0.5 text-red-500">*</span>
    </Label>
  );
}

function ReadonlyInput({ readOnly, className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Input
        readOnly={readOnly}
        className={cn(readOnly && "bg-gray-50 pr-8", className)}
        {...props}
      />
      {readOnly && (
        <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      )}
    </div>
  );
}

function RentalChoice({
  value,
  selected,
  title,
  description,
}: {
  value: DepositRentalType;
  selected: boolean;
  title: string;
  description: string;
}) {
  return (
    <label
      className={cn(
        "cursor-pointer rounded-md border px-3 py-2",
        selected && "border-blue-500 bg-blue-50",
      )}
    >
      <RadioGroupItem value={value} className="sr-only" />
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </label>
  );
}

function RoomOption({
  room,
  rentalType,
  selected,
  selectedBedIds,
  onSelectWhole,
  onToggleBed,
}: {
  room: DepositRoom;
  rentalType: DepositRentalType;
  selected: boolean;
  selectedBedIds: string[];
  onSelectWhole: () => void;
  onToggleBed: (bedId: string) => void;
}) {
  return (
    <div className={cn("rounded-md border p-3", selected && "border-blue-400 bg-blue-50/40")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            P. {room.soPhong} • {room.loaiPhong.tenLoaiPhong}
          </p>
          <p className="text-xs text-gray-500">
            {room.toaNha || "Chưa xác định tòa"} • {roomGenderLabel(room.gioiTinhChoPhep)} • Sức
            chứa {room.loaiPhong.sucChua}
          </p>
          <p className="text-xs font-medium text-gray-700">
            {formatCurrency(room.loaiPhong.giaThue)}/giường/tháng
          </p>
        </div>
        {rentalType === "NguyenCan" && (
          <Button
            type="button"
            size="sm"
            variant={selected ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={onSelectWhole}
          >
            {selected ? "Đã chọn" : "Chọn phòng"}
          </Button>
        )}
      </div>
      {rentalType === "OGhep" && (
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          {room.giuongs.map((bed) => {
            const available = bed.trangThai === "Trong";
            const checked = selectedBedIds.includes(bed.maGiuong);
            const status = bedStatus(bed.trangThai);
            return (
              <label
                key={bed.maGiuong}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                  available
                    ? "cursor-pointer hover:border-blue-300"
                    : "cursor-not-allowed bg-gray-50 text-gray-400",
                  checked && "border-blue-400 bg-blue-50",
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={!available}
                  onCheckedChange={() => onToggleBed(bed.maGiuong)}
                />
                <span className="font-mono">{bed.soGiuong}</span>
                <Badge className={cn("ml-auto h-5 text-[10px]", status.className)}>
                  {status.text}
                </Badge>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
