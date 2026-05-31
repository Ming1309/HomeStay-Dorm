import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Pencil, Trash2, UploadCloud } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore } from "@/lib/workflow-store";

type RegulationType =
  | "Điều kiện lưu trú"
  | "Nội quy"
  | "Tài chính"
  | "Giấy tờ"
  | "Giới tính-Khu vực";
type RegulationStatus = "Chưa áp dụng" | "Đang áp dụng" | "Hết hiệu lực";

type Regulation = {
  id: string;
  code: string;
  name: string;
  type: RegulationType;
  filePath: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  activeInContracts: boolean;
};

const regulationSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên quy định"),
    type: z.enum(["Điều kiện lưu trú", "Nội quy", "Tài chính", "Giấy tờ", "Giới tính-Khu vực"]),
    filePath: z.string().min(1, "Vui lòng tải lên văn bản PDF"),
    startDate: z.string().min(1, "Vui lòng chọn ngày áp dụng"),
    endDate: z.string().optional(),
    summary: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.endDate) return;
    if (new Date(values.endDate) <= new Date(values.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Ngày kết thúc phải lớn hơn ngày áp dụng.",
      });
    }
  });

const initialRegulations: Regulation[] = [
  {
    id: "qd-001",
    code: "QD001",
    name: "Quy định về giờ giấc sinh hoạt",
    type: "Nội quy",
    filePath: "quy-dinh-gio-giac.pdf",
    startDate: "2026-05-01",
    endDate: "2026-12-31",
    summary: "Áp dụng giờ đóng cổng, giờ tự quản và kiểm tra phòng định kỳ.",
    activeInContracts: true,
  },
  {
    id: "qd-002",
    code: "QD002",
    name: "Điều kiện lưu trú cho người nước ngoài",
    type: "Điều kiện lưu trú",
    filePath: "dieu-kien-nguoi-nuoc-ngoai.pdf",
    startDate: "2026-07-01",
    endDate: null,
    summary: "Yêu cầu giấy tờ tạm trú và xác thực hộ chiếu hợp lệ.",
    activeInContracts: false,
  },
  {
    id: "qd-003",
    code: "QD003",
    name: "Quy định phí phát sinh và bồi thường",
    type: "Tài chính",
    filePath: "quy-dinh-tai-chinh-2025.pdf",
    startDate: "2025-01-01",
    endDate: "2026-03-31",
    summary: "Mức phí điện nước, bồi thường tài sản và phụ thu vi phạm.",
    activeInContracts: false,
  },
];

const formatDate = (value: string | null) => {
  if (!value) return "Không giới hạn";
  const date = new Date(value);
  return new Intl.DateTimeFormat("vi-VN").format(date);
};

function getStatus(regulation: Regulation): RegulationStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(regulation.startDate);
  const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endOnly = regulation.endDate
    ? (() => {
        const end = new Date(regulation.endDate);
        return new Date(end.getFullYear(), end.getMonth(), end.getDate());
      })()
    : null;

  if (today < startOnly) return "Chưa áp dụng";
  if (!endOnly || today <= endOnly) return "Đang áp dụng";
  return "Hết hiệu lực";
}

export const Route = createFileRoute("/admin/regulations")({ component: AdminRegulationsPage });

function AdminRegulationsPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Tất cả" | RegulationType>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | RegulationStatus>("Tất cả");
  const [regulations, setRegulations] = useState<Regulation[]>(initialRegulations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Regulation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof regulationSchema>>({
    resolver: zodResolver(regulationSchema),
    defaultValues: {
      name: "",
      type: "Nội quy",
      filePath: "",
      startDate: "",
      endDate: "",
      summary: "",
    },
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const filteredRegulations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return regulations.filter((item) => {
      const status = getStatus(item);
      if (typeFilter !== "Tất cả" && item.type !== typeFilter) return false;
      if (statusFilter !== "Tất cả" && status !== statusFilter) return false;
      if (!q) return true;
      return [item.name, item.type, item.summary].join(" ").toLowerCase().includes(q);
    });
  }, [regulations, search, typeFilter, statusFilter]);

  const openCreateDialog = () => {
    setEditingRule(null);
    form.reset({
      name: "",
      type: "Nội quy",
      filePath: "",
      startDate: "",
      endDate: "",
      summary: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Regulation) => {
    setEditingRule(item);
    form.reset({
      name: item.name,
      type: item.type,
      filePath: item.filePath,
      startDate: item.startDate,
      endDate: item.endDate ?? "",
      summary: item.summary,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof regulationSchema>) => {
    if (editingRule) {
      setRegulations((prev) =>
        prev.map((item) =>
          item.id === editingRule.id
            ? {
                ...item,
                name: values.name,
                type: values.type,
                filePath: values.filePath,
                startDate: values.startDate,
                endDate: values.endDate || null,
                summary: values.summary ?? "",
              }
            : item,
        ),
      );
      toast.success("Cập nhật quy định thành công.");
    } else {
      const nextIndex = regulations.length + 1;
      setRegulations((prev) => [
        ...prev,
        {
          id: `qd-${Date.now()}`,
          code: `QD${String(nextIndex).padStart(3, "0")}`,
          name: values.name,
          type: values.type,
          filePath: values.filePath,
          startDate: values.startDate,
          endDate: values.endDate || null,
          summary: values.summary ?? "",
          activeInContracts: false,
        },
      ]);
      toast.success("Thêm quy định mới thành công.");
    }

    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const target = regulations.find((item) => item.id === deleteId);
    if (!target) return;

    if (target.activeInContracts) {
      toast.error("Không thể xóa quy định đang được áp dụng trong hệ thống.");
      setDeleteId(null);
      return;
    }

    setRegulations((prev) => prev.filter((item) => item.id !== deleteId));
    setDeleteId(null);
    toast.success("Đã xóa quy định khỏi danh mục.");
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
                  Quản lý nội quy, điều khoản và văn bản quy định áp dụng trong ký túc xá.
                </p>
              </div>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={openCreateDialog}
              >
                + Thêm quy định mới
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:w-[460px]">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm kiếm quy định, điều khoản..."
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Loại quy định</p>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as "Tất cả" | RegulationType)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Loại quy định" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tất cả">Tất cả</SelectItem>
                    <SelectItem value="Điều kiện lưu trú">Điều kiện lưu trú</SelectItem>
                    <SelectItem value="Nội quy">Nội quy</SelectItem>
                    <SelectItem value="Tài chính">Tài chính</SelectItem>
                    <SelectItem value="Giấy tờ">Giấy tờ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Trạng thái</p>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "Tất cả" | RegulationStatus)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tất cả">Tất cả</SelectItem>
                    <SelectItem value="Đang áp dụng">Đang áp dụng</SelectItem>
                    <SelectItem value="Hết hiệu lực">Hết hiệu lực</SelectItem>
                    <SelectItem value="Chưa áp dụng">Chưa áp dụng</SelectItem>
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
                  <TableHead>Mã QD</TableHead>
                  <TableHead>Tên quy định</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Văn bản đính kèm</TableHead>
                  <TableHead>Ngày áp dụng</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegulations.map((item, index) => {
                  const status = getStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            toast.success(`Đang mở văn bản: ${item.filePath}`, {
                              description: "Mô phỏng tải/xem file PDF quy định.",
                            })
                          }
                        >
                          <FileText className="size-3.5" />
                          PDF
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(item.startDate)}</TableCell>
                      <TableCell>{formatDate(item.endDate)}</TableCell>
                      <TableCell>
                        {status === "Chưa áp dụng" && (
                          <Badge className="bg-blue-100 text-blue-700">Chưa áp dụng</Badge>
                        )}
                        {status === "Đang áp dụng" && (
                          <Badge className="bg-emerald-100 text-emerald-700">Đang áp dụng</Badge>
                        )}
                        {status === "Hết hiệu lực" && (
                          <Badge className="bg-red-100 text-red-700">Hết hiệu lực</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
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
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            : Thêm quy định
          </span>
          <span>{filteredRegulations.length} bản ghi</span>
        </footer>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? "Chỉnh sửa quy định" : "Thêm quy định mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin quy định để lưu vào hệ thống.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên quy định *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ví dụ: Quy định về giờ giấc" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại quy định *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Điều kiện lưu trú">Điều kiện lưu trú</SelectItem>
                        <SelectItem value="Nội quy">Nội quy</SelectItem>
                        <SelectItem value="Giới tính-Khu vực">Giới tính-Khu vực</SelectItem>
                        <SelectItem value="Giấy tờ">Giấy tờ</SelectItem>
                        <SelectItem value="Tài chính">Tài chính</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Văn bản đính kèm (PDF) *</FormLabel>
                    <FormControl>
                      <label className="block cursor-pointer rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-sm text-gray-600 hover:border-blue-300 hover:bg-blue-50/40">
                        <UploadCloud className="mx-auto mb-2 size-5 text-gray-500" />
                        <span className="font-medium">
                          Kéo thả PDF vào đây hoặc bấm để chọn file
                        </span>
                        <p className="mt-1 text-xs text-gray-500">
                          Mô phỏng upload văn bản quy định chính thức.
                        </p>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            field.onChange(file.name);
                          }}
                        />
                        {field.value && <p className="mt-2 text-xs text-blue-700">{field.value}</p>}
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày áp dụng *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung chi tiết</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={3} />
                    </FormControl>
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
            <AlertDialogTitle>Xác nhận xóa quy định</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa quy định này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
