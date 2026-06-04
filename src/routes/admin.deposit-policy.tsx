import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/admin/deposit-policy")({
  component: AdminDepositPolicyPage,
});

const percentField = z
  .number({ invalid_type_error: "Vui lòng nhập số" })
  .min(0, "Tỷ lệ hoàn cọc phải nằm trong khoảng 0 – 100%.")
  .max(100, "Tỷ lệ hoàn cọc phải nằm trong khoảng 0 – 100%.");

const policySchema = z.object({
  policyName: z
    .string({ required_error: "Vui lòng nhập tên chính sách." })
    .trim()
    .min(1, "Vui lòng nhập tên chính sách."),
  effectiveFrom: z.string().min(1, "Vui lòng chọn ngày áp dụng."),
  effectiveTo: z.string().optional(),
  leaseThresholdMonths: z
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(1, "Mốc lưu trú tối thiểu là 1 tháng."),
  refundUnsigned: percentField,
  refundShortTerm: percentField,
  refundLongTerm: percentField,
  refundOnTime: percentField,
})
.superRefine((values, ctx) => {
  if (!values.effectiveTo) return;

  const fromDate = parseDate(values.effectiveFrom);
  const toDate = parseDate(values.effectiveTo);
  if (toDate <= fromDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["effectiveTo"],
      message: "Ngày kết thúc phải sau ngày áp dụng.",
    });
  }
});

type PolicyValues = z.infer<typeof policySchema>;

type PolicyVersion = {
  maChinhSach: string;
  tenChinhSach: string;
  tiLeChuaKy: number;
  tiLeTruocHanNganHan: number;
  tiLeTruocHanDaiHan: number;
  tiLeDungHan: number;
  mocLuuTru: number;
  ngayApDung: string;
  ngayKetThuc: string | null;
};

const policyVersionData: PolicyVersion[] = [
  {
    maChinhSach: "CSHC_003",
    tenChinhSach: "Chính sách hoàn cọc chuẩn 2026",
    tiLeChuaKy: 80,
    tiLeTruocHanNganHan: 50,
    tiLeTruocHanDaiHan: 70,
    tiLeDungHan: 100,
    mocLuuTru: 6,
    ngayApDung: "2026-05-15",
    ngayKetThuc: null,
  },
  {
    maChinhSach: "CSHC_002",
    tenChinhSach: "Chính sách hoàn cọc điều chỉnh Q1/2026",
    tiLeChuaKy: 75,
    tiLeTruocHanNganHan: 45,
    tiLeTruocHanDaiHan: 65,
    tiLeDungHan: 100,
    mocLuuTru: 9,
    ngayApDung: "2026-01-10",
    ngayKetThuc: "2026-05-14",
  },
  {
    maChinhSach: "CSHC_004",
    tenChinhSach: "Chính sách hoàn cọc dự kiến 2027",
    tiLeChuaKy: 78,
    tiLeTruocHanNganHan: 48,
    tiLeTruocHanDaiHan: 68,
    tiLeDungHan: 100,
    mocLuuTru: 6,
    ngayApDung: "2027-01-01",
    ngayKetThuc: null,
  },
];

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDateVN(value: string) {
  const date = parseDate(value);
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatPercent(value: number) {
  return `${value}%`;
}

function getPolicyStatus(ngayApDung: string, ngayKetThuc: string | null) {
  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = parseDate(ngayApDung);
  const endDate = ngayKetThuc ? parseDate(ngayKetThuc) : null;

  if (startDate > currentDate) {
    return { label: "Chưa áp dụng", className: "bg-slate-100 text-slate-700" };
  }

  if (endDate && endDate < currentDate) {
    return { label: "Hết hiệu lực", className: "bg-gray-100 text-gray-700" };
  }

  return { label: "Đang áp dụng", className: "bg-emerald-100 text-emerald-700" };
}

function AdminDepositPolicyPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();

  const form = useForm<PolicyValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      policyName: "Chính sách hoàn cọc chuẩn 2026",
      effectiveFrom: "2026-05-15",
      effectiveTo: "",
      leaseThresholdMonths: 6,
      refundUnsigned: 80,
      refundShortTerm: 50,
      refundLongTerm: 70,
      refundOnTime: 100,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const threshold = useWatch({ control: form.control, name: "leaseThresholdMonths" }) ?? 6;
  const refundUnsigned = useWatch({ control: form.control, name: "refundUnsigned" }) ?? 0;
  const refundShortTerm = useWatch({ control: form.control, name: "refundShortTerm" }) ?? 0;
  const refundLongTerm = useWatch({ control: form.control, name: "refundLongTerm" }) ?? 0;
  const refundOnTime = useWatch({ control: form.control, name: "refundOnTime" }) ?? 0;
  const effectiveFrom = useWatch({ control: form.control, name: "effectiveFrom" }) ?? "";
  const effectiveTo = useWatch({ control: form.control, name: "effectiveTo" }) ?? "";
  const policyVersions = [...policyVersionData].sort(
    (a, b) => parseDate(b.ngayApDung).getTime() - parseDate(a.ngayApDung).getTime(),
  );

  const shortTermHigherThanLongTerm = refundShortTerm > refundLongTerm;

  const onSubmit = (values: PolicyValues) => {
    toast.success("Đã tạo phiên bản chính sách hoàn cọc mới.");
    form.reset(values);
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
              / <span>Hoàn cọc</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cấu hình chính sách hoàn cọc</h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý phiên bản chính sách hoàn cọc, mốc lưu trú và tỷ lệ hoàn trả áp dụng trong
                hệ thống.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cấu hình chính sách hoàn cọc</CardTitle>
                <p className="text-sm text-gray-500">
                  Mỗi lần cập nhật sẽ tạo một phiên bản chính sách mới. Hợp đồng đã ký vẫn áp dụng
                  chính sách tại thời điểm ký.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-700">Thông tin chính sách</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="policyName"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Tên chính sách *</FormLabel>
                              <FormControl>
                                <Input value={field.value ?? ""} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="effectiveFrom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ngày áp dụng *</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              {effectiveFrom ? (
                                <p className="text-xs text-gray-500">{formatDateVN(effectiveFrom)}</p>
                              ) : null}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="effectiveTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ngày kết thúc</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <p className="text-xs text-gray-500">
                                Có thể để trống nếu chính sách chưa xác định ngày kết thúc.
                              </p>
                              {effectiveTo ? (
                                <p className="text-xs text-gray-500">{formatDateVN(effectiveTo)}</p>
                              ) : null}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-700">Tỷ lệ hoàn cọc</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="leaseThresholdMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mốc lưu trú *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={1}
                                  className="pr-14"
                                  value={field.value ?? ""}
                                  onChange={(event) =>
                                    field.onChange(
                                      event.target.value === "" ? 1 : Number(event.target.value),
                                    )
                                  }
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                                  tháng
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="refundUnsigned"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chưa ký hợp đồng *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="pr-10"
                                  value={field.value ?? ""}
                                  onChange={(event) =>
                                    field.onChange(
                                      event.target.value === "" ? 0 : Number(event.target.value),
                                    )
                                  }
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="refundShortTerm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Đã ký hợp đồng, lưu trú dưới mốc *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="pr-10"
                                  value={field.value ?? ""}
                                  onChange={(event) =>
                                    field.onChange(
                                      event.target.value === "" ? 0 : Number(event.target.value),
                                    )
                                  }
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="refundLongTerm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Đã ký hợp đồng, lưu trú từ mốc trở lên *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="pr-10"
                                  value={field.value ?? ""}
                                  onChange={(event) =>
                                    field.onChange(
                                      event.target.value === "" ? 0 : Number(event.target.value),
                                    )
                                  }
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="refundOnTime"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2 md:max-w-[50%]">
                            <FormLabel>Hết hạn hợp đồng / Đúng hạn *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  className="pr-10"
                                  value={field.value ?? ""}
                                  onChange={(event) =>
                                    field.onChange(
                                      event.target.value === "" ? 0 : Number(event.target.value),
                                    )
                                  }
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                    </div>

                    {shortTermHigherThanLongTerm && (
                      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        <AlertTriangle className="mt-0.5 size-4" />
                        <span>
                          Cảnh báo logic: tỷ lệ hoàn cọc ngắn hạn đang cao hơn dài hạn. Vui lòng
                          kiểm tra lại chính sách.
                        </span>
                      </div>
                    )}

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Preview hành trình hoàn cọc
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <TimelineNode label="Hủy cọc sớm" value={refundUnsigned} />
                        <TimelineNode label={`Ở < ${threshold} tháng`} value={refundShortTerm} />
                        <TimelineNode label={`Ở ≥ ${threshold} tháng`} value={refundLongTerm} />
                        <TimelineNode label="Hết hạn Hợp đồng" value={refundOnTime} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                      <span className="text-xs text-gray-500">
                        <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
                          Ctrl
                        </kbd>{" "}
                        +{" "}
                        <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
                          S
                        </kbd>{" "}
                        : Tạo chính sách mới
                      </span>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Tạo chính sách mới
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lịch sử phiên bản chính sách hoàn cọc</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên chính sách</TableHead>
                        <TableHead className="whitespace-nowrap">Chưa ký HĐ</TableHead>
                        <TableHead className="whitespace-nowrap">Trước hạn ngắn hạn</TableHead>
                        <TableHead className="whitespace-nowrap">Trước hạn dài hạn</TableHead>
                        <TableHead className="whitespace-nowrap">Đúng hạn</TableHead>
                        <TableHead className="whitespace-nowrap">Mốc lưu trú</TableHead>
                        <TableHead className="whitespace-nowrap">Ngày áp dụng</TableHead>
                        <TableHead className="whitespace-nowrap">Ngày kết thúc</TableHead>
                        <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {policyVersions.map((version) => {
                        const status = getPolicyStatus(version.ngayApDung, version.ngayKetThuc);

                        return (
                          <TableRow key={version.maChinhSach}>
                            <TableCell className="max-w-[240px] whitespace-normal break-words text-sm text-gray-700">
                              {version.tenChinhSach}
                            </TableCell>
                            <TableCell>{formatPercent(version.tiLeChuaKy)}</TableCell>
                            <TableCell>{formatPercent(version.tiLeTruocHanNganHan)}</TableCell>
                            <TableCell>{formatPercent(version.tiLeTruocHanDaiHan)}</TableCell>
                            <TableCell>{formatPercent(version.tiLeDungHan)}</TableCell>
                            <TableCell>{`${version.mocLuuTru} tháng`}</TableCell>
                            <TableCell>{formatDateVN(version.ngayApDung)}</TableCell>
                            <TableCell>
                              {version.ngayKetThuc
                                ? formatDateVN(version.ngayKetThuc)
                                : "Không giới hạn"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </section>
    </div>
  );
}

function TimelineNode({ label, value }: { label: string; value: number }) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return (
    <div className="relative rounded-md border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-blue-700">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-200"
          style={{ width: `${Math.max(0, Math.min(100, safeValue))}%` }}
        />
      </div>
    </div>
  );
}
