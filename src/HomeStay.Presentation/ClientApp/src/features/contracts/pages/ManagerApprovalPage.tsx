import { useMemo, useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Eye, Search, Users } from "lucide-react";
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
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";

import {
  loadPendingApprovals,
  loadApprovalDetail,
  approveAll,
  rejectMember,
  approveRemaining,
  rejectProfile,
  undoRejectMember,
  type PhieuCocChoDuyet,
  type ChiTietXetDuyet,
  type ThanhVienDuyet,
} from "@/features/handovers/services/xet-duyet-ho-so-service";

type MemberWithDetail = ThanhVienDuyet & { status: "pending" | "approved" | "rejected" };

export function ManagerApprovalPage() {

  const [items, setItems] = useState<PhieuCocChoDuyet[]>([]);
  const [detail, setDetail] = useState<ChiTietXetDuyet | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load list with debounce
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingList(true);
      try {
        setItems(await loadPendingApprovals(query, controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error ? error.message : "Không thể tải danh sách hồ sơ.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingList(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, refreshKey]);

  // Load detail when selected
  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    const controller = new AbortController();
    setLoadingDetail(true);
    loadApprovalDetail(selectedId, controller.signal)
      .then(setDetail)
      .catch((error) => {
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết hồ sơ.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingDetail(false); });
    return () => controller.abort();
  }, [selectedId]);

  const isSelected = selectedId !== null;

  const members: MemberWithDetail[] = useMemo(() => {
    return (detail?.thanhViens ?? []).map((tv) => ({
      ...tv,
      status: tv.trangThaiDuyet === "HopLe" ? "approved" as const
        : tv.trangThaiDuyet === "TuChoi" ? "rejected" as const
        : "pending" as const,
    }));
  }, [detail]);

  const pendingMembers = members.filter((m) => m.status === "pending");
  const approvedMembers = members.filter((m) => m.status === "approved");
  const rejectedMembers = members.filter((m) => m.status === "rejected");
  const hasPendingValidMembers = pendingMembers.length > 0;
  const hasRejectedMembers = rejectedMembers.length > 0;
  const hasMembers = members.length > 0;
  const allMembersRejected = hasMembers && rejectedMembers.length === members.length;
  const allMembersApproved = hasMembers && !hasPendingValidMembers
    && approvedMembers.length + rejectedMembers.length === members.length;
  const canCompleteApproval = hasMembers && !hasRejectedMembers && hasPendingValidMembers;

  const completeAction = () => {
    setSelectedId(null);
    setDetail(null);
    setRefreshKey((value) => value + 1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.maPhieuCoc.toLowerCase().includes(q) ||
        item.hoTenKhachHang.toLowerCase().includes(q) ||
        item.soPhong.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
      <div className="flex h-full overflow-hidden">
        <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-800">Hồ sơ chờ duyệt</h2>
            <p className="mt-0.5 text-xs text-gray-400">{filtered.length} hồ sơ chờ duyệt</p>
          </div>
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm hồ sơ..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-gray-400">Đang tải...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-gray-400">Không có hồ sơ chờ duyệt.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <li key={item.maPhieuCoc}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.maPhieuCoc)}
                      className={cn(
                        "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                        selectedId === item.maPhieuCoc && "border-l-amber-500 bg-amber-50",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{item.maPhieuCoc}</span>
                        <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">
                          Chờ duyệt
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{item.hoTenKhachHang}</p>
                      <p className="font-mono text-xs text-gray-500">{item.soPhong}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {!isSelected ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn hồ sơ để xét duyệt thành viên.</p>
          </section>
        ) : loadingDetail || !detail ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
          </section>
        ) : (
          <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-sm font-bold text-gray-900">{detail.maPhieuCoc}</h1>
                <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">Chờ duyệt</Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {detail.hoTenKhachHang} • {detail.soPhong}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="rounded-lg border border-gray-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-2 py-2 text-xs">STT</TableHead>
                      <TableHead className="px-2 py-2 text-xs">HỌ VÀ TÊN</TableHead>
                      <TableHead className="px-2 py-2 text-xs">ĐẶC ĐIỂM</TableHead>
                      <TableHead className="px-2 py-2 text-xs">QUỐC TỊCH</TableHead>
                      <TableHead className="px-2 py-2 text-xs">GIẤY TỜ</TableHead>
                      <TableHead className="px-2 py-2 text-xs">SĐT</TableHead>
                      <TableHead className="px-2 py-2 text-right text-xs">HÀNH ĐỘNG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member, index) => {
                      const rejected = member.status === "rejected";
                      const approved = member.status === "approved";
                      const genderLabel = member.gioiTinh === "Nam" ? "Nam" : member.gioiTinh === "Nu" ? "Nữ" : member.gioiTinh ?? "";
                      const birthYear = member.ngaySinh ? new Date(member.ngaySinh).getFullYear() : "";
                      const docLabel = member.loaiGiayTo ?? "";
                      const docNumber = member.soGiayTo ?? "";
                      return (
                        <TableRow
                          key={member.maKH}
                          className={cn(
                            rejected ? "bg-red-50/50 hover:bg-red-50/50" : "",
                            approved ? "bg-emerald-50/50 hover:bg-emerald-50/50" : "",
                          )}
                        >
                          <TableCell className="p-2 text-xs text-gray-500">{index + 1}</TableCell>
                          <TableCell
                            className={cn(
                              "p-2 text-sm font-medium",
                              rejected ? "text-gray-500 line-through" : "text-gray-800",
                              approved ? "text-emerald-700" : "",
                            )}
                          >
                            {member.hoTen}
                          </TableCell>
                          <TableCell className="p-2 text-sm text-gray-600">
                            {genderLabel}{birthYear ? ` • ${birthYear}` : ""}
                          </TableCell>
                          <TableCell className="p-2 text-sm text-slate-600">
                            {member.quocTich}
                          </TableCell>
                          <TableCell className="p-2 font-mono text-sm text-gray-700">
                            {docLabel}{docNumber ? `: ${docNumber}` : ""}
                          </TableCell>
                          <TableCell className="p-2 font-mono text-sm text-gray-700">
                            {member.sdt}
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {approved ? (
                                <Badge className="h-6 bg-emerald-100 text-[10px] text-emerald-700">
                                  Đã duyệt
                                </Badge>
                              ) : null}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 border border-gray-200"
                                  >
                                    <Eye className="size-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Chi tiết thành viên</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <ReadOnlyLine label="Họ và tên" value={member.hoTen} />
                                    <ReadOnlyLine label="Số điện thoại" value={member.sdt ?? ""} />
                                    <ReadOnlyLine label="Giới tính" value={genderLabel} />
                                    <ReadOnlyLine label="Ngày sinh" value={member.ngaySinh ?? ""} />
                                    <ReadOnlyLine label="Loại giấy tờ" value={member.loaiGiayTo ?? ""} />
                                    <ReadOnlyLine label="Số giấy tờ" value={member.soGiayTo ?? ""} />
                                    <ReadOnlyLine label="Quốc tịch" value={member.quocTich ?? ""} />
                                    <div />
                                    {member.quocTich === "Việt Nam" && member.diaChiThuongTru ? (
                                      <div className="col-span-2">
                                        <ReadOnlyLine label="Địa chỉ thường trú" value={member.diaChiThuongTru} />
                                      </div>
                                    ) : null}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={approved}
                                className={cn(
                                  "h-7 text-xs",
                                  rejected
                                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    : "border-red-300 text-red-700 hover:bg-red-50",
                                )}
                                onClick={async () => {
                                  try {
                                    if (rejected) {
                                      await undoRejectMember(detail.maPhieuCoc, member.maKH);
                                      const updated = await loadApprovalDetail(detail.maPhieuCoc);
                                      setDetail(updated);
                                      toast.success(`Đã hoàn tác thành viên ${member.hoTen}.`);
                                    } else {
                                      await rejectMember(detail.maPhieuCoc, member.maKH);
                                      const updated = await loadApprovalDetail(detail.maPhieuCoc);
                                      setDetail(updated);
                                      toast.success(`Đã từ chối thành viên ${member.hoTen}.`);
                                    }
                                  } catch (error) {
                                    toast.error(error instanceof Error ? error.message : "Không thể thực hiện thao tác.");
                                  }
                                }}
                              >
                                {rejected ? "Hoàn tác" : "Từ chối"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <footer className="sticky bottom-0 flex min-h-14 items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-2">
              <div className="flex items-center gap-3">
                {allMembersRejected ? (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    <AlertCircle className="size-3.5" />
                    <span>Hồ sơ không còn thành viên hợp lệ để duyệt</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="size-3.5" />
                    <span>Duyệt theo thành viên</span>
                  </div>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" className="h-8 border-red-300 text-xs text-red-700 hover:bg-red-50">
                      Từ chối hồ sơ
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Từ chối hồ sơ này?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hồ sơ {detail.maPhieuCoc} sẽ bị hủy. Giường liên quan sẽ được giải phóng.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                          try {
                            await rejectProfile(detail.maPhieuCoc);
                            toast.success("Đã hủy hồ sơ.");
                            completeAction();
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Không thể từ chối hồ sơ.");
                          }
                        }}
                      >
                        Xác nhận từ chối
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {allMembersApproved || canCompleteApproval ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" className="bg-emerald-600 hover:bg-emerald-700">
                      Hoàn tất xét duyệt hồ sơ
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hoàn tất xét duyệt hồ sơ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hồ sơ {detail.maPhieuCoc} sẽ được duyệt và chuyển sang bước tiếp theo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={async () => {
                          try {
                            if (!hasRejectedMembers) {
                              await approveAll(detail.maPhieuCoc);
                            } else {
                              await approveRemaining(detail.maPhieuCoc);
                            }
                            toast.success("Hoàn tất xét duyệt hồ sơ.", {
                              icon: <CheckCircle2 className="size-4 text-emerald-100" />,
                            });
                            completeAction();
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Không thể duyệt hồ sơ.");
                          }
                        }}
                      >
                        Xác nhận
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : hasPendingValidMembers ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" className="bg-emerald-600 hover:bg-emerald-700">
                      Duyệt các thành viên còn lại
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Duyệt các thành viên còn lại?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {pendingMembers.length} thành viên hợp lệ còn lại trong hồ sơ {detail.maPhieuCoc}{" "}
                        sẽ được chuyển sang trạng thái đã duyệt.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={async () => {
                          try {
                            await approveRemaining(detail.maPhieuCoc);
                            toast.success("Đã duyệt các thành viên còn lại.", {
                              icon: <CheckCircle2 className="size-4 text-emerald-100" />,
                            });
                            completeAction();
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Không thể duyệt thành viên.");
                          }
                        }}
                      >
                        Xác nhận
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </footer>
          </section>
        )}
      </div>
  );
}

function ReadOnlyLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700">
        {value}
      </p>
    </div>
  );
}
