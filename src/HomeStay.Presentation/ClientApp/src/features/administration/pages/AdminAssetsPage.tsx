import { Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
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
import { Textarea } from "@/shared/ui/textarea";
import { useWorkflowStore } from "@/app/providers/workflow-store";



type AssetCategory = "Nội thất" | "Thiết bị điện" | "Tiện ích bàn giao";
type AssetStatus = "Đang áp dụng" | "Ngừng áp dụng";

type Asset = {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  compensationValue: number;
  description: string;
  status: AssetStatus;
  inActiveHandover: boolean;
};

const assetSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên tài sản"),
  category: z.enum(["Nội thất", "Thiết bị điện", "Tiện ích bàn giao"]),
  compensationValue: z
    .string()
    .min(1, "Vui lòng nhập giá trị bồi thường")
    .regex(/^\d+$/, "Giá trị bồi thường chỉ chứa chữ số"),
  description: z.string().optional(),
  status: z.enum(["Đang áp dụng", "Ngừng áp dụng"]),
});

const initialAssets: Asset[] = [
  {
    id: "ts-001",
    code: "TS001",
    name: "Giường ngủ",
    category: "Nội thất",
    compensationValue: 2500000,
    description: "Giường gỗ 1m6, tiêu chuẩn bàn giao phòng đơn.",
    status: "Đang áp dụng",
    inActiveHandover: true,
  },
  {
    id: "ts-002",
    code: "TS002",
    name: "Điều hòa",
    category: "Thiết bị điện",
    compensationValue: 6500000,
    description: "Điều hòa 1HP, inverter, kèm remote.",
    status: "Đang áp dụng",
    inActiveHandover: false,
  },
  {
    id: "ts-003",
    code: "TS003",
    name: "Chìa khóa phòng",
    category: "Tiện ích bàn giao",
    compensationValue: 200000,
    description: "Chìa khóa cơ + móc đánh số phòng.",
    status: "Đang áp dụng",
    inActiveHandover: true,
  },
  {
    id: "ts-004",
    code: "TS004",
    name: "Tủ quần áo",
    category: "Nội thất",
    compensationValue: 1800000,
    description: "Tủ 2 cánh MDF chống ẩm.",
    status: "Ngừng áp dụng",
    inActiveHandover: false,
  },
];

const formatVnd = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VND`;
const formatDigits = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeDigits = (value: string) => value.replace(/\D/g, "");

export function AdminAssetsPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"Tất cả" | AssetCategory>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | AssetStatus>("Tất cả");
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      category: "Nội thất",
      compensationValue: "",
      description: "",
      status: "Đang áp dụng",
    },
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((asset) => {
      if (categoryFilter !== "Tất cả" && asset.category !== categoryFilter) return false;
      if (statusFilter !== "Tất cả" && asset.status !== statusFilter) return false;
      if (!q) return true;
      return [asset.name, asset.category, asset.description].join(" ").toLowerCase().includes(q);
    });
  }, [assets, search, categoryFilter, statusFilter]);

  const openCreateDialog = () => {
    setEditingAsset(null);
    form.reset({
      name: "",
      category: "Nội thất",
      compensationValue: "",
      description: "",
      status: "Đang áp dụng",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setEditingAsset(asset);
    form.reset({
      name: asset.name,
      category: asset.category,
      compensationValue: String(asset.compensationValue),
      description: asset.description,
      status: asset.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof assetSchema>) => {
    const duplicateName = assets.some((asset) => {
      if (editingAsset && asset.id === editingAsset.id) return false;
      return asset.name.toLowerCase() === values.name.toLowerCase();
    });

    if (duplicateName) {
      toast.error("Loại tài sản này đã tồn tại trong danh mục.");
      return;
    }

    const parsedValue = Number(values.compensationValue);

    if (editingAsset) {
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === editingAsset.id
            ? {
                ...asset,
                name: values.name,
                category: values.category,
                compensationValue: parsedValue,
                description: values.description ?? "",
                status: values.status,
              }
            : asset,
        ),
      );
      toast.success("Cập nhật tài sản thành công.");
    } else {
      const nextIndex = assets.length + 1;
      setAssets((prev) => [
        ...prev,
        {
          id: `ts-${Date.now()}`,
          code: `TS${String(nextIndex).padStart(3, "0")}`,
          name: values.name,
          category: values.category,
          compensationValue: parsedValue,
          description: values.description ?? "",
          status: values.status,
          inActiveHandover: false,
        },
      ]);
      toast.success("Thêm tài sản mới thành công.");
    }

    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const target = assets.find((asset) => asset.id === deleteId);
    if (!target) return;

    if (target.inActiveHandover) {
      toast.error("Không thể xóa tài sản đang được sử dụng trong biên bản bàn giao.");
      setDeleteId(null);
      return;
    }

    setAssets((prev) => prev.filter((asset) => asset.id !== deleteId));
    setDeleteId(null);
    toast.success("Đã xóa tài sản khỏi danh mục.");
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
              / <span>Tài sản</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục tài sản</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Quản lý trang thiết bị, vật tư và định mức giá trị bồi thường áp dụng trong hệ
                  thống.
                </p>
              </div>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={openCreateDialog}
              >
                <Plus className="size-4" />
                Thêm tài sản mới
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:w-[460px]">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm kiếm tài sản (giường, tủ, điều hòa, khóa...)"
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Phân loại</p>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as "Tất cả" | AssetCategory)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Phân loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tất cả">Tất cả</SelectItem>
                    <SelectItem value="Nội thất">Nội thất</SelectItem>
                    <SelectItem value="Thiết bị điện">Thiết bị điện</SelectItem>
                    <SelectItem value="Tiện ích bàn giao">Tiện ích bàn giao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Trạng thái</p>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "Tất cả" | AssetStatus)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tất cả">Tất cả</SelectItem>
                    <SelectItem value="Đang áp dụng">Đang áp dụng</SelectItem>
                    <SelectItem value="Ngừng áp dụng">Ngừng áp dụng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
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
                {filteredAssets.map((asset, index) => (
                  <TableRow key={asset.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{asset.code}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{asset.name}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatVnd(asset.compensationValue)}
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-gray-600">
                      {asset.description}
                    </TableCell>
                    <TableCell>
                      {asset.status === "Đang áp dụng" ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Đang áp dụng</Badge>
                      ) : (
                        <Badge className="bg-gray-200 text-gray-700">Ngừng áp dụng</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
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
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(asset.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>

        <footer className="flex h-12 items-center justify-between border-t border-gray-200 bg-white px-6 text-xs text-gray-500">
          <span>
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
              N
            </kbd>{" "}
            : Thêm tài sản
          </span>
          <span>{filteredAssets.length} bản ghi</span>
        </footer>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                      <Input {...field} placeholder="Ví dụ: Điều hòa, Chìa khóa phòng" />
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
                        <SelectItem value="Nội thất">Nội thất</SelectItem>
                        <SelectItem value="Thiết bị điện">Thiết bị điện</SelectItem>
                        <SelectItem value="Tiện ích bàn giao">Tiện ích bàn giao</SelectItem>
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
                        placeholder="Ví dụ: 200.000 VND"
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
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        rows={3}
                        placeholder="Mô tả nhãn hiệu, hiện trạng tiêu chuẩn"
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
                        <SelectItem value="Đang áp dụng">Đang áp dụng</SelectItem>
                        <SelectItem value="Ngừng áp dụng">Ngừng áp dụng</SelectItem>
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

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài sản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài sản này khỏi danh mục không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
