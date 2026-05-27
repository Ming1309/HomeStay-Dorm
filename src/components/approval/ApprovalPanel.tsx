import { useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  DoorClosed,
  FileText,
  Lock,
  ShieldAlert,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ApprovalProfile } from "@/lib/residence/mock-approvals";

/* ── Types ──────────────────────────────────────────────────────────────── */
type RejectedSet = Set<string>; // member IDs that have been rejected

type Props = {
  profile: ApprovalProfile | null;
  onApprove: (profile: ApprovalProfile, rejectedIds: RejectedSet) => void;
  onRejectAll: (profile: ApprovalProfile) => void;
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function ReadonlyField({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", wide && "col-span-2")}>
      <Label className="text-xs font-medium text-gray-500">{label}</Label>
      <div className="relative">
        <Input
          value={value}
          readOnly
          className={cn(
            "h-9 border-gray-200 bg-gray-50 pr-8 text-sm text-gray-700 shadow-none",
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

/* ── Main component ──────────────────────────────────────────────────────── */
export function ApprovalPanel({ profile, onApprove, onRejectAll }: Props) {
  // Track which member IDs are rejected (by manager)
  const [rejectedIds, setRejectedIds] = useState<RejectedSet>(new Set());
  // Pending member rejection confirmation
  const [pendingRejectMemberId, setPendingRejectMemberId] = useState<
    string | null
  >(null);
  // Reject-all dialog open state (controlled separately for keyboard shortcut)
  const [rejectAllOpen, setRejectAllOpen] = useState(false);

  // Reset per-profile state whenever the selected profile changes
  const profileId = profile?.id;
  const [lastProfileId, setLastProfileId] = useState<string | undefined>(
    undefined,
  );
  if (profileId !== lastProfileId) {
    setLastProfileId(profileId);
    setRejectedIds(new Set());
    setPendingRejectMemberId(null);
    setRejectAllOpen(false);
  }

  /* ── Keyboard shortcuts ────────────────────────────────────────────── */
  // We use onKeyDown at document level; attach in a useEffect-free inline handler
  // to keep component simple — just hint shown in footer.

  /* ── Empty state ─────────────────────────────────────────────────────── */
  if (!profile) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white">
            <ClipboardCheck className="size-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            👈 Chọn một hồ sơ từ danh sách bên trái để bắt đầu xét duyệt.
          </p>
        </div>
      </section>
    );
  }

  const { representative: rep, members } = profile;
  const isWholeRoom = profile.rentalType === "whole";
  const hasAnyRejected = rejectedIds.size > 0;
  const activeMembers = members.filter((m) => !rejectedIds.has(m.id));
  const approveButtonLabel = hasAnyRejected
    ? "Duyệt các thành viên còn lại"
    : "Duyệt toàn bộ hồ sơ";

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const confirmRejectMember = () => {
    if (!pendingRejectMemberId) return;
    const member = members.find((m) => m.id === pendingRejectMemberId);
    setRejectedIds((prev) => new Set([...prev, pendingRejectMemberId]));
    setPendingRejectMemberId(null);
    toast.warning(`Đã loại thành viên "${member?.fullName}"`, {
      description: "Thành viên này sẽ không có trong hợp đồng.",
      icon: <XCircle className="size-4 text-amber-500" />,
    });
  };

  const cancelRejectMember = () => setPendingRejectMemberId(null);

  const handleApprove = () => {
    onApprove(profile, rejectedIds);
    toast.success(
      hasAnyRejected ? "Duyệt các thành viên còn lại" : "Duyệt toàn bộ hồ sơ",
      {
        description: `Hồ sơ #${profile.code} — ${profile.representative.fullName} đã được duyệt thành công.`,
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      },
    );
  };

  const handleRejectAll = () => {
    setRejectAllOpen(false);
    onRejectAll(profile);
    toast.error("Đã từ chối toàn bộ hồ sơ", {
      description: `Hồ sơ #${profile.code} bị từ chối. Phiếu cọc đã bị hủy.`,
      icon: <ShieldAlert className="size-4 text-red-500" />,
    });
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <section className="relative flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      {/* ── STICKY HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-600">
                #{profile.code}
              </span>
              <h1 className="text-sm font-bold text-gray-800">
                {rep.fullName}
              </h1>
              <Badge className="h-5 border-transparent bg-amber-100 px-2 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                Chờ duyệt
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 border-blue-200 bg-blue-50 px-1.5 text-[10px] font-medium text-blue-600"
              >
                <BedDouble className="size-3" />
                {profile.bedsRented} giường
              </Badge>
              <Badge
                variant="outline"
                className="h-5 gap-1 px-1.5 text-[10px] font-medium text-gray-600"
              >
                {isWholeRoom ? (
                  <DoorClosed className="size-3" />
                ) : (
                  <Users className="size-3" />
                )}
                {isWholeRoom ? "Thuê nguyên phòng" : "Thuê ở ghép"}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">
              Nhân viên nhập:{" "}
              <span className="font-medium text-gray-600">
                {profile.submittedBy}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right text-xs text-gray-400">
            <div>
              Phòng:{" "}
              <span className="font-mono font-semibold text-gray-700">
                {profile.room}
              </span>
            </div>
            <div>
              Mã phiếu:{" "}
              <span className="font-mono font-semibold text-gray-700">
                #{profile.code}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── SCROLLABLE BODY ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 pb-24">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* ══ SECTION 1: REPRESENTATIVE INFO ══════════════════════════ */}
          <FormCard>
            <SectionHeader
              icon={<FileText className="size-4 text-blue-500" />}
              title="Thông tin Đại diện"
            />

            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <ReadonlyField label="Họ và tên" value={rep.fullName} />
              <ReadonlyField
                label="Số điện thoại"
                value={rep.phone}
                mono
              />
              <ReadonlyField label="Địa chỉ email" value={rep.email} />
              <ReadonlyField
                label="Giới tính"
                value={rep.gender === "male" ? "Nam" : "Nữ"}
              />
              <ReadonlyField label="Ngày sinh" value={rep.dob} />
              <ReadonlyField label="Quốc tịch" value={rep.nationality} />
              <ReadonlyField
                label="Loại giấy tờ"
                value={rep.docType === "cccd" ? "CCCD" : "Hộ chiếu"}
              />
              <ReadonlyField
                label="Số giấy tờ"
                value={rep.docId}
                mono
              />
            </div>
          </FormCard>

          {/* ══ SECTION 2: MEMBERS TABLE ═════════════════════════════════ */}
          {members.length > 0 && (
            <FormCard>
              <div className="flex items-center justify-between">
                <SectionHeader
                  icon={<Users className="size-4 text-blue-500" />}
                  title="Danh sách thành viên ở cùng"
                  badge={
                    <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                      {members.length}
                    </span>
                  }
                />
                {hasAnyRejected && (
                  <span className="text-xs text-amber-600 font-medium">
                    {rejectedIds.size} thành viên bị loại ·{" "}
                    {activeMembers.length} còn lại
                  </span>
                )}
              </div>

              {/* Member rejection confirmation inline dialog */}
              <AlertDialog
                open={pendingRejectMemberId !== null}
                onOpenChange={(open) => {
                  if (!open) cancelRejectMember();
                }}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="size-5 text-amber-500" />
                      Loại thành viên này?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Thành viên{" "}
                      <strong>
                        {
                          members.find(
                            (m) => m.id === pendingRejectMemberId,
                          )?.fullName
                        }
                      </strong>{" "}
                      sẽ bị đánh dấu là <strong>"Đã loại"</strong> và sẽ không
                      được đưa vào hợp đồng. Bạn có thể duyệt hồ sơ với các
                      thành viên còn lại.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={cancelRejectMember}>
                      Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmRejectMember}
                      className="bg-amber-500 text-white hover:bg-amber-600"
                    >
                      Xác nhận loại
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Table */}
              <div className="overflow-hidden rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-10 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                        STT
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                        Họ và tên
                      </TableHead>
                      <TableHead className="w-[90px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                        Giới tính
                      </TableHead>
                      <TableHead className="w-[120px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                        Ngày sinh
                      </TableHead>
                      <TableHead className="w-[90px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                        Loại GT
                      </TableHead>
                      <TableHead className="w-[155px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                        Số giấy tờ
                      </TableHead>
                      <TableHead className="w-[120px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
                        SĐT
                      </TableHead>
                      <TableHead className="w-[110px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5 text-right pr-4">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m, i) => {
                      const isRejected = rejectedIds.has(m.id);
                      return (
                        <TableRow
                          key={m.id}
                          className={cn(
                            "border-b border-gray-100 last:border-0 transition-colors",
                            isRejected
                              ? "bg-red-50/70 hover:bg-red-50/70"
                              : "hover:bg-blue-50/30",
                          )}
                        >
                          <TableCell className="text-center text-xs text-gray-400 tabular-nums font-medium py-3">
                            {i + 1}
                          </TableCell>
                          <TableCell className="py-3">
                            <span
                              className={cn(
                                "text-sm font-medium text-gray-800",
                                isRejected && "line-through text-gray-400",
                              )}
                            >
                              {m.fullName}
                            </span>
                            {isRejected && (
                              <Badge className="ml-2 h-4 border-transparent bg-red-100 px-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-100">
                                Đã loại
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "py-3 text-sm",
                              isRejected
                                ? "text-gray-400"
                                : "text-gray-700",
                            )}
                          >
                            {m.gender === "male" ? "Nam" : "Nữ"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "py-3 text-sm tabular-nums",
                              isRejected
                                ? "text-gray-400"
                                : "text-gray-700",
                            )}
                          >
                            {m.dob}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "py-3 text-sm",
                              isRejected
                                ? "text-gray-400"
                                : "text-gray-700",
                            )}
                          >
                            {m.docType === "cccd" ? "CCCD" : "HC"}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "py-3 font-mono text-sm",
                              isRejected
                                ? "text-gray-400"
                                : "text-gray-700",
                            )}
                          >
                            {m.docId}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "py-3 font-mono text-sm",
                              isRejected
                                ? "text-gray-400"
                                : "text-gray-700",
                            )}
                          >
                            {m.phone ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 text-right pr-3">
                            {isRejected ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 px-2 text-xs text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                  setRejectedIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(m.id);
                                    return next;
                                  });
                                  toast.info(
                                    `Đã khôi phục thành viên "${m.fullName}"`,
                                  );
                                }}
                              >
                                Khôi phục
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 border-red-200 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                onClick={() =>
                                  setPendingRejectMemberId(m.id)
                                }
                              >
                                <Trash2 className="size-3" />
                                Từ chối
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </FormCard>
          )}

          {/* Members-less notice */}
          {members.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
              <Users className="size-4 text-gray-400" />
              Hồ sơ này chỉ có người đại diện, không có thành viên ở cùng.
            </div>
          )}
        </div>
      </div>

      {/* ── STICKY FOOTER ──────────────────────────────────────────────── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Keyboard hints */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Kbd>⌘</Kbd>
            <span>+</span>
            <Kbd>↵</Kbd>
            <span className="ml-1">duyệt</span>
            <span className="mx-2 text-gray-300">·</span>
            <Kbd>⌘</Kbd>
            <span>+</span>
            <Kbd>⌫</Kbd>
            <span className="ml-1">từ chối</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Reject All — opens AlertDialog */}
            <AlertDialog open={rejectAllOpen} onOpenChange={setRejectAllOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-red-200 px-4 text-sm font-medium text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="size-3.5" />
                  Từ chối hồ sơ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <ShieldAlert className="size-5" />
                    Từ chối toàn bộ hồ sơ?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Bạn có chắc chắn muốn từ chối toàn bộ hồ sơ này và hủy
                    phiếu cọc?
                    <br />
                    <br />
                    <strong className="text-gray-700">
                      Hành động này không thể hoàn tác.
                    </strong>{" "}
                    Hồ sơ{" "}
                    <strong className="font-mono text-red-600">
                      #{profile.code}
                    </strong>{" "}
                    của khách{" "}
                    <strong>{rep.fullName}</strong> sẽ bị hủy hoàn toàn.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRejectAll}
                    className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
                  >
                    Xác nhận từ chối
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Approve button — dynamic label */}
            <Button
              size="sm"
              onClick={handleApprove}
              className="h-8 gap-1.5 bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
            >
              <CheckCircle2 className="size-3.5" />
              {approveButtonLabel}
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────────── */

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
    <div className="flex items-center gap-2.5 border-b border-gray-100 pb-1">
      <div className="flex size-7 items-center justify-center rounded-md bg-blue-50">
        {icon}
      </div>
      <div className="flex items-baseline gap-1.5">
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        {badge}
      </div>
    </div>
  );
}
