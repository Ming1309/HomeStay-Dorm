import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useWorkflowStore } from "@/app/providers/workflow-store";
import {
  layDanhSachChinhSach,
  taoPhienBanChinhSach,
  type ChinhSachHoanCocResponse,
} from "@/features/administration/services/deposit-policy-service";
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
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const percentField = z
  .number({ invalid_type_error: "Vui lòng nhập số" })
  .min(0, "Tỷ lệ hoàn cọc phải nằm trong khoảng 0 – 100%.")
  .max(100, "Tỷ lệ hoàn cọc phải nằm trong khoảng 0 – 100%.");

const policySchema = z
  .object({
    policyName: z.string().trim().min(1, "Vui lòng nhập tên chính sách.").max(200),
    effectiveFrom: z.string().min(1, "Vui lòng chọn ngày áp dụng."),
    effectiveTo: z.string().optional(),
    leaseThresholdMonths: z
      .number({ invalid_type_error: "Vui lòng nhập số" })
      .int("Mốc lưu trú phải là số tháng nguyên.")
      .min(1, "Mốc lưu trú tối thiểu là 1 tháng."),
    refundUnsigned: percentField,
    refundShortTerm: percentField,
    refundLongTerm: percentField,
    refundOnTime: percentField,
  })
  .superRefine((values, context) => {
    if (values.effectiveTo && values.effectiveTo <= values.effectiveFrom) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["effectiveTo"],
        message: "Ngày kết thúc phải sau ngày áp dụng.",
      });
    }
  });

type PolicyValues = z.infer<typeof policySchema>;

const emptyValues: PolicyValues = {
  policyName: "",
  effectiveFrom: toLocalDateInput(new Date()),
  effectiveTo: "",
  leaseThresholdMonths: 6,
  refundUnsigned: 80,
  refundShortTerm: 50,
  refundLongTerm: 70,
  refundOnTime: 100,
};

function toLocalDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateInput(date);
}

function formatDateVN(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function toPercent(value: number) {
  return Number((value * 100).toFixed(2));
}

function toDecimal(value: number) {
  return Number((value / 100).toFixed(4));
}

function createNextDraft(latest?: ChinhSachHoanCocResponse): PolicyValues {
  if (!latest) return emptyValues;
  const today = toLocalDateInput(new Date());
  const dayAfterLatest = addDays(latest.ngayApDung, 1);
  return {
    policyName: latest.tenChinhSach,
    effectiveFrom: dayAfterLatest > today ? dayAfterLatest : today,
    effectiveTo: "",
    leaseThresholdMonths: latest.mocLuuTru,
    refundUnsigned: toPercent(latest.tiLe_ChuaKy),
    refundShortTerm: toPercent(latest.tiLe_TruocHan_NganHan),
    refundLongTerm: toPercent(latest.tiLe_TruocHan_DaiHan),
    refundOnTime: toPercent(latest.tiLe_DungHan),
  };
}

export function AdminDepositPolicyPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [versions, setVersions] = useState<ChinhSachHoanCocResponse[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingValues = useRef<PolicyValues | null>(null);
  const initialDraft = useRef<PolicyValues>(emptyValues);

  const form = useForm<PolicyValues>({
    resolver: zodResolver(policySchema),
    defaultValues: emptyValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const loadPolicies = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await layDanhSachChinhSach();
      setVersions(data);
      const draft = createNextDraft(data[0]);
      initialDraft.current = draft;
      form.reset(draft);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Không thể tải lịch sử chính sách hoàn cọc.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (!isHydrated || role !== "admin") return;
    void loadPolicies();
  }, [isHydrated, role, loadPolicies]);

  const threshold = useWatch({ control: form.control, name: "leaseThresholdMonths" }) ?? 6;
  const refundUnsigned = useWatch({ control: form.control, name: "refundUnsigned" }) ?? 0;
  const refundShortTerm = useWatch({ control: form.control, name: "refundShortTerm" }) ?? 0;
  const refundLongTerm = useWatch({ control: form.control, name: "refundLongTerm" }) ?? 0;
  const refundOnTime = useWatch({ control: form.control, name: "refundOnTime" }) ?? 0;
  const shortTermHigherThanLongTerm = refundShortTerm > refundLongTerm;

  function onSubmit(values: PolicyValues) {
    pendingValues.current = values;
    setConfirmOpen(true);
  }

  async function handleConfirmCreate() {
    const values = pendingValues.current;
    if (!values) return;

    setIsSaving(true);
    try {
      await taoPhienBanChinhSach({
        tenChinhSach: values.policyName,
        tiLe_ChuaKy: toDecimal(values.refundUnsigned),
        tiLe_TruocHan_NganHan: toDecimal(values.refundShortTerm),
        tiLe_TruocHan_DaiHan: toDecimal(values.refundLongTerm),
        tiLe_DungHan: toDecimal(values.refundOnTime),
        mocLuuTru: values.leaseThresholdMonths,
        ngayApDung: values.effectiveFrom,
        ngayKetThuc: values.effectiveTo || null,
      });
      pendingValues.current = null;
      setConfirmOpen(false);
      toast.success("Đã tạo phiên bản chính sách hoàn cọc mới.");
      await loadPolicies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo phiên bản chính sách.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!isSaving) void form.handleSubmit(onSubmit)();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form, isSaving]);

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
                Quản lý phiên bản, thời gian hiệu lực, mốc lưu trú và tỷ lệ hoàn trả.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
            {isLoading ? (
              <PolicySkeleton />
            ) : loadError ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-2 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{loadError}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void loadPolicies()}
                >
                  Thử lại
                </Button>
              </div>
            ) : (
              <>
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tạo phiên bản chính sách mới</CardTitle>
                    <p className="text-sm text-gray-500">
                      Mỗi lần lưu tạo một bản ghi mới. Hợp đồng đã ký vẫn dùng chính sách được gắn
                      tại thời điểm ký.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm font-semibold text-gray-700">
                            Thông tin chính sách
                          </p>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="policyName"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Tên chính sách *</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
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
                                    <Input type="date" {...field} />
                                  </FormControl>
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
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <p className="text-xs text-gray-500">
                                    Để trống nếu chưa xác định ngày kết thúc.
                                  </p>
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
                                    <NumberField
                                      value={field.value}
                                      onChange={field.onChange}
                                      min={1}
                                      step={1}
                                      suffix="tháng"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <PercentField
                              control={form.control}
                              name="refundUnsigned"
                              label="Chưa ký hợp đồng *"
                            />
                            <PercentField
                              control={form.control}
                              name="refundShortTerm"
                              label="Đã ký, lưu trú dưới mốc *"
                            />
                            <PercentField
                              control={form.control}
                              name="refundLongTerm"
                              label="Đã ký, lưu trú từ mốc trở lên *"
                            />
                            <PercentField
                              control={form.control}
                              name="refundOnTime"
                              label="Hết hạn hợp đồng / Đúng hạn *"
                            />
                          </div>
                        </div>

                        {shortTermHigherThanLongTerm && (
                          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <span>Tỷ lệ ngắn hạn đang cao hơn dài hạn. Vui lòng kiểm tra lại.</span>
                          </div>
                        )}

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Xem trước hành trình hoàn cọc
                          </p>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                            <TimelineNode label="Chưa ký HĐ" value={refundUnsigned} />
                            <TimelineNode
                              label={`Ở < ${threshold} tháng`}
                              value={refundShortTerm}
                            />
                            <TimelineNode label={`Ở ≥ ${threshold} tháng`} value={refundLongTerm} />
                            <TimelineNode label="Hết hạn HĐ" value={refundOnTime} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                          <span className="text-xs text-gray-500">
                            <kbd className="rounded border bg-gray-50 px-1.5 py-0.5 text-[10px]">
                              Ctrl
                            </kbd>{" "}
                            +{" "}
                            <kbd className="rounded border bg-gray-50 px-1.5 py-0.5 text-[10px]">
                              S
                            </kbd>{" "}
                            : Tạo phiên bản
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={!form.formState.isDirty || isSaving}
                              onClick={() => form.reset(initialDraft.current)}
                            >
                              Hoàn tác
                            </Button>
                            <Button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={isSaving}
                            >
                              {isSaving ? "Đang tạo…" : "Tạo chính sách mới"}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <PolicyHistory versions={versions} />
              </>
            )}
          </div>
        </main>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận tạo phiên bản chính sách mới</AlertDialogTitle>
            <AlertDialogDescription>
              Phiên bản hiện hành sẽ được kết thúc vào ngày liền trước ngày áp dụng mới. Bản ghi cũ
              và các hợp đồng đã gắn với bản ghi đó vẫn được giữ nguyên để tra cứu lịch sử.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingValues.current && (
            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              <p className="font-semibold">{pendingValues.current.policyName}</p>
              <p className="mt-1">
                Áp dụng từ {formatDateVN(pendingValues.current.effectiveFrom)}
                {pendingValues.current.effectiveTo
                  ? ` đến ${formatDateVN(pendingValues.current.effectiveTo)}`
                  : ", chưa xác định ngày kết thúc"}
                .
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmCreate();
              }}
            >
              {isSaving ? "Đang tạo…" : "Xác nhận tạo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PolicyHistory({ versions }: { versions: ChinhSachHoanCocResponse[] }) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lịch sử áp dụng</CardTitle>
        <p className="text-sm text-gray-500">
          Các phiên bản chỉ đọc, sắp xếp theo ngày áp dụng mới nhất.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead className="min-w-[220px]">Tên chính sách</TableHead>
                <TableHead>Chưa ký</TableHead>
                <TableHead>Dưới mốc</TableHead>
                <TableHead>Từ mốc</TableHead>
                <TableHead>Đúng hạn</TableHead>
                <TableHead>Mốc</TableHead>
                <TableHead>Áp dụng</TableHead>
                <TableHead>Kết thúc</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-sm text-gray-500">
                    Chưa có phiên bản chính sách nào.
                  </TableCell>
                </TableRow>
              ) : (
                versions.map((version) => {
                  const status = getStatusView(version.trangThai);
                  return (
                    <TableRow key={version.maChinhSach}>
                      <TableCell className="font-mono text-xs">{version.maChinhSach}</TableCell>
                      <TableCell className="whitespace-normal">{version.tenChinhSach}</TableCell>
                      <TableCell>{toPercent(version.tiLe_ChuaKy)}%</TableCell>
                      <TableCell>{toPercent(version.tiLe_TruocHan_NganHan)}%</TableCell>
                      <TableCell>{toPercent(version.tiLe_TruocHan_DaiHan)}%</TableCell>
                      <TableCell>{toPercent(version.tiLe_DungHan)}%</TableCell>
                      <TableCell>{version.mocLuuTru} tháng</TableCell>
                      <TableCell>{formatDateVN(version.ngayApDung)}</TableCell>
                      <TableCell>
                        {version.ngayKetThuc ? formatDateVN(version.ngayKetThuc) : "Không giới hạn"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded px-2 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusView(status: ChinhSachHoanCocResponse["trangThai"]) {
  if (status === "DangApDung")
    return { label: "Đang áp dụng", className: "bg-blue-100 text-blue-700" };
  if (status === "ChuaApDung")
    return { label: "Chưa áp dụng", className: "bg-slate-100 text-slate-700" };
  return { label: "Hết hiệu lực", className: "bg-gray-100 text-gray-700" };
}

function NumberField({
  value,
  onChange,
  min,
  step,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  step: number;
  suffix: string;
}) {
  return (
    <div className="relative">
      <Input
        type="number"
        min={min}
        step={step}
        className="pr-14"
        value={Number.isNaN(value) ? "" : value}
        onChange={(event) =>
          onChange(event.target.value === "" ? Number.NaN : Number(event.target.value))
        }
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
        {suffix}
      </span>
    </div>
  );
}

function PercentField({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<PolicyValues>>["control"];
  name: "refundUnsigned" | "refundShortTerm" | "refundLongTerm" | "refundOnTime";
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <NumberField
              value={field.value}
              onChange={field.onChange}
              min={0}
              step={1}
              suffix="%"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TimelineNode({ label, value }: { label: string; value: number }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-blue-700">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

function PolicySkeleton() {
  return (
    <Card className="border-gray-200">
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-5 w-60" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  );
}
