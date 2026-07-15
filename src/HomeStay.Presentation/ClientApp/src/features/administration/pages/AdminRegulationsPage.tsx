import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { FileText, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useWorkflowStore } from "@/app/providers/workflow-store";
import {
  type LoaiQuyDinh,
  type QuyDinhResponse,
  type TrangThaiQuyDinh,
  capNhatQuyDinh,
  layDanhSachQuyDinh,
  moVanBanQuyDinh,
  themQuyDinh,
  xoaQuyDinh,
} from "@/features/administration/services/regulations-service";
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

const LOAI_QUY_DINH: ReadonlyArray<{ value: LoaiQuyDinh; label: string }> = [
  { value: "DieuKienLuuTru", label: "Điều kiện lưu trú" },
  { value: "NoiQuySinhHoat", label: "Nội quy sinh hoạt" },
  { value: "HoSoPhapLyCuTru", label: "Hồ sơ pháp lý cư trú" },
  { value: "TaiChinhThanhToan", label: "Tài chính và thanh toán" },
  { value: "TaiSanTienIchAnToan", label: "Tài sản, tiện ích và an toàn" },
  { value: "ViPhamBoiThuong", label: "Vi phạm và bồi thường" },
];

const TEN_LOAI = Object.fromEntries(
  LOAI_QUY_DINH.map((item) => [item.value, item.label]),
) as Record<LoaiQuyDinh, string>;

const regulationSchema = z
  .object({
    tenQD: z.string().trim().min(1, "Vui lòng nhập tên quy định").max(200),
    loaiQD: z.enum([
      "DieuKienLuuTru",
      "NoiQuySinhHoat",
      "HoSoPhapLyCuTru",
      "TaiChinhThanhToan",
      "TaiSanTienIchAnToan",
      "ViPhamBoiThuong",
    ]),
    ngayApDung: z.string().min(1, "Vui lòng chọn ngày áp dụng"),
    ngayKetThuc: z.string().optional(),
    file: z.custom<File | null>().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.ngayKetThuc && values.ngayKetThuc <= values.ngayApDung) {
      ctx.addIssue({
        code: "custom",
        path: ["ngayKetThuc"],
        message: "Ngày kết thúc phải lớn hơn ngày áp dụng.",
      });
    }
    if (
      values.file &&
      (!values.file.name.toLowerCase().endsWith(".pdf") ||
        (values.file.type && values.file.type !== "application/pdf") ||
        values.file.size > 10 * 1024 * 1024)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["file"],
        message: "Văn bản phải là file PDF và không vượt quá 10MB.",
      });
    }
  });

type RegulationFormValues = z.infer<typeof regulationSchema>;

export function AdminRegulationsPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [regulations, setRegulations] = useState<QuyDinhResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"TatCa" | LoaiQuyDinh>("TatCa");
  const [statusFilter, setStatusFilter] = useState<"TatCa" | TrangThaiQuyDinh>("TatCa");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<QuyDinhResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<RegulationFormValues>({
    resolver: zodResolver(regulationSchema),
    defaultValues: {
      tenQD: "",
      loaiQD: "NoiQuySinhHoat",
      ngayApDung: "",
      ngayKetThuc: "",
      file: null,
    },
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  useEffect(() => {
    void layDanhSachQuyDinh()
      .then(setRegulations)
      .catch((error) => toast.error(getErrorMessage(error, "Không thể tải danh sách quy định.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openCreateDialog();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const filteredRegulations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return regulations.filter((item) => {
      if (typeFilter !== "TatCa" && item.loaiQD !== typeFilter) return false;
      if (statusFilter !== "TatCa" && item.trangThai !== statusFilter) return false;
      return (
        !query ||
        [item.maQD, item.tenQD, TEN_LOAI[item.loaiQD]].join(" ").toLowerCase().includes(query)
      );
    });
  }, [regulations, search, typeFilter, statusFilter]);

  const openCreateDialog = () => {
    setEditingRule(null);
    form.reset({
      tenQD: "",
      loaiQD: "NoiQuySinhHoat",
      ngayApDung: "",
      ngayKetThuc: "",
      file: null,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: QuyDinhResponse) => {
    setEditingRule(item);
    form.reset({
      tenQD: item.tenQD,
      loaiQD: item.loaiQD,
      ngayApDung: item.ngayApDung,
      ngayKetThuc: item.ngayKetThuc ?? "",
      file: null,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: RegulationFormValues) => {
    if (!editingRule && !values.file) {
      form.setError("file", { message: "Vui lòng tải lên văn bản PDF." });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        tenQD: values.tenQD,
        loaiQD: values.loaiQD,
        ngayApDung: values.ngayApDung,
        ngayKetThuc: values.ngayKetThuc,
        file: values.file,
      };
      const saved = editingRule
        ? await capNhatQuyDinh(editingRule.maQD, payload)
        : await themQuyDinh(payload);
      setRegulations((current) =>
        editingRule
          ? current.map((item) => (item.maQD === saved.maQD ? saved : item))
          : [saved, ...current],
      );
      toast.success(
        editingRule ? "Cập nhật quy định thành công." : "Thêm quy định mới thành công.",
      );
      setDialogOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể lưu quy định."));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await xoaQuyDinh(deleteId);
      setRegulations((current) => current.filter((item) => item.maQD !== deleteId));
      setDeleteId(null);
      toast.success("Đã xóa quy định khỏi hệ thống.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa quy định."));
    } finally {
      setIsDeleting(false);
    }
  };

  const openDocument = async (item: QuyDinhResponse) => {
    try {
      await moVanBanQuyDinh(item.duongDanFile);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể mở văn bản quy định."));
    }
  };

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
              / <span>Quy định</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý quy định lưu trú</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Quản lý các văn bản quy định áp dụng trong ký túc xá.
                </p>
              </div>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={openCreateDialog}
              >
                <Plus className="size-4" /> Thêm quy định mới
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm mã hoặc tên quy định..."
                className="h-9 w-full text-sm md:w-[460px]"
              />
              <FilterSelect
                label="Loại quy định"
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as "TatCa" | LoaiQuyDinh)}
              >
                <SelectItem value="TatCa">Tất cả loại</SelectItem>
                {LOAI_QUY_DINH.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </FilterSelect>
              <FilterSelect
                label="Trạng thái"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as "TatCa" | TrangThaiQuyDinh)}
              >
                <SelectItem value="TatCa">Tất cả trạng thái</SelectItem>
                <SelectItem value="ChuaApDung">Chưa áp dụng</SelectItem>
                <SelectItem value="DangApDung">Đang áp dụng</SelectItem>
                <SelectItem value="HetHieuLuc">Hết hiệu lực</SelectItem>
              </FilterSelect>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredRegulations.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-sm text-gray-500">
                Không có quy định phù hợp.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Mã QĐ</TableHead>
                    <TableHead>Tên quy định</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Văn bản</TableHead>
                    <TableHead>Ngày áp dụng</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegulations.map((item, index) => (
                    <TableRow key={item.maQD}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.maQD}</TableCell>
                      <TableCell>{item.tenQD}</TableCell>
                      <TableCell>{TEN_LOAI[item.loaiQD]}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => void openDocument(item)}
                        >
                          <FileText className="size-3.5" /> PDF
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(item.ngayApDung)}</TableCell>
                      <TableCell>{formatDate(item.ngayKetThuc)}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.trangThai} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(item)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteId(item.maQD)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>

        <footer className="flex h-12 items-center justify-end border-t border-gray-200 bg-white px-6 text-xs text-gray-500">
          <span>{filteredRegulations.length} bản ghi</span>
        </footer>
      </section>

      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Chỉnh sửa quy định" : "Thêm quy định mới"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin và văn bản PDF chính thức của quy định.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="tenQD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên quy định *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loaiQD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại quy định *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOAI_QUY_DINH.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Văn bản PDF {editingRule ? "" : "*"}</FormLabel>
                    <FormControl>
                      <label className="block cursor-pointer rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-sm text-gray-600 hover:border-blue-300">
                        <UploadCloud className="mx-auto mb-2 size-5" />
                        <span className="font-medium">Bấm để chọn PDF dưới 10MB</span>
                        {editingRule && !field.value && (
                          <p className="mt-1 text-xs">Để trống nếu giữ văn bản hiện tại.</p>
                        )}
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          disabled={isSaving}
                          onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
                        />
                        {field.value && (
                          <p className="mt-2 text-xs text-blue-700">{field.value.name}</p>
                        )}
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="ngayApDung"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày áp dụng *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ngayKetThuc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                  {isSaving ? "Đang lưu..." : "Lưu"}
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
            <AlertDialogTitle>Xác nhận xóa quy định</AlertDialogTitle>
            <AlertDialogDescription>
              Quy định đã được hợp đồng tham chiếu sẽ không thể xóa. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={() => void confirmDelete()}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full md:w-[240px]">
      <p className="mb-1 text-xs font-medium text-gray-600">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

function StatusBadge({ status }: { status: TrangThaiQuyDinh }) {
  if (status === "ChuaApDung")
    return <Badge className="bg-blue-100 text-blue-700">Chưa áp dụng</Badge>;
  if (status === "DangApDung")
    return <Badge className="bg-emerald-100 text-emerald-700">Đang áp dụng</Badge>;
  return <Badge className="bg-red-100 text-red-700">Hết hiệu lực</Badge>;
}

function formatDate(value: string | null) {
  if (!value) return "Không giới hạn";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(`${value}T00:00:00`));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
