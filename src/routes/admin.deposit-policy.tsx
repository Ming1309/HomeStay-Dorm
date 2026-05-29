import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ChevronLeft } from "lucide-react";
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
  leaseThresholdMonths: z
    .number({ invalid_type_error: "Vui lòng nhập số" })
    .min(1, "Mốc lưu trú tối thiểu là 1 tháng."),
  refundUnsigned: percentField,
  refundShortTerm: percentField,
  refundLongTerm: percentField,
  refundOnTime: percentField,
});

type PolicyValues = z.infer<typeof policySchema>;

function AdminDepositPolicyPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();

  const form = useForm<PolicyValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
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

  const shortTermHigherThanLongTerm = refundShortTerm > refundLongTerm;

  const onSubmit = (values: PolicyValues) => {
    toast.success("Đã lưu cấu hình chính sách hoàn cọc.");
    form.reset(values);
  };

  if (!isHydrated || role !== "admin") return null;

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <section className="flex h-full flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="mb-2">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-500">
              <Link to="/admin">
                <ChevronLeft className="size-3.5" />
                Admin / Cấu hình / Hoàn cọc
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cấu hình chính sách hoàn cọc</h1>
          <p className="mt-1 text-sm text-gray-500">
            Thiết lập mốc thời gian lưu trú và tỷ lệ khấu trừ hoàn trả tiền cọc áp dụng toàn hệ
            thống.
          </p>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Thông số cấu hình ChinhSachHoanCoc</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="leaseThresholdMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mốc thời hạn lưu trú *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === "" ? 1 : Number(event.target.value),
                                  )
                                }
                              />
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
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === "" ? 0 : Number(event.target.value),
                                  )
                                }
                              />
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
                            <FormLabel>{`Đã ký hợp đồng, lưu trú dưới ${threshold} tháng *`}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === "" ? 0 : Number(event.target.value),
                                  )
                                }
                              />
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
                            <FormLabel>{`Đã ký hợp đồng, lưu trú trên ${threshold} tháng *`}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === "" ? 0 : Number(event.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="refundOnTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hết hạn hợp đồng / Đúng hạn *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(
                                    event.target.value === "" ? 0 : Number(event.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                        <TimelineNode label={`Ở > ${threshold} tháng`} value={refundLongTerm} />
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
                        : Lưu cấu hình
                      </span>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Lưu cấu hình
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Lịch sử cập nhật chính sách</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Người cập nhật</TableHead>
                      <TableHead>Nội dung thay đổi</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>15/05/2026</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>
                        Đổi mốc lưu trú từ 6 tháng thành 9 tháng, đổi tỷ lệ hoàn ngắn hạn thành 40%
                      </TableCell>
                      <TableCell>Cập nhật theo quy định mới.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
