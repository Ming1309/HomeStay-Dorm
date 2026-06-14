import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Search, Send, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import { useWorkflowStore, type Appointment, type Bed, type Room } from "@/app/providers/workflow-store";

const customerSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  birthDate: z.string().min(1, "Vui lòng chọn ngày sinh"),
  email: z.string().optional(),
  gender: z.enum(["male", "female"]),
  nationality: z.string().min(1, "Vui lòng nhập quốc tịch"),
  docType: z.enum(["CCCD", "Hộ chiếu"]),
  docNumber: z.string().min(1, "Vui lòng nhập số giấy tờ"),
});

const formatCurrency = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.max(amount, 0))} VNĐ`;
const formatAmountInput = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeAmountInput = (value: string) => value.replace(/\D/g, "");

function bedStatusLabel(status: Bed["status"]) {
  if (status === "available")
    return { text: "Trống", className: "bg-emerald-100 text-emerald-700" };
  if (status === "deposited") return { text: "Đã cọc", className: "bg-amber-100 text-amber-700" };
  if (status === "occupied")
    return { text: "Đang sử dụng", className: "bg-blue-100 text-blue-700" };
  return { text: "Đang bảo trì", className: "bg-gray-200 text-gray-700" };
}

export function DepositForm({
  appointment,
  onDone,
}: {
  appointment: Appointment;
  onDone: (appointmentId: string) => void;
}) {
  const { rooms, createDepositRequest } = useWorkflowStore();

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [rentalType, setRentalType] = useState<"shared" | "whole">("shared");
  const [quantity, setQuantity] = useState(1);
  const [buildingFilter, setBuildingFilter] = useState<"all" | "Toà A" | "Toà B">("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<"all" | "4" | "6">("all");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [heldBeds, setHeldBeds] = useState<Set<string>>(new Set());
  const minPrice = priceFrom ? Number(priceFrom) : null;
  const maxPrice = priceTo ? Number(priceTo) : null;
  const invalidPriceRange = minPrice != null && maxPrice != null && minPrice > maxPrice;

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: appointment.customerName,
      phone: appointment.phone,
      birthDate: appointment.dob || "",
      email: appointment.email,
      gender: appointment.gender,
      nationality: appointment.nationality || "Việt Nam",
      docType: appointment.docType || "CCCD",
      docNumber: appointment.docNumber || "",
    },
  });

  useEffect(() => {
    form.reset({
      fullName: appointment.customerName,
      phone: appointment.phone,
      birthDate: appointment.dob || "",
      email: appointment.email,
      gender: appointment.gender,
      nationality: appointment.nationality || "Việt Nam",
      docType: appointment.docType || "CCCD",
      docNumber: appointment.docNumber || "",
    });
    setIsEditingCustomer(false);
    setRentalType("shared");
    setQuantity(1);
    setSearched(false);
    setSearchResults([]);
    setSelectedRoomId(null);
    setSelectedBeds([]);
    setPriceFrom("");
    setPriceTo("");
  }, [
    appointment.id,
    appointment.customerName,
    appointment.phone,
    appointment.email,
    appointment.gender,
    form,
  ]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const selectedRoom = useMemo(
    () => searchResults.find((room) => room.id === selectedRoomId) ?? null,
    [searchResults, selectedRoomId],
  );

  const selectedBedCodes = useMemo(() => {
    if (!selectedRoom) return [];
    const map = new Map(selectedRoom.beds.map((b) => [b.id, b.code]));
    return selectedBeds.map((id) => map.get(id) ?? id);
  }, [selectedBeds, selectedRoom]);

  const bedCountForDeposit =
    rentalType === "whole" ? (selectedRoom?.maxCapacity ?? 0) : selectedBeds.length;
  const [estimatedDeposit, setEstimatedDeposit] = useState(0);

  const handleSearch = async () => {
    if (invalidPriceRange) {
      toast.error("Khoảng giá không hợp lệ.");
      return;
    }

    try {
      const typeParam = rentalType === "shared" ? "available-with-beds" : "available";
      const params = new URLSearchParams();
      if (rentalType === "shared") params.append("soLuong", quantity.toString());
      if (buildingFilter !== "all") params.append("toaNha", buildingFilter);
      if (roomTypeFilter !== "all") params.append("loaiPhong", roomTypeFilter);
      if (priceFrom) params.append("giaMin", priceFrom);
      if (priceTo) params.append("giaMax", priceTo);

      const response = await fetch(`/api/rooms/${typeParam}?${params.toString()}`);
      if (!response.ok) throw new Error("Lỗi khi tìm kiếm phòng");
      
      const data = await response.json();
      
      const result: Room[] = data.map((p: any) => ({
        id: p.maPhong,
        code: p.soPhong,
        building: p.toaNha,
        floor: 1,
        type: p.tenLoaiPhong,
        basePrice: p.giaThue,
        maxCapacity: p.sucChua,
        genderLimit: "none",
        beds: p.giuongs?.map((g: any) => ({
          id: g.maGiuong,
          code: g.soGiuong,
          status: g.trangThai === "Trong" ? "available" : "occupied"
        })) || []
      }));

      setSearchResults(result);
      setSearched(true);
      setSelectedRoomId(null);
      setSelectedBeds([]);
      setEstimatedDeposit(0);
    } catch (error) {
      toast.error("Không thể tải danh sách phòng.");
    }
  };

  const fetchDeposit = async (roomId: string, bCount: number) => {
    const room = searchResults.find(r => r.id === roomId);
    if (!room) return;
    
    try {
      const hinhThuc = rentalType === "shared" ? "OGhep" : "NguyenCan";
      const res = await fetch(`/api/rooms/calculate-deposit?maPhong=${room.id}&giaThue=${room.basePrice}&soLuong=${bCount}&hinhThuc=${hinhThuc}`);
      if (res.ok) {
        const data = await res.json();
        setEstimatedDeposit(data.tienCoc);
      }
    } catch (error) {
      console.error("Lỗi tính cọc", error);
    }
  };

  const handleChooseWholeRoom = (room: Room) => {
    setSelectedRoomId(room.id);
    const beds = room.beds.filter((bed) => bed.status === "available").map((bed) => bed.id);
    setSelectedBeds(beds);
    fetchDeposit(room.id, beds.length);
  };

  const handleToggleBed = (room: Room, bed: Bed) => {
    if (bed.status !== "available") return;
    if (selectedRoomId && selectedRoomId !== room.id) {
      setSelectedBeds([bed.id]);
      setSelectedRoomId(room.id);
      fetchDeposit(room.id, 1);
      return;
    }

    setSelectedRoomId(room.id);
    setSelectedBeds((prev) => {
      let nextBeds;
      if (prev.includes(bed.id)) nextBeds = prev.filter((id) => id !== bed.id);
      else if (prev.length >= quantity) nextBeds = prev;
      else nextBeds = [...prev, bed.id];
      
      fetchDeposit(room.id, nextBeds.length);
      return nextBeds;
    });
  };

  const handleSubmit = async () => {
    const valid = await form.trigger();
    if (!valid) return;

    if (!selectedRoom || bedCountForDeposit === 0) {
      toast.error("Vui lòng chọn phòng/giường trước khi tạo yêu cầu cọc.");
      return;
    }

    if (rentalType === "shared" && selectedBeds.length !== quantity) {
      toast.error("Vui lòng chọn đủ số lượng giường cần cọc.");
      return;
    }

    const values = form.getValues();

    try {
      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaLichHen: appointment.id,
          KhachHang: {
            MaKH: appointment.customerId,
            HoTen: values.fullName,
            SDT: values.phone,
            NgaySinh: values.birthDate ? new Date(values.birthDate).toISOString() : null,
            Email: values.email,
            GioiTinh: values.gender === "male" ? "Nam" : "Nữ",
            QuocTich: values.nationality,
            LoaiGiayTo: values.docType,
            SoGiayTo: values.docNumber,
          },
          MaPhong: selectedRoom.id,
          DanhSachGiuong: selectedBeds,
          HinhThucThue: rentalType === "shared" ? "OGhep" : "NguyenCan",
          TongTien: estimatedDeposit,
          MaNV: "NV03"
        })
      });

      if (!response.ok) {
        throw new Error("Tạo phiếu cọc thất bại");
      }

      setHeldBeds((prev) => {
        const next = new Set(prev);
        selectedBeds.forEach((id) => next.add(id));
        return next;
      });

      toast.success("Yêu cầu đặt cọc đã được khởi tạo và chuyển sang bộ phận Kế toán.");
      onDone(appointment.id);
    } catch (error) {
      toast.error("Lỗi: Không thể khởi tạo phiếu cọc.");
    }
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-5 py-3">
        <h1 className="font-mono text-sm font-bold text-gray-900">
          Lập phiếu cọc — {appointment.code}
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">{appointment.customerName}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        <div className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingCustomer((v) => !v)}
                >
                  {isEditingCustomer ? "Khóa chỉnh sửa" : "Chỉnh sửa"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!isEditingCustomer}
                              className={cn(!isEditingCustomer && "bg-gray-50 pr-8")}
                            />
                            {!isEditingCustomer && (
                              <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!isEditingCustomer}
                              className={cn(!isEditingCustomer && "bg-gray-50 pr-8")}
                            />
                            {!isEditingCustomer && (
                              <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!isEditingCustomer}
                              className={cn(!isEditingCustomer && "bg-gray-50 pr-8")}
                            />
                            {!isEditingCustomer && (
                              <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!isEditingCustomer}
                        >
                          <FormControl>
                            <SelectTrigger className={cn(!isEditingCustomer && "bg-gray-50")}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quốc tịch *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!isEditingCustomer}
                              className={cn(!isEditingCustomer && "bg-gray-50 pr-8")}
                            />
                            {!isEditingCustomer && (
                              <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!isEditingCustomer}
                              className={cn(!isEditingCustomer && "bg-gray-50 pr-8")}
                            />
                            {!isEditingCustomer && (
                              <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="docType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại giấy tờ *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!isEditingCustomer}
                        >
                          <FormControl>
                            <SelectTrigger className={cn(!isEditingCustomer && "bg-gray-50")}>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CCCD">CCCD</SelectItem>
                            <SelectItem value="Hộ chiếu">Hộ chiếu</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="docNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số giấy tờ *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!isEditingCustomer}
                              className={cn(!isEditingCustomer && "bg-gray-50 pr-8")}
                            />
                            {!isEditingCustomer && (
                              <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Nhu cầu thuê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={rentalType}
                onValueChange={(value) => {
                  setRentalType(value as "shared" | "whole");
                  setSelectedRoomId(null);
                  setSelectedBeds([]);
                  setSearched(false);
                }}
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                <label
                  className={cn(
                    "cursor-pointer rounded-lg border p-3",
                    rentalType === "shared" && "border-blue-500 bg-blue-50",
                  )}
                >
                  <RadioGroupItem value="shared" className="sr-only" />
                  <p className="text-sm font-semibold">Thuê ở ghép</p>
                  <p className="text-xs text-gray-500">Chọn giường cụ thể còn trống</p>
                </label>
                <label
                  className={cn(
                    "cursor-pointer rounded-lg border p-3",
                    rentalType === "whole" && "border-blue-500 bg-blue-50",
                  )}
                >
                  <RadioGroupItem value="whole" className="sr-only" />
                  <p className="text-sm font-semibold">Thuê nguyên phòng</p>
                  <p className="text-xs text-gray-500">Khóa toàn bộ phòng khi chọn</p>
                </label>
              </RadioGroup>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                <div className="xl:col-span-2">
                  <Label className="text-xs text-gray-500">
                    {rentalType === "shared"
                      ? "Số lượng giường cần cọc *"
                      : "Số lượng người ở dự kiến *"}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div className="xl:col-span-2">
                  <Label className="text-xs text-gray-500">Tòa nhà</Label>
                  <Select
                    value={buildingFilter}
                    onValueChange={(v) => setBuildingFilter(v as typeof buildingFilter)}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Toà A">Toà A</SelectItem>
                      <SelectItem value="Toà B">Toà B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="xl:col-span-2">
                  <Label className="text-xs text-gray-500">Loại phòng</Label>
                  <Select
                    value={roomTypeFilter}
                    onValueChange={(v) => setRoomTypeFilter(v as typeof roomTypeFilter)}
                  >
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
                <div className="xl:col-span-4">
                  <Label className="text-xs text-gray-500">Khoảng giá</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      inputMode="numeric"
                      value={formatAmountInput(priceFrom)}
                      onChange={(event) => setPriceFrom(normalizeAmountInput(event.target.value))}
                      className="h-8 min-w-0 text-xs"
                    />
                    <Label className="shrink-0 text-xs text-gray-500">-</Label>
                    <Input
                      inputMode="numeric"
                      value={formatAmountInput(priceTo)}
                      onChange={(event) => setPriceTo(normalizeAmountInput(event.target.value))}
                      className="h-8 min-w-0 text-xs"
                    />
                    <span className="shrink-0 text-[11px] text-gray-400">VNĐ</span>
                    {(priceFrom || priceTo) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-gray-400 hover:text-gray-700"
                        onClick={() => {
                          setPriceFrom("");
                          setPriceTo("");
                        }}
                      >
                        <X className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-end xl:col-span-2">
                  <Button
                    type="button"
                    className="h-8 w-full xl:ml-auto xl:w-[140px] bg-blue-600 text-xs hover:bg-blue-700"
                    onClick={handleSearch}
                  >
                    <Search className="size-3.5" />
                    Tìm kiếm
                  </Button>
                </div>
              </div>
              {invalidPriceRange && (
                <p className="text-xs font-medium text-red-600">Khoảng giá không hợp lệ.</p>
              )}
            </CardContent>
          </Card>

          {searched && (
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-amber-600">
                    Không tìm thấy phòng phù hợp với nhu cầu hiện tại.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((room) => (
                      <div
                        key={room.id}
                        className={cn(
                          "rounded-lg border p-3",
                          selectedRoomId === room.id && "border-blue-300 bg-blue-50/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {room.code} • Phòng {room.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              Sức chứa {room.maxCapacity} • {formatCurrency(room.basePrice)}/giường/tháng
                            </p>
                          </div>
                          {rentalType === "whole" && (
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleChooseWholeRoom(room)}
                            >
                              Chọn phòng
                            </Button>
                          )}
                        </div>

                        {rentalType === "shared" && (
                          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                            {room.beds.map((bed) => {
                              const isSelected = selectedBeds.includes(bed.id);
                              const statusMeta = bedStatusLabel(
                                heldBeds.has(bed.id) ? "deposited" : bed.status,
                              );
                              const disabled = bed.status !== "available" || heldBeds.has(bed.id);

                              return (
                                <label
                                  key={bed.id}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                                    disabled
                                      ? "cursor-not-allowed bg-gray-50 text-gray-400"
                                      : "cursor-pointer hover:border-blue-300",
                                    isSelected && "border-blue-400 bg-blue-50",
                                  )}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    disabled={disabled}
                                    onCheckedChange={() => handleToggleBed(room, bed)}
                                  />
                                  <span className="font-mono">{bed.code}</span>
                                  <Badge
                                    className={cn("ml-auto h-5 text-[10px]", statusMeta.className)}
                                  >
                                    {statusMeta.text}
                                  </Badge>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Bảng tính tiền cọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  Phòng đã chọn:{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedRoom?.code ?? "Chưa chọn"}
                  </span>
                </p>
                <p>
                  Giường đã chọn:{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedBedCodes.length ? selectedBedCodes.join(", ") : "Chưa chọn"}
                  </span>
                </p>
                <p>
                  Số giường tính cọc:{" "}
                  <span className="font-semibold text-gray-900">{bedCountForDeposit}</span>
                </p>
              </div>
              <p className="mt-3 text-lg font-bold text-emerald-600">
                Tạm tính tiền cọc: {formatCurrency(estimatedDeposit)}
              </p>
              {selectedRoom && bedCountForDeposit > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {formatCurrency(selectedRoom.basePrice)} × {bedCountForDeposit} giường
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Khoản cọc chính thức sẽ được kế toán phê duyệt trước khi thu tiền.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <span className="text-xs text-gray-400">
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            S
          </kbd>{" "}
          : Tạo yêu cầu cọc
        </span>
        <Button
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => void handleSubmit()}
        >
          <Send className="size-4" />
          Tạo yêu cầu cọc & Gửi kế toán
        </Button>
      </footer>
    </section>
  );
}
