import { useEffect, useState } from "react";
import {
  BedDouble,
  CheckCircle2,
  DoorClosed,
  FileText,
  Save,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import {
  MembersTable,
  newMember,
  type Member,
} from "@/features/contracts/components/MembersTable";
import {
  nhapHoSo,
  type PhieuCocDetail,
} from "@/features/residence/services/residence-service";

type Props = { deposit: PhieuCocDetail | null; onSaved: () => void };

export function ResidenceForm({ deposit, onSaved }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [hoTen, setHoTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [email, setEmail] = useState("");
  const [gioiTinh, setGioiTinh] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [quocTich, setQuocTich] = useState("");
  const [loaiGiayTo, setLoaiGiayTo] = useState("");
  const [soGiayTo, setSoGiayTo] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrTinh, setAddrTinh] = useState("");
  const [addrQuan, setAddrQuan] = useState("");
  const [addrPhuong, setAddrPhuong] = useState("");
  const [addrOverseas, setAddrOverseas] = useState("");
  const [saving, setSaving] = useState(false);
  const isVietnamese = quocTich.trim().toLowerCase() === "việt nam";

  useEffect(() => {
    if (!deposit) return;
    setMembers([]);
    setHoTen(deposit.hoTenKhachHang);
    setSdt(deposit.sdt ?? "");
    setEmail(deposit.email ?? "");
    setGioiTinh(deposit.gioiTinh ?? "");
    setNgaySinh(deposit.ngaySinh ?? "");
    setQuocTich(deposit.quocTich ?? "");
    setLoaiGiayTo(deposit.loaiGiayTo ?? "");
    setSoGiayTo(deposit.soGiayTo ?? "");
    setAddrStreet("");
    setAddrTinh("");
    setAddrQuan("");
    setAddrPhuong("");
    setAddrOverseas("");
  }, [deposit?.maPhieuCoc]);

  useEffect(() => {
    if (!deposit) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deposit, members, hoTen, sdt, email, gioiTinh, ngaySinh, quocTich, loaiGiayTo, soGiayTo, addrStreet, addrTinh, addrQuan, addrPhuong, addrOverseas]);

  const buildDiaChi = () => {
    if (!isVietnamese) return addrOverseas;
    return [addrStreet, addrPhuong, addrQuan, addrTinh].filter(Boolean).join(", ");
  };

  const handleSave = async () => {
    if (!deposit) return;
    setSaving(true);
    try {
      const diaChi = buildDiaChi();
      await nhapHoSo(deposit.maPhieuCoc, {
        nguoiDaiDien: {
          hoTen,
          ngaySinh: ngaySinh || null,
          gioiTinh: gioiTinh || null,
          quocTich: quocTich || null,
          loaiGiayTo: loaiGiayTo || null,
          soGiayTo: soGiayTo || null,
          diaChiThuongTru: diaChi || null,
          sdt: sdt || null,
          email: email || null,
        },
        hinhThucThue: deposit.soGiuongThue > 1 ? "TheoNhom" : "CaNhan",
        danhSachThanhVien:
          members.length > 0
            ? members.map((m) => ({
                hoTen: m.fullName,
                ngaySinh: m.dob ? new Date(m.dob.split("/").reverse().join("-")).toISOString() : null,
                gioiTinh: m.gender === "male" ? "Nam" : m.gender === "female" ? "Nữ" : null,
                quocTich: m.nationality,
                loaiGiayTo: m.docType === "cccd" ? "CCCD" : "Hộ chiếu",
                soGiayTo: m.docId,
                diaChiThuongTru: m.diaChiThuongTru || null,
                sdt: m.phone || null,
                email: null,
              }))
            : null,
      });
      toast.success("Lưu hồ sơ thành công", {
        description: `Phiếu #${deposit.maPhieuCoc} chuyển sang trạng thái "Chờ duyệt".`,
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  const canAddMember = deposit ? 1 + members.length < deposit.soGiuongThue : false;
  const isWholeRoom = deposit?.hinhThucThue === "NguyenCan";
  const soGiuongLabel = isWholeRoom
    ? `${deposit?.soGiuongThue ?? 0} giường (sức chứa tối đa)`
    : `${deposit?.soGiuongThue ?? 0} giường`;

  if (!deposit) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
            <FileText className="size-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            Chọn một phiếu cọc từ danh sách bên trái để bắt đầu nhập hồ sơ lưu trú.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex h-full flex-1 flex-col overflow-hidden bg-white">
      <header className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-600">#{deposit.maPhieuCoc}</span>
              <h1 className="text-base font-bold leading-tight text-gray-900">
                {deposit.hoTenKhachHang}
              </h1>
              <Badge className="h-5 border-transparent bg-emerald-100 px-2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
                Đã thanh toán
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 border-blue-200 bg-blue-50 px-1.5 text-[10px] font-medium text-blue-600"
              >
                <BedDouble className="size-3" />
                {soGiuongLabel}
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 px-1.5 text-[10px] font-medium text-gray-600"
              >
                {isWholeRoom ? <DoorClosed className="size-3" /> : <Users className="size-3" />}
                {isWholeRoom ? "Thuê nguyên phòng" : "Thuê ở ghép"}
              </Badge>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-4 text-xs text-gray-500 lg:flex">
            <span className="font-mono font-semibold text-gray-700">{deposit.soPhong}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-white px-6 py-5 pb-24">
        <div className="mx-auto max-w-4xl space-y-5">
          <FormCard>
            <SectionHeader
              icon={<UserRound className="size-4 text-blue-500" />}
              title="Thông tin khách lưu trú"
            />

            <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Thông tin khách hàng
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <FormField label="Họ và tên">
                  <Input value={hoTen} onChange={(e) => setHoTen(e.target.value)} className={inputCls} />
                </FormField>
                <FormField label="Số điện thoại">
                  <Input value={sdt} onChange={(e) => setSdt(e.target.value)} className={cn(inputCls, "font-mono")} />
                </FormField>
                <FormField label="Địa chỉ email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                </FormField>
                <FormField label="Giới tính">
                  <Select value={gioiTinh} onValueChange={setGioiTinh}>
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Ngày sinh">
                  <Input type="date" value={ngaySinh} onChange={(e) => setNgaySinh(e.target.value)} className={inputCls} />
                </FormField>
                <FormField label="Quốc tịch">
                  <Input value={quocTich} onChange={(e) => setQuocTich(e.target.value)} className={inputCls} />
                </FormField>
                <FormField label="Loại giấy tờ">
                  <Select value={loaiGiayTo} onValueChange={setLoaiGiayTo}>
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Chọn loại giấy tờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CCCD">CCCD</SelectItem>
                      <SelectItem value="Hộ chiếu">Hộ chiếu</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Số giấy tờ">
                  <Input value={soGiayTo} onChange={(e) => setSoGiayTo(e.target.value)} className={cn(inputCls, "font-mono")} />
                </FormField>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Địa chỉ thường trú
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div className="col-span-2 space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-medium text-gray-600">
                    {isVietnamese ? "Địa chỉ thường trú" : "Địa chỉ tại nước ngoài"}
                  </span>
                  <span className="text-red-500 text-xs">*</span>
                </div>
                {isVietnamese ? (
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                    <div className="col-span-3">
                      <Input
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        placeholder="Nhập số nhà, tên đường, phường/xã"
                        className={inputCls}
                      />
                    </div>

                    <FormField label="Tỉnh / TP" required>
                      <Select value={addrTinh} onValueChange={setAddrTinh}>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Chọn Tỉnh/TP" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                          <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                          <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                          <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                          <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                          <SelectItem value="Bình Dương">Bình Dương</SelectItem>
                          <SelectItem value="Đồng Nai">Đồng Nai</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Quận / Huyện" required>
                      <Select value={addrQuan} onValueChange={setAddrQuan}>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Chọn Quận/Huyện" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quận 1">Quận 1</SelectItem>
                          <SelectItem value="Quận 3">Quận 3</SelectItem>
                          <SelectItem value="Quận 5">Quận 5</SelectItem>
                          <SelectItem value="Quận 7">Quận 7</SelectItem>
                          <SelectItem value="Quận 10">Quận 10</SelectItem>
                          <SelectItem value="Quận Bình Thạnh">Quận Bình Thạnh</SelectItem>
                          <SelectItem value="Quận Tân Bình">Quận Tân Bình</SelectItem>
                          <SelectItem value="Quận Gò Vấp">Quận Gò Vấp</SelectItem>
                          <SelectItem value="Quận Phú Nhuận">Quận Phú Nhuận</SelectItem>
                          <SelectItem value="Huyện Hóc Môn">Huyện Hóc Môn</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Phường / Xã" required>
                      <Select value={addrPhuong} onValueChange={setAddrPhuong}>
                        <SelectTrigger className={inputCls}>
                          <SelectValue placeholder="Chọn Phường/Xã" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phường Bến Nghé">Phường Bến Nghé</SelectItem>
                          <SelectItem value="Phường Cô Giang">Phường Cô Giang</SelectItem>
                          <SelectItem value="Phường Đa Kao">Phường Đa Kao</SelectItem>
                          <SelectItem value="Phường 1">Phường 1</SelectItem>
                          <SelectItem value="Phường 2">Phường 2</SelectItem>
                          <SelectItem value="Phường 3">Phường 3</SelectItem>
                          <SelectItem value="Phường 4">Phường 4</SelectItem>
                          <SelectItem value="Phường 6">Phường 6</SelectItem>
                          <SelectItem value="Phường 7">Phường 7</SelectItem>
                          <SelectItem value="Phường 12">Phường 12</SelectItem>
                          <SelectItem value="Phường 14">Phường 14</SelectItem>
                          <SelectItem value="Phường 15">Phường 15</SelectItem>
                          <SelectItem value="Xã Tân Xuân">Xã Tân Xuân</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                ) : (
                  <Input
                    value={addrOverseas}
                    onChange={(e) => setAddrOverseas(e.target.value)}
                    placeholder="Nhập địa chỉ đầy đủ tại nước ngoài"
                    className={inputCls}
                  />
                )}
              </div>
            </div>
          </FormCard>

          {deposit.soGiuongThue > 1 && (
            <FormCard>
              <SectionHeader
                icon={<Users className="size-4 text-blue-500" />}
                title="Người ở cùng"
                badge={
                  members.length > 0 ? (
                    <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                      {members.length}
                    </span>
                  ) : null
                }
              />

              {members.length > 0 && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  <span>
                    Đại diện (1) + Thành viên ({members.length}) ={" "}
                    <strong className="text-gray-700">{1 + members.length}</strong> /{" "}
                    {deposit.soGiuongThue} giường đã đăng ký
                  </span>
                  {1 + members.length === deposit.soGiuongThue && (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle2 className="size-3.5" /> Đủ số lượng
                    </span>
                  )}
                </div>
              )}

              <MembersTable
                members={members}
                onChange={setMembers}
                canAddMember={canAddMember}
                maxMembers={deposit.soGiuongThue - 1}
              />
            </FormCard>
          )}
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-1px_4px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-4xl items-center justify-end">
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              disabled={saving}
              onClick={() => void handleSave()}
              className="h-9 gap-1.5 bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              <Save className="size-3.5" />
              {saving ? "Đang lưu..." : "Lưu hồ sơ"}
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}

const inputCls =
  "h-10 rounded-lg border-gray-200 bg-white text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500";

function FormCard({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">{children}</div>;
}

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">{icon}</div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {badge}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </Label>
      {children}
    </div>
  );
}


