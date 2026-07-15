import { Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, MoreHorizontal, Pencil, Plus, Shield, UserMinus, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Switch } from "@/shared/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { useWorkflowStore } from "@/app/providers/workflow-store";

type UserRole = "Sale" | "Kế toán" | "Quản lý" | "Quản trị hệ thống";
type UserStatus = "Đang hoạt động" | "Đã khóa" | "Vô hiệu hoá" | "Ngừng làm việc" | "Lưu trữ";

type Branch = {
  maCN: string;
  tenChiNhanh: string;
};

type Staff = {
  id: string;
  code: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  branchCode: string;
  branchName: string;
  status: UserStatus;
  lastLoginAt: string;
  createdAt: string;
  createdBy: string;
};

type ApiStaff = {
  id: string;
  code: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  branchCode: string;
  branchName: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string | null;
  createdBy: string;
};

type ActionType = "disable" | "archive" | "offboard";

function mapStaff(item: ApiStaff): Staff {
  const roles: Record<string, UserRole> = {
    Sale: "Sale",
    KeToan: "Kế toán",
    QuanLy: "Quản lý",
    QuanTri: "Quản trị hệ thống",
  };
  const statuses: Record<string, UserStatus> = {
    HoatDong: "Đang hoạt động",
    Khoa: "Đã khóa",
    VoHieuHoa: "Vô hiệu hoá",
    NgungLamViec: "Ngừng làm việc",
    LuuTru: "Lưu trữ",
  };
  return {
    ...item,
    role: roles[item.role] ?? "Sale",
    status: statuses[item.status] ?? "Lưu trữ",
    lastLoginAt: item.lastLoginAt ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
  };
}

function roleCode(role: UserRole) {
  return (
    {
      Sale: "Sale",
      "Kế toán": "KeToan",
      "Quản lý": "QuanLy",
      "Quản trị hệ thống": "QuanTri",
    } as Record<UserRole, string>
  )[role];
}

const staffSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z.string().email("Email không hợp lệ"),
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  tempPassword: z.string().optional(),
  role: z.enum(["Sale", "Kế toán", "Quản lý", "Quản trị hệ thống"]),
  branch: z.string().min(1, "Vui lòng chọn chi nhánh"),
});

const resetPasswordSchema = z
  .object({
    tempPassword: z.string().min(8, "Mật khẩu tạm phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu tạm"),
  })
  .refine((values) => values.tempPassword === values.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function AdminUsersPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Tất cả" | UserRole>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | UserStatus>("Tất cả");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ id: string; type: ActionType } | null>(null);
  const [lockTargetId, setLockTargetId] = useState<string | null>(null);
  const [resetPasswordTargetId, setResetPasswordTargetId] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      username: "",
      tempPassword: "",
      role: "Sale",
      branch: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { tempPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải danh sách tài khoản.");
        return response.json() as Promise<ApiStaff[]>;
      }),
      fetch("/api/users/branches").then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải danh sách chi nhánh.");
        return response.json() as Promise<Branch[]>;
      }),
    ])
      .then(([items, branchItems]) => {
        setStaffs(items.map(mapStaff));
        setBranches(branchItems);
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Không thể tải tài khoản."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const activeAdminCount = useMemo(
    () =>
      staffs.filter(
        (s) =>
          s.role === "Quản trị hệ thống" &&
          (s.status === "Đang hoạt động" || s.status === "Đã khóa"),
      ).length,
    [staffs],
  );

  const filteredStaffs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffs.filter((staff) => {
      if (roleFilter !== "Tất cả" && staff.role !== roleFilter) return false;
      if (statusFilter !== "Tất cả" && staff.status !== statusFilter) return false;
      if (branchFilter !== "all" && staff.branchCode !== branchFilter) return false;
      if (!q) return true;
      return [staff.fullName, staff.email, staff.phone, staff.username]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [staffs, search, roleFilter, statusFilter, branchFilter]);

  const openCreateDialog = () => {
    setEditingStaff(null);
    form.reset({
      fullName: "",
      phone: "",
      email: "",
      username: "",
      tempPassword: "",
      role: "Sale",
      branch: branches[0]?.maCN ?? "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (staff: Staff) => {
    setEditingStaff(staff);
    form.reset({
      fullName: staff.fullName,
      phone: staff.phone,
      email: staff.email,
      username: staff.username,
      tempPassword: "",
      role: staff.role,
      branch: staff.branchCode,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof staffSchema>) => {
    if (!editingStaff && !values.tempPassword) {
      form.setError("tempPassword", { message: "Vui lòng nhập mật khẩu tạm" });
      return;
    }

    const body = editingStaff
      ? {
          hoTen: values.fullName,
          sdt: values.phone,
          email: values.email,
          tenDangNhap: values.username,
          vaiTro: roleCode(values.role),
          maCN: values.branch,
        }
      : {
          hoTen: values.fullName,
          sdt: values.phone,
          email: values.email,
          tenDangNhap: values.username,
          vaiTro: roleCode(values.role),
          maCN: values.branch,
          matKhauTam: values.tempPassword,
        };
    const response = await fetch(editingStaff ? `/api/users/${editingStaff.id}` : "/api/users", {
      method: editingStaff ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      toast.error((await response.json()).message ?? "Không thể lưu tài khoản.");
      return;
    }
    const saved = mapStaff(await response.json());
    setStaffs((prev) =>
      editingStaff
        ? prev.map((staff) => (staff.id === saved.id ? saved : staff))
        : [...prev, saved],
    );
    toast.success(
      editingStaff ? "Cập nhật nhân viên thành công." : "Thêm nhân viên mới thành công.",
    );
    setDialogOpen(false);
  };

  const getActionBlockReason = (staff: Staff) => {
    if (staff.username === "admin")
      return "Bạn không thể tự thao tác trên tài khoản của chính mình.";
    if (staff.role === "Quản trị hệ thống" && activeAdminCount <= 1) {
      return "Không thể thao tác vì đây là quản trị viên hoạt động cuối cùng.";
    }
    return null;
  };

  const handleLockToggle = (staff: Staff) => {
    const reason = getActionBlockReason(staff);
    if (reason) {
      toast.error(reason);
      return;
    }
    setLockTargetId(staff.id);
  };

  const confirmLockToggle = async () => {
    if (!lockTargetId) return;
    const staff = staffs.find((item) => item.id === lockTargetId);
    if (!staff) return;
    const response = await fetch(`/api/users/${lockTargetId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: staff.status === "Đã khóa" ? "HoatDong" : "Khoa" }),
    });
    if (!response.ok) {
      toast.error((await response.json()).message ?? "Không thể cập nhật trạng thái.");
      return;
    }
    setStaffs((prev) =>
      prev.map((item) =>
        item.id === lockTargetId
          ? { ...item, status: staff.status === "Đã khóa" ? "Đang hoạt động" : "Đã khóa" }
          : item,
      ),
    );
    setLockTargetId(null);
    toast.success("Cập nhật trạng thái khóa tài khoản thành công.");
  };

  const confirmStatusChange = async () => {
    if (!statusTarget) return;
    const mappedStatus: Record<ActionType, UserStatus> = {
      disable: "Vô hiệu hoá",
      offboard: "Ngừng làm việc",
      archive: "Lưu trữ",
    };

    const response = await fetch(`/api/users/${statusTarget.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trangThai: { disable: "VoHieuHoa", offboard: "NgungLamViec", archive: "LuuTru" }[
          statusTarget.type
        ],
      }),
    });
    if (!response.ok) {
      toast.error((await response.json()).message ?? "Không thể cập nhật trạng thái.");
      return;
    }
    setStaffs((prev) =>
      prev.map((staff) =>
        staff.id === statusTarget.id
          ? { ...staff, status: mappedStatus[statusTarget.type] }
          : staff,
      ),
    );

    setStatusTarget(null);
    toast.success("Đã cập nhật trạng thái tài khoản.");
  };

  const openResetPasswordDialog = (staff: Staff) => {
    resetPasswordForm.reset({ tempPassword: "", confirmPassword: "" });
    setResetPasswordTargetId(staff.id);
  };

  const confirmResetPassword = async (values: ResetPasswordValues) => {
    if (!resetPasswordTargetId) return;

    setIsResettingPassword(true);
    try {
      const response = await fetch(`/api/users/${resetPasswordTargetId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matKhauTam: values.tempPassword }),
      });
      if (!response.ok) {
        toast.error(await getApiError(response, "Không thể đặt lại mật khẩu."));
        return;
      }

      toast.success("Đặt lại mật khẩu tạm thành công.");
      setResetPasswordTargetId(null);
      resetPasswordForm.reset();
    } catch {
      toast.error("Không thể kết nối đến máy chủ để đặt lại mật khẩu.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const lockTarget = staffs.find((staff) => staff.id === lockTargetId) ?? null;
  const statusTargetStaff = staffs.find((staff) => staff.id === statusTarget?.id) ?? null;
  const resetPasswordTarget = staffs.find((staff) => staff.id === resetPasswordTargetId) ?? null;

  if (!isHydrated || role !== "admin") return null;

  return (
    <TooltipProvider>
      <div className="h-full w-full overflow-hidden bg-gray-50">
        <section className="flex h-full flex-col">
          <header className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="space-y-3">
              <div className="text-xs text-gray-500">
                <Link to="/admin" className="hover:text-blue-700">
                  Tổng quan
                </Link>{" "}
                / <span>Người dùng</span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản nhân viên</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Quản lý tài khoản nhân viên, vai trò, chi nhánh và trạng thái truy cập hệ thống.
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={openCreateDialog}
                >
                  <Plus className="size-4" />
                  Thêm nhân viên mới
                </Button>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
                <div className="w-full md:w-[460px]">
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm nhân viên..."
                    className="h-9 text-sm"
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <p className="mb-1 text-xs font-medium text-gray-600">Vai trò</p>
                  <Select
                    value={roleFilter}
                    onValueChange={(value) => setRoleFilter(value as "Tất cả" | UserRole)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tất cả">Tất cả vai trò</SelectItem>
                      <SelectItem value="Sale">Sale</SelectItem>
                      <SelectItem value="Kế toán">Kế toán</SelectItem>
                      <SelectItem value="Quản lý">Quản lý</SelectItem>
                      <SelectItem value="Quản trị hệ thống">Quản trị hệ thống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[220px]">
                  <p className="mb-1 text-xs font-medium text-gray-600">Trạng thái</p>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as "Tất cả" | UserStatus)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tất cả">Tất cả trạng thái</SelectItem>
                      <SelectItem value="Đang hoạt động">Đang hoạt động</SelectItem>
                      <SelectItem value="Đã khóa">Đã khóa</SelectItem>
                      <SelectItem value="Vô hiệu hoá">Vô hiệu hoá</SelectItem>
                      <SelectItem value="Ngừng làm việc">Ngừng làm việc</SelectItem>
                      <SelectItem value="Lưu trữ">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[200px]">
                  <p className="mb-1 text-xs font-medium text-gray-600">Chi nhánh</p>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Chi nhánh" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.maCN} value={branch.maCN}>
                          {branch.tenChiNhanh}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden p-6">
            <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : staffs.length === 0 ? (
                <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
                  Chưa có tài khoản nhân viên nào. Hãy tạo tài khoản đầu tiên.
                </div>
              ) : filteredStaffs.length === 0 ? (
                <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
                  Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Chi nhánh</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Lần đăng nhập cuối</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaffs.map((staff) => {
                      const blockedReason = getActionBlockReason(staff);
                      const canLock = !blockedReason;
                      const lockChecked = staff.status !== "Đã khóa";

                      return (
                        <TableRow key={staff.id} className="h-12">
                          <TableCell className="py-2">
                            <Avatar className="size-8 border border-gray-200">
                              <AvatarFallback className="bg-gray-100 text-[11px] font-semibold text-gray-700">
                                {initials(staff.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="text-sm font-semibold text-gray-900">
                              {staff.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {staff.code} • Tạo bởi {staff.createdBy} •{" "}
                              {formatDate(staff.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-sm">{staff.username}</TableCell>
                          <TableCell className="py-2">
                            <RoleBadge role={staff.role} />
                          </TableCell>
                          <TableCell className="py-2 text-sm">{staff.branchName}</TableCell>
                          <TableCell className="py-2">
                            <StatusBadge status={staff.status} />
                          </TableCell>
                          <TableCell className="py-2 text-sm text-gray-600">
                            {staff.lastLoginAt
                              ? formatDateTime(staff.lastLoginAt)
                              : "Chưa đăng nhập"}
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel>Tùy chọn tài khoản</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                                  <Pencil className="mr-2 size-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openResetPasswordDialog(staff)}>
                                  <KeyRound className="mr-2 size-4" />
                                  Đặt lại mật khẩu
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={!canLock}
                                  onClick={() => handleLockToggle(staff)}
                                >
                                  <Shield className="mr-2 size-4" />
                                  {staff.status === "Đã khóa"
                                    ? "Mở khóa tài khoản"
                                    : "Khóa tài khoản"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={!canLock}
                                  onClick={() => setStatusTarget({ id: staff.id, type: "disable" })}
                                >
                                  <UserX className="mr-2 size-4" />
                                  Vô hiệu hoá
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={!canLock}
                                  onClick={() =>
                                    setStatusTarget({ id: staff.id, type: "offboard" })
                                  }
                                >
                                  <UserMinus className="mr-2 size-4" />
                                  Ngừng làm việc
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={!canLock}
                                  onClick={() => setStatusTarget({ id: staff.id, type: "archive" })}
                                >
                                  <Shield className="mr-2 size-4" />
                                  Lưu trữ tài khoản
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </main>

          <footer className="flex h-12 items-center justify-end border-t border-gray-200 bg-white px-6 text-xs text-gray-500">
            <span>{filteredStaffs.length} bản ghi</span>
          </footer>
        </section>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </DialogTitle>
              <DialogDescription>
                Nhập thông tin tài khoản nhân viên để lưu vào hệ thống.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên *</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!editingStaff && (
                  <FormField
                    control={form.control}
                    name="tempPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu tạm *</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sale">Sale</SelectItem>
                          <SelectItem value="Kế toán">Kế toán</SelectItem>
                          <SelectItem value="Quản lý">Quản lý</SelectItem>
                          <SelectItem value="Quản trị hệ thống">Quản trị hệ thống</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chi nhánh *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.maCN} value={branch.maCN}>
                              {branch.tenChiNhanh}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(resetPasswordTargetId)}
          onOpenChange={(open) => {
            if (!open && !isResettingPassword) {
              setResetPasswordTargetId(null);
              resetPasswordForm.reset();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đặt lại mật khẩu</DialogTitle>
              <DialogDescription>
                Nhập mật khẩu tạm mới cho tài khoản. Nhân viên sẽ dùng mật khẩu này ở lần đăng nhập
                tiếp theo.
              </DialogDescription>
              {resetPasswordTarget && (
                <p className="text-sm font-medium text-gray-700">
                  {resetPasswordTarget.fullName} ({resetPasswordTarget.username})
                </p>
              )}
            </DialogHeader>

            <Form {...resetPasswordForm}>
              <form
                className="space-y-4"
                onSubmit={resetPasswordForm.handleSubmit(confirmResetPassword)}
              >
                <FormField
                  control={resetPasswordForm.control}
                  name="tempPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu tạm mới *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          disabled={isResettingPassword}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu tạm *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          disabled={isResettingPassword}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isResettingPassword}
                    onClick={() => setResetPasswordTargetId(null)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isResettingPassword}>
                    {isResettingPassword ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={Boolean(lockTargetId)}
          onOpenChange={(open) => !open && setLockTargetId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {lockTarget?.status === "Đã khóa"
                  ? "Xác nhận mở khóa tài khoản"
                  : "Xác nhận khóa tài khoản"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {lockTarget?.status === "Đã khóa"
                  ? "Bạn có chắc chắn muốn mở khóa tài khoản này không?"
                  : "Bạn có chắc chắn muốn khóa tài khoản này không?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Quay lại</AlertDialogCancel>
              <AlertDialogAction onClick={confirmLockToggle}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={Boolean(statusTarget)}
          onOpenChange={(open) => !open && setStatusTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận cập nhật trạng thái tài khoản</AlertDialogTitle>
              <AlertDialogDescription>
                {statusTarget?.type === "disable" &&
                  "Bạn có chắc chắn muốn vô hiệu hoá tài khoản này không?"}
                {statusTarget?.type === "offboard" &&
                  "Bạn có chắc chắn muốn chuyển tài khoản sang ngừng làm việc không?"}
                {statusTarget?.type === "archive" &&
                  "Bạn có chắc chắn muốn lưu trữ tài khoản này không?"}
              </AlertDialogDescription>
              {statusTargetStaff && (
                <p className="text-xs text-gray-500">
                  Tài khoản: {statusTargetStaff.fullName} ({statusTargetStaff.username})
                </p>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Quay lại</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStatusChange}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

async function getApiError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "Sale") return <Badge className="bg-blue-100 text-blue-700">Sale</Badge>;
  if (role === "Kế toán") return <Badge className="bg-orange-100 text-orange-700">Kế toán</Badge>;
  if (role === "Quản lý") return <Badge className="bg-amber-100 text-amber-700">Quản lý</Badge>;
  return (
    <Badge className="border border-violet-300 bg-violet-100 font-semibold text-violet-800">
      <Shield className="mr-1 size-3.5" />
      Quản trị hệ thống
    </Badge>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "Đang hoạt động") {
    return <Badge className="bg-emerald-100 text-emerald-700">Đang hoạt động</Badge>;
  }
  if (status === "Đã khóa") {
    return <Badge className="bg-red-100 text-red-700">Đã khóa</Badge>;
  }
  if (status === "Vô hiệu hoá") {
    return <Badge className="bg-gray-200 text-gray-700">Vô hiệu hoá</Badge>;
  }
  if (status === "Ngừng làm việc") {
    return <Badge className="bg-orange-100 text-orange-700">Ngừng làm việc</Badge>;
  }
  return <Badge className="bg-slate-200 text-slate-700">Lưu trữ</Badge>;
}
