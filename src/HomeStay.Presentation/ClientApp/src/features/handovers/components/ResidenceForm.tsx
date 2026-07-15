import { useEffect, useState } from "react";
import {
  BedDouble,
  CheckCircle2,
  DoorClosed,
  FileText,
  Lock,
  Save,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { MembersTable, type Member } from "@/features/contracts/components/MembersTable";
import { nhapHoSo, type PhieuCocDetail } from "@/features/residence/services/residence-service";
import { VietnamAddressSelect } from "@/features/residence/components/VietnamAddressSelect";
import {
  formatVietnamAddress,
  isValidVietnamAddress,
} from "@/features/residence/services/vietnam-address-service";

type Props = { deposit: PhieuCocDetail | null; onSaved: () => void };

export function ResidenceForm({ deposit, onSaved }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [addrStreet, setAddrStreet] = useState("");
  const [addrTinh, setAddrTinh] = useState("");
  const [addrPhuong, setAddrPhuong] = useState("");
  const [addrOverseas, setAddrOverseas] = useState("");
  const [saving, setSaving] = useState(false);
  const isVietnamese = (deposit?.quocTich ?? "Việt Nam").trim().toLowerCase() === "việt nam";

  useEffect(() => {
    if (!deposit) return;
    setMembers([]);
    setAddrStreet("");
    setAddrTinh("");
    setAddrPhuong("");
    setAddrOverseas("");
  }, [deposit]);

  const buildDiaChi = () => {
    if (!isVietnamese) return addrOverseas;
    return formatVietnamAddress(addrStreet, addrTinh, addrPhuong);
  };

  const handleSave = async () => {
    if (!deposit) return;
    const diaChi = buildDiaChi().trim();
    if (
      !diaChi
      || (isVietnamese
        && (!addrStreet.trim() || !isValidVietnamAddress(addrTinh, addrPhuong)))
    ) {
      toast.error("Vui lòng nhập đầy đủ địa chỉ thường trú.");
      return;
    }
    setSaving(true);
    try {
      await nhapHoSo(deposit.maPhieuCoc, {
        diaChiThuongTru: diaChi,
        danhSachThanhVien:
          members.length > 0
            ? members.map((m) => ({
                hoTen: m.fullName,
                ngaySinh: m.dob
                  ? new Date(m.dob.split("/").reverse().join("-")).toISOString()
                  : null,
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

  const maxOccupants = deposit ? Math.min(deposit.soGiuongThue, deposit.sucChua) : 1;
  const canAddMember = deposit ? 1 + members.length < maxOccupants : false;
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
              <span className="font-mono text-sm font-bold text-blue-600">
                #{deposit.maPhieuCoc}
              </span>
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
                  Thông tin từ phiếu cọc
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <LockedField label="Họ và tên" value={deposit.hoTenKhachHang} />
                <LockedField label="Số điện thoại" value={deposit.sdt} mono />
                <LockedField label="Địa chỉ email" value={deposit.email} />
                <LockedField label="Giới tính" value={deposit.gioiTinh} />
                <LockedField label="Ngày sinh" value={formatDisplayDate(deposit.ngaySinh)} />
                <LockedField label="Quốc tịch" value={deposit.quocTich} />
                <LockedField label="Loại giấy tờ" value={deposit.loaiGiayTo} />
                <LockedField label="Số giấy tờ" value={deposit.soGiayTo} mono />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Thông tin cư trú
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
                        placeholder="Nhập số nhà, tên đường, thôn/ấp"
                        className={inputCls}
                      />
                    </div>
                    <VietnamAddressSelect
                      provinceCode={addrTinh}
                      wardCode={addrPhuong}
                      onProvinceChange={setAddrTinh}
                      onWardChange={setAddrPhuong}
                      className="col-span-3"
                      triggerClassName={inputCls}
                    />
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
                    <strong className="text-gray-700">{1 + members.length}</strong> / {maxOccupants}{" "}
                    giường đã đăng ký
                  </span>
                  {1 + members.length === maxOccupants && (
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
                maxMembers={maxOccupants - 1}
              />
            </FormCard>
          )}
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-1px_4px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-4xl items-center justify-end">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
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

function LockedField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-gray-600">{label}</Label>
      <div className="relative">
        <Input
          value={value ?? ""}
          readOnly
          className={cn(
            "h-10 rounded-lg border-gray-200 bg-gray-50 pr-8 text-sm text-gray-700 shadow-none",
            mono && "font-mono",
          )}
        />
        <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-300" />
      </div>
    </div>
  );
}

function formatDisplayDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}
