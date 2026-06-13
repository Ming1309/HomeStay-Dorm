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
import { useWorkflowStore } from "@/app/providers/workflow-store";



type ServiceStatus = "Đang áp dụng" | "Ngừng áp dụng";

type Service = {
  id: string;
  code: string;
  name: string;
  unit: string;
  price: number;
  status: ServiceStatus;
  usedInActiveContract: boolean;
};

const serviceSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên dịch vụ"),
  unit: z.string().min(1, "Vui lòng nhập đơn vị tính"),
  price: z.string().min(1, "Vui lòng nhập đơn giá").regex(/^\d+$/, "Đơn giá chỉ chứa chữ số"),
  status: z.enum(["Đang áp dụng", "Ngừng áp dụng"]),
});

const initialServices: Service[] = [
  {
    id: "dv-001",
    code: "DV001",
    name: "Điện",
    unit: "kWh",
    price: 3500,
    status: "Đang áp dụng",
    usedInActiveContract: true,
  },
  {
    id: "dv-002",
    code: "DV002",
    name: "Nước",
    unit: "m³",
    price: 22000,
    status: "Đang áp dụng",
    usedInActiveContract: true,
  },
  {
    id: "dv-003",
    code: "DV003",
    name: "Phí gửi xe",
    unit: "xe/tháng",
    price: 150000,
    status: "Đang áp dụng",
    usedInActiveContract: true,
  },
  {
    id: "dv-004",
    code: "DV004",
    name: "Phí dọn phòng",
    unit: "người/tháng",
    price: 300000,
    status: "Đang áp dụng",
    usedInActiveContract: true,
  },
  {
    id: "dv-005",
    code: "DV005",
    name: "Internet premium",
    unit: "phòng/tháng",
    price: 120000,
    status: "Ngừng áp dụng",
    usedInActiveContract: false,
  },
];

const formatVnd = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VND`;
const formatDigits = (value: string) =>
  value ? new Intl.NumberFormat("vi-VN").format(Number(value)) : "";
const normalizeDigits = (value: string) => value.replace(/\D/g, "");

export function AdminServicePage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | ServiceStatus>("Tất cả");
  const [services, setServices] = useState<Service[]>(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", unit: "", price: "", status: "Đang áp dụng" },
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((service) => {
      if (statusFilter !== "Tất cả" && service.status !== statusFilter) return false;
      if (!q) return true;
      return [service.name, service.unit, service.code].join(" ").toLowerCase().includes(q);
    });
  }, [services, search, statusFilter]);

  const onSubmit = (values: z.infer<typeof serviceSchema>) => {
    const parsedPrice = Number(values.price);
    if (editingService) {
      setServices((prev) =>
        prev.map((service) =>
          service.id === editingService.id
            ? {
                ...service,
                name: values.name,
                unit: values.unit,
                price: parsedPrice,
                status: values.status,
              }
            : service,
        ),
      );
      toast.success("Cập nhật dịch vụ thành công.");
    } else {
      const nextIndex = services.length + 1;
      setServices((prev) => [
        ...prev,
        {
          id: `dv-${Date.now()}`,
          code: `DV${String(nextIndex).padStart(3, "0")}`,
          name: values.name,
          unit: values.unit,
          price: parsedPrice,
          status: values.status,
          usedInActiveContract: false,
        },
      ]);
      toast.success("Thêm dịch vụ mới thành công.");
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const target = services.find((service) => service.id === deleteId);
    if (!target) return;
    if (target.usedInActiveContract) {
      toast.error("Không thể xóa dịch vụ đang được áp dụng trong hợp đồng hiện hành.");
      setDeleteId(null);
      return;
    }
    setServices((prev) => prev.filter((service) => service.id !== deleteId));
    setDeleteId(null);
    toast.success("Đã xóa dịch vụ.");
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
                onClick={() => {
                  setEditingService(null);
                  form.reset({ name: "", unit: "", price: "", status: "Đang áp dụng" });
                  setDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="size-4" />
                Thêm dịch vụ mới
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
                onValueChange={(value) => setStatusFilter(value as "Tất cả" | ServiceStatus)}
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
        </header>

        <main className="flex-1 overflow-hidden p-6">
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
                {filteredServices.map((service, index) => (
                  <TableRow key={service.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{service.code}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.unit}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatVnd(service.price)}
                    </TableCell>
                    <TableCell>
                      {service.status === "Đang áp dụng" ? (
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
                          onClick={() => {
                            setEditingService(service);
                            form.reset({
                              name: service.name,
                              unit: service.unit,
                              price: String(service.price),
                              status: service.status,
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(service.id)}
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
            : Thêm dịch vụ
          </span>
          <span>{filteredServices.length} bản ghi</span>
        </footer>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                      <Input {...field} placeholder="Ví dụ: Điện, Nước, Phí gửi xe" />
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
                      <Input {...field} placeholder="Ví dụ: kwh, m3, xe/tháng" />
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
                        placeholder="Ví dụ: 150.000"
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
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác.
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
