import { useState } from "react";
import { Trash2, Plus, Pencil } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

export type Member = {
  id: string;
  fullName: string;
  gender: "male" | "female" | "";
  dob: string;
  docType: "cccd" | "passport";
  docId: string;
  phone: string;
  diaChiThuongTru: string;
  nationality: string;
};

export const newMember = (): Member => ({
  id: crypto.randomUUID(),
  fullName: "",
  gender: "",
  dob: "",
  docType: "cccd",
  docId: "",
  phone: "",
  diaChiThuongTru: "",
  nationality: "Việt Nam",
});

type Props = {
  members: Member[];
  onChange: (next: Member[]) => void;
  canAddMember?: boolean;
  maxMembers?: number;
};

const inputCls =
  "h-9 border-gray-200 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500";

const isVietnameseNationality = (value: string) => value.trim().toLowerCase() === "việt nam";
const usesOverseasAddress = (member: Pick<Member, "docType" | "nationality">) =>
  member.docType === "passport" ||
  (!!member.nationality && !isVietnameseNationality(member.nationality));

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
      <Label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </Label>
      {children}
    </div>
  );
}

export function MembersTable({ members, onChange, canAddMember = true, maxMembers = 99 }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for the modal
  const [formData, setFormData] = useState<Member>(newMember());

  // Address fields (Vietnam)
  const [addrStreet, setAddrStreet] = useState("");
  const [addrTinh, setAddrTinh] = useState("");
  const [addrQuan, setAddrQuan] = useState("");
  const [addrPhuong, setAddrPhuong] = useState("");

  // Address field (Overseas)
  const [addrOverseas, setAddrOverseas] = useState("");

  const remove = (id: string) => onChange(members.filter((m) => m.id !== id));

  const openAdd = () => {
    setFormData(newMember());
    setAddrStreet("");
    setAddrTinh("");
    setAddrQuan("");
    setAddrPhuong("");
    setAddrOverseas("");
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (m: Member) => {
    setFormData({ ...m });
    if (usesOverseasAddress(m)) {
      setAddrOverseas(m.diaChiThuongTru);
      setAddrStreet("");
      setAddrPhuong("");
      setAddrQuan("");
      setAddrTinh("");
    } else {
      const parts = m.diaChiThuongTru.split(", ");
      setAddrStreet(parts[0] || "");
      setAddrPhuong(parts[1] || "");
      setAddrQuan(parts[2] || "");
      setAddrTinh(parts[3] || "");
      setAddrOverseas("");
    }
    setEditingId(m.id);
    setIsOpen(true);
  };

  const handleSave = () => {
    let fullAddress = "";
    if (usesOverseasAddress(formData)) {
      fullAddress = addrOverseas;
    } else {
      fullAddress = [addrStreet, addrPhuong, addrQuan, addrTinh].filter(Boolean).join(", ");
    }

    const finalMember = { ...formData, diaChiThuongTru: fullAddress };

    if (editingId) {
      onChange(members.map((m) => (m.id === editingId ? finalMember : m)));
    } else {
      onChange([...members, finalMember]);
    }
    setIsOpen(false);
  };

  const handleNationalityChange = (value: string) => {
    const vietnamese = isVietnameseNationality(value);
    setFormData({ ...formData, nationality: value, docType: vietnamese ? "cccd" : "passport" });
    if (vietnamese) {
      setAddrOverseas("");
    } else {
      setAddrStreet("");
      setAddrTinh("");
      setAddrQuan("");
      setAddrPhuong("");
    }
  };

  const handleDocTypeChange = (value: Member["docType"]) => {
    setFormData({ ...formData, docType: value });
    if (value === "passport") {
      setAddrStreet("");
      setAddrTinh("");
      setAddrQuan("");
      setAddrPhuong("");
    } else if (isVietnameseNationality(formData.nationality) || !formData.nationality) {
      setAddrOverseas("");
    }
  };

  const showOverseasAddress = usesOverseasAddress(formData);

  return (
    <div className="space-y-2">
      {members.length === 0 ? (
        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 py-5 text-sm font-medium text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus className="size-4" />
          Thêm người ở cùng
        </button>
      ) : (
        <>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-12 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                    STT
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                    HỌ VÀ TÊN
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                    ĐẶC ĐIỂM
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                    QUỐC TỊCH
                  </TableHead>
                  <TableHead className="w-[170px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                    GIẤY TỜ
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                    SĐT
                  </TableHead>
                  <TableHead className="w-[80px] py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    HÀNH ĐỘNG
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m, i) => {
                  const genderStr =
                    m.gender === "male" ? "Nam" : m.gender === "female" ? "Nữ" : "—";
                  const year = m.dob ? m.dob.split("/").pop() : "—";
                  const docTypeStr =
                    m.docType === "cccd" ? "CCCD" : m.docType === "passport" ? "Hộ chiếu" : "—";

                  return (
                    <TableRow
                      key={m.id}
                      className="hover:bg-blue-50/40 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <TableCell className="text-center text-xs text-gray-400 tabular-nums font-medium py-2.5">
                        {i + 1}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm font-semibold text-gray-800">
                        {m.fullName || "—"}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-gray-600">
                        {genderStr} &bull; {year}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-slate-600">
                        {m.nationality || "Việt Nam"}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-gray-600">
                        {docTypeStr}: <span className="font-mono">{m.docId || "—"}</span>
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-gray-600 font-mono">
                        {m.phone || "—"}
                      </TableCell>
                      <TableCell className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            onClick={() => openEdit(m)}
                            title="Sửa"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => remove(m.id)}
                            title="Xóa dòng"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openAdd}
            disabled={!canAddMember}
            className="h-8 gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
            title={
              canAddMember ? "Thêm thành viên" : `Đã đạt số người tối đa (${maxMembers + 1} giường)`
            }
          >
            <Plus className="size-3.5" />
            Thêm thành viên
          </Button>
        </>
      )}

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-gray-200">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-base font-bold text-gray-800">
              Khai báo thông tin người ở cùng
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormField label="Họ và tên" required>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Số điện thoại">
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09xx xxx xxx"
                  className={cn(inputCls, "font-mono")}
                />
              </FormField>

              <FormField label="Giới tính" required>
                <Select
                  value={formData.gender || undefined}
                  onValueChange={(v) => setFormData({ ...formData, gender: v as Member["gender"] })}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Ngày sinh" required>
                <Input
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Quốc tịch" required>
                <Input
                  value={formData.nationality}
                  onChange={(e) => handleNationalityChange(e.target.value)}
                  placeholder="Việt Nam"
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormField label="Loại giấy tờ" required>
                <Select
                  value={formData.docType}
                  onValueChange={(v) => handleDocTypeChange(v as Member["docType"])}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cccd">CCCD</SelectItem>
                    <SelectItem value="passport">Hộ chiếu</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Số giấy tờ" required>
                <Input
                  value={formData.docId}
                  onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                  placeholder={formData.docType === "cccd" ? "012345678901" : "B1234567"}
                  className={cn(inputCls, "font-mono")}
                />
              </FormField>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-gray-600">
                  {showOverseasAddress ? "Địa chỉ tại nước ngoài" : "Địa chỉ thường trú"}
                </span>
                <span className="text-red-500 text-xs">*</span>
              </div>

              {showOverseasAddress ? (
                <div className="w-full">
                  <Input
                    value={addrOverseas}
                    onChange={(e) => setAddrOverseas(e.target.value)}
                    placeholder="Nhập địa chỉ đầy đủ tại nước ngoài"
                    className={inputCls}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <FormField label="Số nhà, Tên đường" required>
                    <Input
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      placeholder="VD: 123 Nguyễn Huệ"
                      className={inputCls}
                    />
                  </FormField>

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
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-9 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="h-9 bg-blue-600 text-white hover:bg-blue-700"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
