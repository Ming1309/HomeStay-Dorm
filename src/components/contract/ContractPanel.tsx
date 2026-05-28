import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FilePenLine,
  FileSignature,
  FileText,
  Lock,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import type { ContractDeposit } from "@/lib/residence/mock-contracts";
import { Label } from "@/components/ui/label";

const servicesList = [
  { id: "parking", label: "Gửi xe máy", price: 150000 },
  { id: "cleaning", label: "Dọn phòng (2 lần/tuần)", price: 300000 },
  { id: "laundry", label: "Giặt ủi (5kg/tuần)", price: 200000 },
];

const contractSchema = z
  .object({
    startDate: z.string().min(1, "Vui lòng nhập ngày bắt đầu (DD/MM/YYYY)"),
    endDate: z.string().min(1, "Vui lòng nhập ngày kết thúc (DD/MM/YYYY)"),
    baseRent: z.string().min(1, "Vui lòng nhập giá thuê"),
    paymentCycle: z.string().min(1, "Vui lòng chọn kỳ thanh toán"),
    services: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      // Simple string comparison assuming format DD/MM/YYYY needs parsing
      // For a real app, use date-fns to parse and compare accurately.
      // Here we implement a basic parse for DD/MM/YYYY:
      const parseDate = (str: string) => {
        const parts = str.split("/");
        if (parts.length !== 3) return new Date(0);
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      };
      const start = parseDate(data.startDate);
      const end = parseDate(data.endDate);
      return end > start;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    },
  );

type ContractFormValues = z.infer<typeof contractSchema>;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
};

type Props = {
  deposit: ContractDeposit | null;
  onCancelContract: (id: string) => void;
  onConfirmSigned: (id: string) => void;
};

export function ContractPanel({ deposit, onCancelContract, onConfirmSigned }: Props) {
  const [phase, setPhase] = useState<1 | 2>(1);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      baseRent: deposit ? formatCurrency(deposit.baseRent) : "",
      paymentCycle: "1",
      services: [],
    },
  });

  // Reset state when selection changes
  useEffect(() => {
    setPhase(1);
    form.reset({
      startDate: "",
      endDate: "",
      baseRent: deposit ? formatCurrency(deposit.baseRent) : "",
      paymentCycle: "1",
      services: [],
    });
  }, [deposit?.id, form, deposit]);

  if (!deposit) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-gray-50/60">
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white">
            <FilePenLine className="size-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            👈 Chọn một hồ sơ đã duyệt để tiến hành lập hợp đồng.
          </p>
        </div>
      </section>
    );
  }

  const onSubmit = (data: ContractFormValues) => {
    // Phase 1 -> Phase 2 transition
    setPhase(2);
    toast.info("Đã chuyển sang chế độ Xem trước hợp đồng", {
      icon: <FileSignature className="size-4 text-blue-500" />,
    });
  };

  const renderPhase1 = () => (
    <Form {...form}>
      <form id="contract-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <SectionHeader
            icon={<FileText className="size-4 text-blue-500" />}
            title="Nhập thông tin Hợp đồng"
          />

          <div className="grid grid-cols-2 gap-x-5 gap-y-5">
            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-600">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DD/MM/YYYY"
                      className="h-9 border-gray-200 text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-600">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DD/MM/YYYY"
                      className="h-9 border-gray-200 text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Base Rent */}
            <FormField
              control={form.control}
              name="baseRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-600">
                    Giá thuê / tháng <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-9 border-gray-200 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Deposit Paid (Readonly) */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Tiền cọc đã thu</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  readOnly
                  value={deposit ? formatCurrency(deposit.depositPaid) : ""}
                  className="h-9 border-gray-200 bg-gray-50 pl-8 text-sm font-mono text-gray-500"
                />
              </div>
            </div>

            {/* Payment Cycle */}
            <FormField
              control={form.control}
              name="paymentCycle"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-xs font-medium text-gray-600">
                    Kỳ thanh toán <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 border-gray-200 text-sm focus:ring-1 focus:ring-blue-500">
                        <SelectValue placeholder="Chọn kỳ thanh toán" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 tháng / lần</SelectItem>
                      <SelectItem value="3">3 tháng / lần</SelectItem>
                      <SelectItem value="6">6 tháng / lần</SelectItem>
                      <SelectItem value="12">12 tháng / lần</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-2">
            <Label className="text-xs font-medium text-gray-600 mb-3 block">Dịch vụ đi kèm</Label>
            <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
              {servicesList.map((service) => (
                <FormField
                  key={service.id}
                  control={form.control}
                  name="services"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={service.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(service.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, service.id])
                                : field.onChange(
                                    field.value?.filter((value) => value !== service.id),
                                  );
                            }}
                            className="border-gray-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none flex-1 flex justify-between">
                          <FormLabel className="text-sm font-medium text-gray-700 cursor-pointer">
                            {service.label}
                          </FormLabel>
                          <span className="text-sm text-gray-500 font-mono">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );

  const renderPhase2 = () => {
    const values = form.getValues();
    const selectedServices = servicesList.filter((s) => values.services.includes(s.id));

    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm print:shadow-none space-y-8">
          {/* Header of document */}
          <div className="text-center space-y-2 border-b border-gray-200 pb-6">
            <h2 className="text-lg font-bold uppercase text-gray-800">Hợp đồng Thuê Phòng</h2>
            <p className="text-sm text-gray-500 font-mono">Mã HĐ: HD-{deposit.code}</p>
          </div>

          <div className="space-y-6 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="block text-xs uppercase text-gray-400 mb-1">
                  Bên Thuê (Đại diện)
                </strong>
                {deposit.representativeName}
                <br />
                SĐT: <span className="font-mono">{deposit.representativePhone}</span>
                <br />
                Địa chỉ: {deposit.representativeAddress}
              </div>
              <div>
                <strong className="block text-xs uppercase text-gray-400 mb-1">Phòng Thuê</strong>
                {deposit.room} ({deposit.membersCount} người)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div>
                <strong className="block text-xs uppercase text-gray-400 mb-1">
                  Giá thuê & Cọc
                </strong>
                Giá thuê: <span className="font-mono">{values.baseRent}</span>
                <br />
                Đã cọc: <span className="font-mono">{formatCurrency(deposit.depositPaid)}</span>
              </div>
              <div>
                <strong className="block text-xs uppercase text-gray-400 mb-1">
                  Kỳ thanh toán
                </strong>
                {values.paymentCycle} tháng / lần
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div>
                <strong className="block text-xs uppercase text-gray-400 mb-1">
                  Thời hạn thuê
                </strong>
                <span className="font-mono">{values.startDate}</span> -{" "}
                <span className="font-mono">{values.endDate}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <strong className="block text-xs uppercase text-gray-400 mb-3">Dịch vụ đi kèm</strong>
              {selectedServices.length === 0 ? (
                <span className="text-gray-400 italic">Không có dịch vụ đi kèm</span>
              ) : (
                <ul className="space-y-2">
                  {selectedServices.map((s) => (
                    <li key={s.id} className="flex justify-between">
                      <span>{s.label}</span>
                      <span className="font-mono">{formatCurrency(s.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6 flex justify-between px-8 text-center">
              <div>
                <strong className="block mb-12">Bên Cho Thuê</strong>
                <span className="text-gray-400 italic">(Ký, ghi rõ họ tên)</span>
              </div>
              <div>
                <strong className="block mb-12">Bên Thuê</strong>
                <span className="text-gray-400 italic">(Ký, ghi rõ họ tên)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      {/* ── STICKY HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-600">#{deposit.code}</span>
              <h1 className="text-sm font-bold text-gray-800">{deposit.representativeName}</h1>
              {phase === 1 ? (
                <Badge className="h-5 border-transparent bg-emerald-100 px-2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">
                  Đã duyệt
                </Badge>
              ) : (
                <Badge className="h-5 border-transparent bg-amber-100 px-2 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                  Chờ ký
                </Badge>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right text-xs text-gray-400">
            <div>
              Phòng: <span className="font-mono font-semibold text-gray-700">{deposit.room}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── SCROLLABLE BODY ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 pb-24">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Read-only compact card to remind Sales */}
          <div className="flex items-center gap-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="size-4 text-gray-400" />
              <span>
                Đại diện: <strong>{deposit.representativeName}</strong>
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="text-gray-600">
              Phòng: <strong>{deposit.room}</strong>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="text-gray-600">
              Số lượng: <strong>{deposit.membersCount} người</strong>
            </div>
          </div>

          {phase === 1 ? renderPhase1() : renderPhase2()}
        </div>
      </div>

      {/* ── STICKY FOOTER ──────────────────────────────────────────────── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="text-xs text-gray-500">
            {phase === 1 && (
              <>
                <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[10px]">
                  Ctrl
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-[10px]">
                  S
                </kbd>
                <span className="ml-1.5">: Lưu & Xem trước</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {phase === 1 ? (
              <Button
                type="submit"
                form="contract-form"
                size="sm"
                className="h-8 gap-1.5 bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
              >
                <FilePenLine className="size-3.5" />
                Lưu & Xem trước Hợp đồng
              </Button>
            ) : (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 border-red-200 px-4 text-sm font-medium text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="size-3.5" />
                      Hủy hợp đồng
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <ShieldAlert className="size-5" />
                        Hủy hợp đồng này?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        Bạn có chắc chắn muốn hủy hợp đồng này? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Đóng</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          toast.error("Đã hủy", {
                            description: `Hợp đồng cho phiếu #${deposit.code} đã bị hủy.`,
                          });
                          onCancelContract(deposit.id);
                        }}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Xác nhận hủy
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  size="sm"
                  onClick={() => {
                    toast.success("Lập hợp đồng thành công", {
                      description: `Hồ sơ #${deposit.code} đã chuyển sang Chờ thanh toán.`,
                      icon: <CheckCircle2 className="size-4 text-emerald-500" />,
                    });
                    onConfirmSigned(deposit.id);
                  }}
                  className="h-8 gap-1.5 bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  <CheckCircle2 className="size-3.5" />
                  Xác nhận khách đã ký
                </Button>
              </>
            )}
          </div>
        </div>
      </footer>
    </section>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-gray-100 pb-1">
      <div className="flex size-7 items-center justify-center rounded-md bg-blue-50">{icon}</div>
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
    </div>
  );
}
