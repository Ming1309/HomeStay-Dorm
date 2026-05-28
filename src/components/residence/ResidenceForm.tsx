import { useEffect, useRef, useState } from "react";
import {
  BedDouble,
  Building2Icon,
  CheckCircle2,
  DoorClosed,
  FileText,
  Lock,
  Plus,
  Save,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Deposit } from "@/lib/residence/mock-deposits";
import { MembersTable, newMember, type Member } from "./MembersTable";

type Props = { deposit: Deposit | null };

export function ResidenceForm({ deposit }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("Việt Nam");
  const [docType, setDocType] = useState("cccd");
  const [docId, setDocId] = useState("");
  // Address sub-fields — concatenated on save
  const [addrStreet, setAddrStreet] = useState("");
  const [addrTinh, setAddrTinh] = useState("");
  const [addrQuan, setAddrQuan] = useState("");
  const [addrPhuong, setAddrPhuong] = useState("");
  const [addrOverseas, setAddrOverseas] = useState("");
  const dobRef = useRef<HTMLInputElement>(null);
  const isVietnamese = nationality.trim().toLowerCase() === "việt nam";

  // Reset form when deposit changes
  useEffect(() => {
    setMembers([]);
    setDob("");
    setNationality("Việt Nam");
    setDocType("cccd");
    setDocId("");
    setAddrStreet("");
    setAddrTinh("");
    setAddrQuan("");
    setAddrPhuong("");
    setAddrOverseas("");
    setTimeout(() => dobRef.current?.focus(), 80);
  }, [deposit?.id]);

  // Ctrl/Cmd + S → save
  useEffect(() => {
    if (!deposit) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deposit]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = (draft = false) => {
    if (!deposit) return;
    toast.success(draft ? "Đã lưu nháp" : "Lưu hồ sơ thành công", {
      description: draft
        ? `Phiếu #${deposit.code} đã được lưu tạm.`
        : `Phiếu #${deposit.code} chuyển sang trạng thái "Chờ duyệt".`,
      icon: <CheckCircle2 className="size-4 text-emerald-500" />,
    });
  };

  const handleNationalityChange = (value: string) => {
    setNationality(value);
    if (value.trim().toLowerCase() === "việt nam") {
      setDocType("cccd");
      setAddrOverseas("");
    } else {
      setDocType("passport");
      setAddrStreet("");
      setAddrTinh("");
      setAddrQuan("");
      setAddrPhuong("");
    }
  };

  const canAddMember = deposit ? 1 + members.length < deposit.bedsRented : false;
  const isWholeRoom = deposit?.rentalType === "whole";

  /* ── Empty state ─────────────────────────────────────────────────────── */
  if (!deposit) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white">
            <FileText className="size-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            Chọn một phiếu cọc từ danh sách bên trái để bắt đầu nhập hồ sơ lưu trú.
          </p>
        </div>
      </section>
    );
  }

  /* ── Main form ───────────────────────────────────────────────────────── */
  return (
    <section className="relative flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Left: breadcrumb + badges */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-600">#{deposit.code}</span>
              <h1 className="text-sm font-semibold text-gray-800 leading-tight">
                {deposit.customerName}
              </h1>
              <Badge className="h-5 border-transparent bg-emerald-100 px-2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
                Đã thanh toán
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 border-blue-200 bg-blue-50 px-1.5 text-[10px] font-medium text-blue-600"
              >
                <BedDouble className="size-3" />
                {deposit.bedsRented} giường
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

          {/* Right: meta */}
          <div className="shrink-0 text-right text-xs text-gray-400">
            <div>
              Phòng: <span className="font-mono font-semibold text-gray-700">{deposit.room}</span>
            </div>
            <div>
              Giờ hẹn:{" "}
              <span className="font-semibold text-gray-700 tabular-nums">{deposit.time}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 pb-24">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* ════════════════════════════════════════════════════════════
              SECTION 1 — MAIN GUEST INFORMATION
          ════════════════════════════════════════════════════════════ */}
          <FormCard>
            <SectionHeader
              icon={<UserRound className="size-4 text-blue-500" />}
              title="Thông tin khách lưu trú"
            />

            {/* Block A: Read-only from deposit */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <Lock className="size-3.5 text-gray-400" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Thông tin từ phiếu cọc
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <LockedField label="Họ và tên" value={deposit.customerName} />
                <LockedField label="Số điện thoại" value={deposit.phone} mono />
                <LockedField label="Địa chỉ email" value={deposit.email} />
                <LockedField label="Giới tính" value={deposit.gender === "male" ? "Nam" : "Nữ"} />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Thông tin cư trú <span className="text-red-500">*</span>
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Block B: Editable residence fields */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormField label="Ngày sinh" required>
                <Input
                  ref={dobRef}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Quốc tịch" required>
                <Input
                  value={nationality}
                  onChange={(e) => handleNationalityChange(e.target.value)}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Loại giấy tờ" required>
                <Select value={docType} onValueChange={setDocType}>
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
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  placeholder={docType === "cccd" ? "012 345 678 901" : "B1234567"}
                  className={cn(inputCls, "font-mono")}
                />
              </FormField>

              <div className="col-span-2 space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-medium text-gray-600">
                    {isVietnamese ? "Địa chỉ thường trú" : "Địa chỉ tại nước ngoài"}
                  </span>
                  <span className="text-red-500 text-xs">*</span>
                </div>
                {isVietnamese ? (
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

          {/* ════════════════════════════════════════════════════════════
              SECTION 2 — ACCOMPANYING MEMBERS
          ════════════════════════════════════════════════════════════ */}
          {deposit.bedsRented > 1 && (
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

              {/* Capacity bar */}
              {members.length > 0 && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  <span>
                    Đại diện (1) + Thành viên ({members.length}) ={" "}
                    <strong className="text-gray-700">{1 + members.length}</strong> /{" "}
                    {deposit.bedsRented} giường đã đăng ký
                  </span>
                  {1 + members.length === deposit.bedsRented && (
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
                maxMembers={deposit.bedsRented - 1}
              />
            </FormCard>
          )}
        </div>
      </div>

      {/* ── Sticky footer ─────────────────────────────────────────────── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Keyboard hint */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Kbd>⌘</Kbd>
            <span>+</span>
            <Kbd>S</Kbd>
            <span className="ml-1">để lưu</span>
            <span className="mx-2 text-gray-300">·</span>
            <Kbd>Tab</Kbd>
            <span className="ml-1">ô tiếp theo</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(true)}
              className="h-8 border-gray-300 px-4 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
            >
              Lưu nháp
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(false)}
              className="h-8 gap-1.5 bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              <Save className="size-3.5" />
              Lưu hồ sơ
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}

/* ── Shared style token ─────────────────────────────────────────────────── */
const inputCls =
  "h-9 border-gray-200 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500";

/* ── Sub-components ─────────────────────────────────────────────────────── */

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      {children}
    </div>
  );
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
    <div className="flex items-center gap-2.5 pb-1 border-b border-gray-100">
      <div className="flex size-7 items-center justify-center rounded-md bg-blue-50">{icon}</div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
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
      <Label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function LockedField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-500">{label}</Label>
      <div className="relative">
        <Input
          value={value}
          readOnly
          className={cn(
            "h-9 border-gray-200 bg-white pr-8 text-sm text-gray-700 shadow-none",
            mono && "font-mono",
          )}
        />
        <Lock className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-300" />
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-500 shadow-sm">
      {children}
    </kbd>
  );
}
