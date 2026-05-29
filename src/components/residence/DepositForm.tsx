import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useWorkflowStore,
  type Appointment,
  type Bed,
} from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function DepositForm({
  appointment,
  onDone,
}: {
  appointment: Appointment;
  onDone: () => void;
}) {
  const { rooms, createDepositRequest } = useWorkflowStore();

  const room = rooms.find((r) => r.id === appointment.roomId);

  const [editing, setEditing] = useState(false);
  const [customerName, setCustomerName] = useState(appointment.customerName);
  const [phone, setPhone] = useState(appointment.phone);
  const [email, setEmail] = useState(appointment.email);
  const [gender, setGender] = useState<"male" | "female">(appointment.gender);
  const [rentalType, setRentalType] = useState<"shared" | "whole">("shared");
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCustomerName(appointment.customerName);
    setPhone(appointment.phone);
    setEmail(appointment.email);
    setGender(appointment.gender);
    setRentalType("shared");
    setSelectedBeds([]);
    setAgreedToTerms(false);
    setEditing(false);
  }, [appointment.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [rentalType, selectedBeds, agreedToTerms]);

  const availableBeds: Bed[] = useMemo(() => {
    if (!room) return [];
    if (rentalType === "whole") {
      return room.beds.filter((b) => b.status === "available");
    }
    return room.beds.filter((b) => b.status === "available");
  }, [room, rentalType]);

  const handleBedToggle = (bedId: string) => {
    setSelectedBeds((prev) =>
      prev.includes(bedId) ? prev.filter((id) => id !== bedId) : [...prev, bedId],
    );
  };

  const handleSave = () => {
    if (!agreedToTerms) {
      toast.error("Vui lòng xác nhận khách hàng đã đồng ý với điều khoản và nội quy.");
      return;
    }
    if (selectedBeds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một giường.");
      return;
    }
    if (rentalType === "whole" && room && selectedBeds.length < room.maxCapacity) {
      toast.warning("Thuê nguyên phòng cần chọn tất cả giường trong phòng.");
      return;
    }

    setSaving(true);
    createDepositRequest({
      appointmentId: appointment.id,
      customerName,
      phone,
      email,
      gender,
      roomId: appointment.roomId,
      room: appointment.room,
      rentalType,
      selectedBedIds: selectedBeds,
      basePrice: room?.basePrice ?? 0,
      groupId: null,
    });
    toast.success(`Phiếu cọc đã được tạo thành công.`, {
      icon: <CheckCircle2 className="size-4 text-emerald-100" />,
    });
    setSaving(false);
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="font-mono text-sm font-bold text-gray-900">
            Lập phiếu cọc — {appointment.code}
          </h1>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {appointment.customerName} • {appointment.room}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700">Thông tin khách hàng</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600"
                onClick={() => setEditing(!editing)}
              >
                <Pencil className="mr-1 size-3" />
                {editing ? "Đóng" : "Chỉnh sửa"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <FormFieldReadonly
                label="Họ và tên"
                value={customerName}
                editing={editing}
                onChange={setCustomerName}
              />
              <FormFieldReadonly
                label="Số điện thoại"
                value={phone}
                editing={editing}
                onChange={setPhone}
              />
              <FormFieldReadonly
                label="Email"
                value={email}
                editing={editing}
                onChange={setEmail}
              />
              <div>
                <p className="mb-1 text-xs text-gray-500">Giới tính</p>
                {editing ? (
                  <Select
                    value={gender}
                    onValueChange={(v) => setGender(v as "male" | "female")}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male" className="text-xs">Nam</SelectItem>
                      <SelectItem value="female" className="text-xs">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-800">{gender === "male" ? "Nam" : "Nữ"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">Thông tin thuê</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Hình thức thuê</Label>
                <Select
                  value={rentalType}
                  onValueChange={(v) => {
                    const type = v as "shared" | "whole";
                    setRentalType(type);
                    if (type === "whole") {
                      setSelectedBeds(availableBeds.map((b) => b.id));
                    } else {
                      setSelectedBeds([]);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared" className="text-xs">Thuê ở ghép</SelectItem>
                    <SelectItem value="whole" className="text-xs">Thuê nguyên phòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500">
                Phòng: <span className="font-mono text-gray-700">{appointment.room}</span>
                {room && (
                  <>
                    {" • "}
                    <span className="text-gray-700">{room.type}</span>
                    {" • "}
                    <span className="text-gray-700">{formatCurrency(room.basePrice)}/tháng</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700">
              Chọn giường
              {rentalType === "whole" && (
                <span className="ml-1 font-normal text-gray-400">
                  (chọn {room?.maxCapacity ?? 0} giường)
                </span>
              )}
            </h3>
            {availableBeds.length === 0 ? (
              <p className="text-sm text-amber-600">
                Không còn giường trống trong phòng này.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableBeds.map((bed) => {
                  const selected = selectedBeds.includes(bed.id);
                  return (
                    <label
                      key={bed.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                        selected
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30",
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => handleBedToggle(bed.id)}
                      />
                      <span className="font-mono text-xs text-gray-800">{bed.code}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(v) => setAgreedToTerms(v === true)}
              />
              <div>
                <Label htmlFor="terms" className="text-sm text-gray-700">
                  Khách hàng đã đồng ý với các điều khoản thuê và nội quy ký túc xá
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <span className="text-xs text-gray-400">
          {saving ? "Đang lưu..." : "Ctrl+S để lưu nhanh"}
        </span>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="h-8 text-xs" disabled={saving}>
                Hủy
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hủy lập phiếu cọc?</AlertDialogTitle>
                <AlertDialogDescription>
                  Thông tin sẽ không được lưu lại.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-8 text-xs">Tiếp tục</AlertDialogCancel>
                <AlertDialogAction
                  className="h-8 text-xs"
                  onClick={() => onDone()}
                >
                  Hủy bỏ
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="button"
            className="h-8 text-xs"
            onClick={handleSave}
            disabled={saving || !agreedToTerms || selectedBeds.length === 0}
          >
            <Save className="mr-1 size-3.5" />
            Lưu
          </Button>
        </div>
      </footer>
    </section>
  );
}

function FormFieldReadonly({
  label,
  value,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      {editing ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs"
        />
      ) : (
        <p className="text-gray-800">{value}</p>
      )}
    </div>
  );
}
