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
import type { Appointment, Bed, Room } from "@/app/providers/workflow-store";

const khachHangSchema = z.object({
  hoTen: z.string().min(1, "Vui lòng nhập họ tên"),
  soDienThoai: z.string().min(1, "Vui lòng nhập số điện thoại"),
  ngaySinh: z.string().min(1, "Vui lòng chọn ngày sinh"),
  email: z.string().optional(),
  gioiTinh: z.enum(["male", "female"]),
  quocTich: z.string().min(1, "Vui lòng nhập quốc tịch"),
  loaiGiayTo: z.enum(["CCCD", "Hộ chiếu"]),
  soGiayTo: z.string().min(1, "Vui lòng nhập số giấy tờ"),
});

const dinhDangTien = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Math.max(amount, 0))} VNĐ`;
const dinhDangGiaNhap = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const chuanHoaGiaNhap = (value: string) => value.replace(/\D/g, "");

function layNhanTrangThaiGiuong(status: Bed["status"]) {
  if (status === "available")
    return { text: "Trống", className: "bg-emerald-100 text-emerald-700" };
  if (status === "deposited") return { text: "Đã cọc", className: "bg-amber-100 text-amber-700" };
  if (status === "occupied")
    return { text: "Đang sử dụng", className: "bg-blue-100 text-blue-700" };
  return { text: "Đang bảo trì", className: "bg-gray-200 text-gray-700" };
}

type GiuongApiResponse = {
  maGiuong: string;
  soGiuong: string;
  trangThai: string;
};

type PhongApiResponse = {
  maPhong: string;
  soPhong: string;
  toaNha: string;
  loaiPhong: {
    tenLoaiPhong: string;
    giaThue: number;
    sucChua: number;
  };
  giuongs?: GiuongApiResponse[];
};

export function MHLapPhieuCoc({
  lichHen,
  khiHoanTat,
}: {
  lichHen: Appointment;
  khiHoanTat: (lichHenId: string) => void;
}) {
  const [dangChinhSuaKhachHang, setDangChinhSuaKhachHang] = useState(false);
  const [hinhThucThue, setHinhThucThue] = useState<"shared" | "whole">("shared");
  const [soLuongGiuong, setSoLuongGiuong] = useState(1);
  const [toaNha, setToaNha] = useState<"all" | "Tòa A" | "Tòa B">("all");
  const [loaiPhong, setLoaiPhong] = useState<"all" | "4" | "6">("all");
  const [giaMin, setGiaMin] = useState("");
  const [giaMax, setGiaMax] = useState("");
  const [daTimKiem, setDaTimKiem] = useState(false);
  const [danhSachPhong, setDanhSachPhong] = useState<Room[]>([]);
  const [maPhongDaChon, setMaPhongDaChon] = useState<string | null>(null);
  const [danhSachGiuongDaChon, setDanhSachGiuongDaChon] = useState<string[]>([]);
  const [danhSachGiuongDaGiu, setDanhSachGiuongDaGiu] = useState<Set<string>>(new Set());
  const giaMinDangSo = giaMin ? Number(giaMin) : null;
  const giaMaxDangSo = giaMax ? Number(giaMax) : null;
  const khoangGiaKhongHopLe =
    giaMinDangSo != null && giaMaxDangSo != null && giaMinDangSo > giaMaxDangSo;

  const form = useForm<z.infer<typeof khachHangSchema>>({
    resolver: zodResolver(khachHangSchema),
    defaultValues: {
      hoTen: lichHen.customerName,
      soDienThoai: lichHen.phone,
      ngaySinh: lichHen.dob || "",
      email: lichHen.email,
      gioiTinh: lichHen.gender,
      quocTich: lichHen.nationality || "Việt Nam",
      loaiGiayTo: lichHen.docType || "CCCD",
      soGiayTo: lichHen.docNumber || "",
    },
  });

  useEffect(() => {
    form.reset({
      hoTen: lichHen.customerName,
      soDienThoai: lichHen.phone,
      ngaySinh: lichHen.dob || "",
      email: lichHen.email,
      gioiTinh: lichHen.gender,
      quocTich: lichHen.nationality || "Việt Nam",
      loaiGiayTo: lichHen.docType || "CCCD",
      soGiayTo: lichHen.docNumber || "",
    });
    setDangChinhSuaKhachHang(false);
    setHinhThucThue("shared");
    setSoLuongGiuong(1);
    setDaTimKiem(false);
    setDanhSachPhong([]);
    setMaPhongDaChon(null);
    setDanhSachGiuongDaChon([]);
    setGiaMin("");
    setGiaMax("");
  }, [
    lichHen.id,
    lichHen.customerName,
    lichHen.phone,
    lichHen.email,
    lichHen.gender,
    form,
  ]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void btnTaoYeuCauCoc_Click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const phongDaChon = useMemo(
    () => danhSachPhong.find((phong) => phong.id === maPhongDaChon) ?? null,
    [danhSachPhong, maPhongDaChon],
  );

  const maGiuongDaChon = useMemo(() => {
    if (!phongDaChon) return [];
    const bangTraCuuMaGiuong = new Map(phongDaChon.beds.map((giuong) => [giuong.id, giuong.code]));
    return danhSachGiuongDaChon.map((maGiuong) => bangTraCuuMaGiuong.get(maGiuong) ?? maGiuong);
  }, [danhSachGiuongDaChon, phongDaChon]);

  const soGiuongTinhCoc =
    hinhThucThue === "whole" ? (phongDaChon?.beds.length ?? 0) : danhSachGiuongDaChon.length;
  const tienCocTamTinh = (phongDaChon?.basePrice ?? 0) * soGiuongTinhCoc;

  const btnTimKiem_Click = async () => {
    if (khoangGiaKhongHopLe) {
      toast.error("Khoảng giá không hợp lệ.");
      return;
    }

    try {
      const loaiEndpoint = hinhThucThue === "shared" ? "available-with-beds" : "available";
      const thamSoTimKiem = new URLSearchParams();
      if (hinhThucThue === "shared") thamSoTimKiem.append("soLuong", soLuongGiuong.toString());
      if (toaNha !== "all") thamSoTimKiem.append("toaNha", toaNha);
      if (loaiPhong !== "all") thamSoTimKiem.append("loaiPhong", loaiPhong);
      if (giaMin) thamSoTimKiem.append("giaMin", giaMin);
      if (giaMax) thamSoTimKiem.append("giaMax", giaMax);

      const phanHoi = await fetch(`/api/rooms/${loaiEndpoint}?${thamSoTimKiem.toString()}`);
      if (!phanHoi.ok) throw new Error("Lỗi khi tìm kiếm phòng");
      
      const duLieuPhong = (await phanHoi.json()) as PhongApiResponse[];
      
      const ketQuaTimKiem: Room[] = duLieuPhong.map((phong) => ({
        id: phong.maPhong,
        code: phong.soPhong,
        building: phong.toaNha,
        floor: 1,
        type: phong.loaiPhong.tenLoaiPhong,
        basePrice: phong.loaiPhong.giaThue,
        maxCapacity: phong.loaiPhong.sucChua,
        genderLimit: "none",
        beds: phong.giuongs?.map((giuong) => ({
          id: giuong.maGiuong,
          code: giuong.soGiuong,
          status: giuong.trangThai === "Trong" ? "available" : "occupied"
        })) || []
      }));

      setDanhSachPhong(ketQuaTimKiem);
      setDaTimKiem(true);
      setMaPhongDaChon(null);
      setDanhSachGiuongDaChon([]);
    } catch {
      toast.error("Không thể tải danh sách phòng.");
    }
  };

  const grvDanhSachPhong_CellClick = (phong: Room) => {
    setMaPhongDaChon(phong.id);
    const danhSachGiuongTrong = phong.beds
      .filter((giuong) => giuong.status === "available")
      .map((giuong) => giuong.id);
    setDanhSachGiuongDaChon(danhSachGiuongTrong);
  };

  const grvDanhSachGiuong_CellClick = (phong: Room, giuong: Bed) => {
    if (giuong.status !== "available") return;
    if (maPhongDaChon && maPhongDaChon !== phong.id) {
      setDanhSachGiuongDaChon([giuong.id]);
      setMaPhongDaChon(phong.id);
      return;
    }

    setMaPhongDaChon(phong.id);
    setDanhSachGiuongDaChon((hienTai) => {
      let danhSachMoi;
      if (hienTai.includes(giuong.id)) danhSachMoi = hienTai.filter((maGiuong) => maGiuong !== giuong.id);
      else if (hienTai.length >= soLuongGiuong) danhSachMoi = hienTai;
      else danhSachMoi = [...hienTai, giuong.id];
      
      return danhSachMoi;
    });
  };

  const btnChinhSua_Click = () => {
    setDangChinhSuaKhachHang((dangChinhSua) => !dangChinhSua);
  };

  const rdoHinhThucThue_CheckedChanged = (giaTri: "shared" | "whole") => {
    setHinhThucThue(giaTri);
    setMaPhongDaChon(null);
    setDanhSachGiuongDaChon([]);
    setDaTimKiem(false);
  };

  const btnTaoYeuCauCoc_Click = async () => {
    const hopLe = await form.trigger();
    if (!hopLe) return;

    if (!phongDaChon || soGiuongTinhCoc === 0) {
      toast.error("Vui lòng chọn phòng/giường trước khi tạo yêu cầu cọc.");
      return;
    }

    if (hinhThucThue === "shared" && danhSachGiuongDaChon.length !== soLuongGiuong) {
      toast.error("Vui lòng chọn đủ số lượng giường cần cọc.");
      return;
    }

    const duLieuKhachHang = form.getValues();

    try {
      const phanHoi = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaLichHen: lichHen.id,
          KhachHang: {
            HoTen: duLieuKhachHang.hoTen,
            SDT: duLieuKhachHang.soDienThoai,
            NgaySinh: duLieuKhachHang.ngaySinh ? new Date(duLieuKhachHang.ngaySinh).toISOString() : null,
            Email: duLieuKhachHang.email,
            GioiTinh: duLieuKhachHang.gioiTinh === "male" ? "Nam" : "Nữ",
            QuocTich: duLieuKhachHang.quocTich,
            LoaiGiayTo: duLieuKhachHang.loaiGiayTo,
            SoGiayTo: duLieuKhachHang.soGiayTo,
          },
          MaPhong: phongDaChon.id,
          DanhSachGiuong: danhSachGiuongDaChon,
          HinhThucThue: hinhThucThue === "shared" ? "OGhep" : "NguyenCan",
          MaNV: "NV03"
        })
      });

      if (!phanHoi.ok) {
        throw new Error("Tạo phiếu cọc thất bại");
      }

      setDanhSachGiuongDaGiu((hienTai) => {
        const danhSachMoi = new Set(hienTai);
        danhSachGiuongDaChon.forEach((maGiuong) => danhSachMoi.add(maGiuong));
        return danhSachMoi;
      });

      toast.success("Yêu cầu đặt cọc đã được khởi tạo và chuyển sang bộ phận Kế toán.");
      khiHoanTat(lichHen.id);
    } catch {
      toast.error("Lỗi: Không thể khởi tạo phiếu cọc.");
    }
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-5 py-3">
        <h1 className="font-mono text-sm font-bold text-gray-900">
          Lập phiếu cọc — {lichHen.code}
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">{lichHen.customerName}</p>
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
                  onClick={btnChinhSua_Click}
                >
                  {dangChinhSuaKhachHang ? "Khóa chỉnh sửa" : "Chỉnh sửa"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hoTen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!dangChinhSuaKhachHang}
                              className={cn(!dangChinhSuaKhachHang && "bg-gray-50 pr-8")}
                            />
                            {!dangChinhSuaKhachHang && (
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
                    name="soDienThoai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!dangChinhSuaKhachHang}
                              className={cn(!dangChinhSuaKhachHang && "bg-gray-50 pr-8")}
                            />
                            {!dangChinhSuaKhachHang && (
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
                    name="ngaySinh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!dangChinhSuaKhachHang}
                              className={cn(!dangChinhSuaKhachHang && "bg-gray-50 pr-8")}
                            />
                            {!dangChinhSuaKhachHang && (
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
                    name="gioiTinh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!dangChinhSuaKhachHang}
                        >
                          <FormControl>
                            <SelectTrigger className={cn(!dangChinhSuaKhachHang && "bg-gray-50")}>
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
                    name="quocTich"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quốc tịch *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!dangChinhSuaKhachHang}
                              className={cn(!dangChinhSuaKhachHang && "bg-gray-50 pr-8")}
                            />
                            {!dangChinhSuaKhachHang && (
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
                              readOnly={!dangChinhSuaKhachHang}
                              className={cn(!dangChinhSuaKhachHang && "bg-gray-50 pr-8")}
                            />
                            {!dangChinhSuaKhachHang && (
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
                    name="loaiGiayTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại giấy tờ *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!dangChinhSuaKhachHang}
                        >
                          <FormControl>
                            <SelectTrigger className={cn(!dangChinhSuaKhachHang && "bg-gray-50")}>
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
                    name="soGiayTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số giấy tờ *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={String(field.value ?? "")}
                              readOnly={!dangChinhSuaKhachHang}
                              className={cn(!dangChinhSuaKhachHang && "bg-gray-50 pr-8")}
                            />
                            {!dangChinhSuaKhachHang && (
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
                value={hinhThucThue}
                onValueChange={(value) =>
                  rdoHinhThucThue_CheckedChanged(value as "shared" | "whole")
                }
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                <label
                  className={cn(
                    "cursor-pointer rounded-lg border p-3",
                    hinhThucThue === "shared" && "border-blue-500 bg-blue-50",
                  )}
                >
                  <RadioGroupItem value="shared" className="sr-only" />
                  <p className="text-sm font-semibold">Thuê ở ghép</p>
                  <p className="text-xs text-gray-500">Chọn giường cụ thể còn trống</p>
                </label>
                <label
                  className={cn(
                    "cursor-pointer rounded-lg border p-3",
                    hinhThucThue === "whole" && "border-blue-500 bg-blue-50",
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
                    {hinhThucThue === "shared"
                      ? "Số lượng giường cần cọc *"
                      : "Số lượng người ở dự kiến *"}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={soLuongGiuong}
                    onChange={(event) => setSoLuongGiuong(Math.max(1, Number(event.target.value) || 1))}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div className="xl:col-span-2">
                  <Label className="text-xs text-gray-500">Tòa nhà</Label>
                  <Select
                    value={toaNha}
                    onValueChange={(v) => setToaNha(v as typeof toaNha)}
                  >
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
                  <Label className="text-xs text-gray-500">Loại phòng</Label>
                  <Select
                    value={loaiPhong}
                    onValueChange={(v) => setLoaiPhong(v as typeof loaiPhong)}
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
                      value={dinhDangGiaNhap(giaMin)}
                      onChange={(event) => setGiaMin(chuanHoaGiaNhap(event.target.value))}
                      className="h-8 min-w-0 text-xs"
                    />
                    <Label className="shrink-0 text-xs text-gray-500">-</Label>
                    <Input
                      inputMode="numeric"
                      value={dinhDangGiaNhap(giaMax)}
                      onChange={(event) => setGiaMax(chuanHoaGiaNhap(event.target.value))}
                      className="h-8 min-w-0 text-xs"
                    />
                    <span className="shrink-0 text-[11px] text-gray-400">VNĐ</span>
                    {(giaMin || giaMax) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-gray-400 hover:text-gray-700"
                        onClick={() => {
                          setGiaMin("");
                          setGiaMax("");
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
                    onClick={btnTimKiem_Click}
                  >
                    <Search className="size-3.5" />
                    Tìm kiếm
                  </Button>
                </div>
              </div>
              {khoangGiaKhongHopLe && (
                <p className="text-xs font-medium text-red-600">Khoảng giá không hợp lệ.</p>
              )}
            </CardContent>
          </Card>

          {daTimKiem && (
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                {danhSachPhong.length === 0 ? (
                  <p className="text-sm text-amber-600">
                    Không tìm thấy phòng phù hợp với nhu cầu hiện tại.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {danhSachPhong.map((phong) => (
                      <div
                        key={phong.id}
                        className={cn(
                          "rounded-lg border p-3",
                          maPhongDaChon === phong.id && "border-blue-300 bg-blue-50/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {phong.code} • Phòng {phong.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              Sức chứa {phong.maxCapacity} • {dinhDangTien(phong.basePrice)}/giường/tháng
                            </p>
                          </div>
                          {hinhThucThue === "whole" && (
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => grvDanhSachPhong_CellClick(phong)}
                            >
                              Chọn phòng
                            </Button>
                          )}
                        </div>

                        {hinhThucThue === "shared" && (
                          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                            {phong.beds.map((giuong) => {
                              const duocChon = danhSachGiuongDaChon.includes(giuong.id);
                              const nhanTrangThai = layNhanTrangThaiGiuong(
                                danhSachGiuongDaGiu.has(giuong.id) ? "deposited" : giuong.status,
                              );
                              const biKhoa =
                                giuong.status !== "available" || danhSachGiuongDaGiu.has(giuong.id);

                              return (
                                <label
                                  key={giuong.id}
                                  className={cn(
                                    "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                                    biKhoa
                                      ? "cursor-not-allowed bg-gray-50 text-gray-400"
                                      : "cursor-pointer hover:border-blue-300",
                                    duocChon && "border-blue-400 bg-blue-50",
                                  )}
                                >
                                  <Checkbox
                                    checked={duocChon}
                                    disabled={biKhoa}
                                    onCheckedChange={() => grvDanhSachGiuong_CellClick(phong, giuong)}
                                  />
                                  <span className="font-mono">{giuong.code}</span>
                                  <Badge
                                    className={cn("ml-auto h-5 text-[10px]", nhanTrangThai.className)}
                                  >
                                    {nhanTrangThai.text}
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
                    {phongDaChon?.code ?? "Chưa chọn"}
                  </span>
                </p>
                <p>
                  Giường đã chọn:{" "}
                  <span className="font-semibold text-gray-900">
                    {maGiuongDaChon.length ? maGiuongDaChon.join(", ") : "Chưa chọn"}
                  </span>
                </p>
                <p>
                  Số giường tính cọc:{" "}
                  <span className="font-semibold text-gray-900">{soGiuongTinhCoc}</span>
                </p>
              </div>
              <p className="mt-3 text-lg font-bold text-emerald-600">
                Tạm tính tiền cọc: {dinhDangTien(tienCocTamTinh)}
              </p>
              {phongDaChon && soGiuongTinhCoc > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {dinhDangTien(phongDaChon.basePrice)} × {soGiuongTinhCoc} giường
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
          onClick={() => void btnTaoYeuCauCoc_Click()}
        >
          <Send className="size-4" />
          Tạo yêu cầu cọc & Gửi kế toán
        </Button>
      </footer>
    </section>
  );
}
