import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useWorkflowStore } from "@/app/providers/workflow-store";
import {
  capNhatTaiSan,
  layDanhSachTaiSan,
  themTaiSan,
  xoaTaiSan,
  type LoaiTaiSan,
  type TaiSanResponse,
} from "@/features/administration/services/asset-catalog-service";
import type { TrangThaiDanhMuc } from "@/features/administration/services/service-catalog-service";
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
import { Textarea } from "@/shared/ui/textarea";

const CATEGORY_LABELS: Record<LoaiTaiSan, string> = {
  NoiThat: "Nội thất",
  ThietBiDien: "Thiết bị điện",
  TienIchBanGiao: "Tiện ích bàn giao",
};

const STATUS_LABELS: Record<TrangThaiDanhMuc, string> = {
  DangApDung: "Đang áp dụng",
  NgungApDung: "Ngừng áp dụng",
};

const assetSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên tài sản").max(100),
  category: z.enum(["NoiThat", "ThietBiDien", "TienIchBanGiao"]),
  compensationValue: z
    .string()
    .min(1, "Vui lòng nhập giá trị bồi thường")
    .regex(/^\d+$/, "Giá trị bồi thường chỉ chứa chữ số"),
  description: z.string().max(500, "Mô tả không được vượt quá 500 ký tự").optional(),
  status: z.enum(["DangApDung", "NgungApDung"]),
});

type AssetValues = z.infer<typeof assetSchema>;

const emptyValues: AssetValues = {
  name: "",
  category: "NoiThat",
  compensationValue: "",
  description: "",
  status: "DangApDung",
};

const formatVnd = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;
const formatDigits = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeDigits = (value: string) => value.replace(/\D/g, "");
const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function AdminAssetsPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | LoaiTaiSan>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TrangThaiDanhMuc>("all");
  const [assets, setAssets] = useState<TaiSanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<TaiSanResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<AssetValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setAssets(await layDanhSachTaiSan());
    } catch (error) {
      setLoadError(errorMessage(error, "Không thể tải danh sách tài sản."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || role !== "admin") return;
    void loadAssets();
  }, [isHydrated, role, loadAssets]);

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("vi");
    return assets.filter((asset) => {
      if (categoryFilter !== "all" && asset.loaiTaiSan !== categoryFilter) return false;
      if (statusFilter !== "all" && asset.trangThai !== statusFilter) return false;
      if (!q) return true;
      return [asset.maTS, asset.tenTaiSan, CATEGORY_LABELS[asset.loaiTaiSan], asset.moTa ?? ""]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(q);
    });
  }, [assets, search, categoryFilter, statusFilter]);

  function openCreateDialog() {
    setEditingAsset(null);
    form.reset(emptyValues);
    setDialogOpen(true);
  }

  function openEditDialog(asset: TaiSanResponse) {
    setEditingAsset(asset);
    form.reset({
      name: asset.tenTaiSan,
      category: asset.loaiTaiSan,
      compensationValue: String(asset.giaTri),
      description: asset.moTa ?? "",
      status: asset.trangThai,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: AssetValues) {
    setIsSaving(true);
    try {
      const payload = {
        tenTaiSan: values.name,
        loaiTaiSan: values.category,
        giaTri: Number(values.compensationValue),
        moTa: values.description?.trim() || null,
        trangThai: values.status,
      };
      if (editingAsset) {
        const updated = await capNhatTaiSan(editingAsset.maTS, payload);
        setAssets((current) =>
          current.map((asset) => (asset.maTS === updated.maTS ? updated : asset)),
        );
        toast.success("Cập nhật tài sản thành công.");
      } else {
        const created = await themTaiSan(payload);
        setAssets((current) => [...current, created]);
        toast.success("Thêm tài sản mới thành công.");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể lưu tài sản."));
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await xoaTaiSan(deleteId);
      setAssets((current) => current.filter((asset) => asset.maTS !== deleteId));
      setDeleteId(null);
      toast.success("Đã xóa tài sản khỏi danh mục.");
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa tài sản."));
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
              / <span>Tài sản</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục tài sản</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Quản lý trang thiết bị và định mức giá trị bồi thường áp dụng trong hệ thống.
                </p>
              </div>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={openCreateDialog}
              >
                <Plus className="size-4" /> Thêm tài sản mới
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:w-[460px]">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm mã, tên hoặc mô tả tài sản..."
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Phân loại</p>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as "all" | LoaiTaiSan)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="NoiThat">Nội thất</SelectItem>
                    <SelectItem value="ThietBiDien">Thiết bị điện</SelectItem>
                    <SelectItem value="TienIchBanGiao">Tiện ích bàn giao</SelectItem>
                  </SelectContent>
                </Select>
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
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          {isLoading ? (
            <div className="space-y-3 rounded-lg border bg-white p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="flex items-center gap-2">
                <AlertTriangle className="size-4" />
                {loadError}
              </span>
              <Button variant="outline" size="sm" onClick={() => void loadAssets()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Mã TS</TableHead>
                    <TableHead>Tên tài sản</TableHead>
                    <TableHead>Phân loại</TableHead>
                    <TableHead className="text-right">Giá trị bồi thường</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-gray-500">
                        Không có tài sản phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset, index) => (
                      <TableRow key={asset.maTS}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{asset.maTS}</TableCell>
                        <TableCell className="font-semibold">{asset.tenTaiSan}</TableCell>
                        <TableCell>{CATEGORY_LABELS[asset.loaiTaiSan]}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatVnd(asset.giaTri)}
                        </TableCell>
                        <TableCell className="max-w-[320px] truncate text-gray-600">
                          {asset.moTa || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              asset.trangThai === "DangApDung"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-700"
                            }
                          >
                            {STATUS_LABELS[asset.trangThai]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(asset)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => setDeleteId(asset.maTS)}
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
          <span>{filteredAssets.length} bản ghi</span>
        </footer>
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Chỉnh sửa tài sản" : "Thêm tài sản mới"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin tài sản để lưu vào danh mục hệ thống.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tài sản *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phân loại *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NoiThat">Nội thất</SelectItem>
                        <SelectItem value="ThietBiDien">Thiết bị điện</SelectItem>
                        <SelectItem value="TienIchBanGiao">Tiện ích bàn giao</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="compensationValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị bồi thường *</FormLabel>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={3} />
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
            <AlertDialogTitle>Xác nhận xóa tài sản</AlertDialogTitle>
            <AlertDialogDescription>
              Tài sản đang gắn với phòng, biên bản hoặc hóa đơn sẽ không thể xóa.
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
