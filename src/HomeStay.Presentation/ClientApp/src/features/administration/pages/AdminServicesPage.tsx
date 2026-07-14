import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useWorkflowStore } from "@/app/providers/workflow-store";
import {
  capNhatDichVu,
  layDanhSachDichVu,
  themDichVu,
  xoaDichVu,
  type DichVuResponse,
  type TrangThaiDanhMuc,
} from "@/features/administration/services/service-catalog-service";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const STATUS_LABELS: Record<TrangThaiDanhMuc, string> = {
  DangApDung: "Đang áp dụng",
  NgungApDung: "Ngừng áp dụng",
};

const serviceSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên dịch vụ").max(100),
  unit: z.string().trim().min(1, "Vui lòng nhập đơn vị tính").max(50),
  price: z.string().min(1, "Vui lòng nhập đơn giá").regex(/^\d+$/, "Đơn giá chỉ chứa chữ số"),
  status: z.enum(["DangApDung", "NgungApDung"]),
});

type ServiceValues = z.infer<typeof serviceSchema>;

const emptyValues: ServiceValues = {
  name: "",
  unit: "",
  price: "",
  status: "DangApDung",
};

const formatVnd = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
const formatDigits = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeDigits = (value: string) => value.replace(/\D/g, "");
const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function AdminServicePage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TrangThaiDanhMuc>("all");
  const [services, setServices] = useState<DichVuResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<DichVuResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setServices(await layDanhSachDichVu());
    } catch (error) {
      setLoadError(errorMessage(error, "Không thể tải danh sách dịch vụ."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || role !== "admin") return;
    void loadServices();
  }, [isHydrated, role, loadServices]);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("vi");
    return services.filter((service) => {
      if (statusFilter !== "all" && service.trangThai !== statusFilter) return false;
      if (!q) return true;
      return [service.maDV, service.tenDV, service.donViTinh]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(q);
    });
  }, [services, search, statusFilter]);

  function openCreateDialog() {
    setEditingService(null);
    form.reset(emptyValues);
    setDialogOpen(true);
  }

  function openEditDialog(service: DichVuResponse) {
    setEditingService(service);
    form.reset({
      name: service.tenDV,
      unit: service.donViTinh,
      price: String(service.donGia),
      status: service.trangThai,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: ServiceValues) {
    setIsSaving(true);
    try {
      const payload = {
        tenDV: values.name,
        donViTinh: values.unit,
        donGia: Number(values.price),
        trangThai: values.status,
      };
      if (editingService) {
        const updated = await capNhatDichVu(editingService.maDV, payload);
        setServices((current) =>
          current.map((service) => (service.maDV === updated.maDV ? updated : service)),
        );
        toast.success("Cập nhật dịch vụ thành công.");
      } else {
        const created = await themDichVu(payload);
        setServices((current) => [...current, created]);
        toast.success("Thêm dịch vụ mới thành công.");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể lưu dịch vụ."));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await xoaDichVu(deleteId);
      setServices((current) => current.filter((service) => service.maDV !== deleteId));
      setDeleteId(null);
      toast.success("Đã xóa dịch vụ.");
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa dịch vụ."));
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isHydrated || role !== "admin") return null;

  return (
    <div className="h-full w-full overflow-hidden bg-gray-50">
      <section className="flex h-full flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              <Link to="/admin" className="hover:text-blue-700">
                Tổng quan
              </Link>{" "}
              / <span>Dịch vụ</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Quản lý danh mục dịch vụ, đơn vị tính và đơn giá áp dụng trong hệ thống.
                </p>
              </div>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="size-4" /> Thêm dịch vụ mới
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="w-full md:w-[460px]">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên dịch vụ, đơn vị tính..."
                className="h-9 text-sm"
              />
            </div>
            <div className="w-full md:w-[220px]">
              <p className="mb-1 text-xs font-medium text-gray-600">Trạng thái</p>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as "all" | TrangThaiDanhMuc)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="DangApDung">Đang áp dụng</SelectItem>
                  <SelectItem value="NgungApDung">Ngừng áp dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          {isLoading ? (
            <div className="space-y-3 rounded-lg border bg-white p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="flex items-center gap-2">
                <AlertTriangle className="size-4" />
                {loadError}
              </span>
              <Button variant="outline" size="sm" onClick={() => void loadServices()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Mã dịch vụ</TableHead>
                    <TableHead>Tên dịch vụ</TableHead>
                    <TableHead>Đơn vị tính</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-gray-500">
                        Không có dịch vụ phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service, index) => (
                      <TableRow key={service.maDV}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{service.maDV}</TableCell>
                        <TableCell>{service.tenDV}</TableCell>
                        <TableCell>{service.donViTinh}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatVnd(service.donGia)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              service.trangThai === "DangApDung"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-700"
                            }
                          >
                            {STATUS_LABELS[service.trangThai]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(service)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => setDeleteId(service.maDV)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </main>
        <footer className="flex h-12 items-center justify-end border-t border-gray-200 bg-white px-6 text-xs text-gray-500">
          <span>{filteredServices.length} bản ghi</span>
        </footer>
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin dịch vụ để lưu vào hệ thống.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên dịch vụ *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị tính *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn giá *</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        value={formatDigits(field.value)}
                        onChange={(event) => field.onChange(normalizeDigits(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DangApDung">Đang áp dụng</SelectItem>
                        <SelectItem value="NgungApDung">Ngừng áp dụng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => setDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Đang lưu…" : "Lưu"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Dịch vụ đã phát sinh hợp đồng hoặc hóa đơn sẽ không thể xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {isDeleting ? "Đang xóa…" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
