import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ClipboardCheck, ImageIcon, Search, Upload, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/ui/form";
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
import { cn } from "@/shared/lib/utils";
import {
  formatReturnDate,
  loadRecoveryContractDetail,
  loadRecoveryContracts,
  saveRecoveryReport,
  uploadRecoveryProof,
  type AssetRecoveryAsset,
  type AssetRecoveryDetail,
  type AssetRecoveryListItem,
} from "@/features/handovers/services/asset-recovery-service";

const schema = z
  .object({
    assets: z.array(
      z
        .object({
          id: z.string().min(1),
          name: z.string().min(1),
          expectedQty: z.coerce.number().min(0),
          recoveredQty: z.coerce
            .number({ invalid_type_error: "Nhập số lượng thu hồi" })
            .min(0, "Số lượng phải lớn hơn hoặc bằng 0"),
          condition: z.string().min(1, "Chọn tình trạng"),
          proofUrl: z.string().optional(),
          proofName: z.string().optional(),
          note: z.string().optional(),
        })
        .superRefine((asset, ctx) => {
          if (asset.recoveredQty > asset.expectedQty) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_big,
              maximum: asset.expectedQty,
              type: "number",
              inclusive: true,
              path: ["recoveredQty"],
              message: "Số lượng thu hồi không thể lớn hơn số lượng chuẩn",
            });
          }
        }),
    ),
  })
  .superRefine((data, ctx) => {
    data.assets.forEach((asset, index) => {
      if (Number.isNaN(asset.recoveredQty)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets", index, "recoveredQty"],
          message: "Nhập số lượng thu hồi hợp lệ",
        });
      }
    });
  });

type FormValues = z.infer<typeof schema>;

function mapAssetsToForm(assets: AssetRecoveryAsset[]) {
  return assets.map((asset) => ({
    id: asset.maTS,
    name: asset.tenTaiSan,
    expectedQty: asset.soLuongTieuChuan,
    recoveredQty: asset.soLuongTieuChuan,
    condition: "Bình thường",
    proofUrl: undefined as string | undefined,
    proofName: undefined as string | undefined,
    note: "",
  }));
}

export function ManagerAssetRecoveryPage() {
  const [items, setItems] = useState<AssetRecoveryListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("maHD"),
  );
  const [selectedDetail, setSelectedDetail] = useState<AssetRecoveryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchList = async (tuKhoa?: string) => {
    setLoadingList(true);
    try {
      const results = await loadRecoveryContracts(tuKhoa);
      setItems(results);
      if (selectedId && !results.some((item) => item.maHD === selectedId)) {
        setSelectedId(null);
        setSelectedDetail(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách hợp đồng");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void fetchList();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDetail(null);
      return;
    }

    const controller = new AbortController();
    setLoadingDetail(true);
    loadRecoveryContractDetail(selectedId, controller.signal)
      .then((detail) => setSelectedDetail(detail))
      .catch((error) => {
        if ((error as Error).name === "AbortError") return;
        toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết hợp đồng");
        setSelectedDetail(null);
      })
      .finally(() => setLoadingDetail(false));

    return () => controller.abort();
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.maHD.toLowerCase().includes(q) ||
        item.tenKhachHang.toLowerCase().includes(q) ||
        item.soPhong.toLowerCase().includes(q) ||
        (item.toaNha ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const selectedListItem = filtered.find((item) => item.maHD === selectedId) ?? null;

  const handleSave = async (values: FormValues) => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await saveRecoveryReport(
        selectedId,
        values.assets.map((asset) => ({
          maTS: asset.id,
          soLuong: asset.recoveredQty,
          tinhTrang: asset.condition,
          ghiChu: asset.note?.trim() || undefined,
          minhChung: asset.proofUrl || undefined,
        })),
      );
      setItems((current) => current.filter((item) => item.maHD !== selectedId));
      setSelectedId(null);
      setSelectedDetail(null);
      toast.success("Lập biên bản thu hồi thành công. Đã gửi thông báo cho Kế toán.", {
        icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu biên bản thu hồi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-800">Thu hồi tài sản</h2>
          <p className="mt-1 text-xs text-gray-500">Hợp đồng có lịch trả phòng trong ngày</p>
          <p className="mt-2 text-xs text-gray-400">
            {loadingList ? "Đang tải..." : `${filtered.length} hợp đồng chờ thu hồi`}
          </p>
        </div>
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm hợp đồng, phòng, khách..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              {loadingList
                ? "Đang tải danh sách hợp đồng..."
                : "Không có hợp đồng nào có lịch trả phòng trong ngày."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <li key={item.maHD}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.maHD)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-slate-50/80",
                      selectedId === item.maHD && "border-l-blue-500 bg-blue-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{item.maHD}</span>
                      <Badge className="h-5 bg-blue-100 text-[10px] text-blue-700">
                        {formatReturnDate(item.ngayTraPhong)}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.tenKhachHang}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {item.soPhong}
                      {item.toaNha ? ` • ${item.toaNha}` : ""}
                      {item.gioTraPhong ? ` • ${item.gioTraPhong}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {!selectedListItem ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60 p-6">
          <div className="max-w-xl rounded-lg border border-dashed border-gray-200 bg-white px-8 py-10 text-center text-sm text-gray-500">
            <p className="mb-2 text-base font-semibold text-gray-900">
              Chọn hợp đồng để lập biên bản thu hồi tài sản
            </p>
            <p>
              Hệ thống sẽ hiện danh sách tài sản cho sẵn. Ghi số lượng thu hồi và tình trạng của từng
              thứ.
            </p>
          </div>
        </section>
      ) : loadingDetail || !selectedDetail ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60 p-6">
          <p className="text-sm text-gray-500">
            {loadingDetail ? "Đang tải danh sách tài sản..." : "Không thể tải chi tiết hợp đồng."}
          </p>
        </section>
      ) : (
        <RecoveryForm
          contract={selectedDetail}
          returnDate={selectedListItem.ngayTraPhong}
          returnTime={selectedListItem.gioTraPhong}
          saving={saving}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function RecoveryForm({
  contract,
  returnDate,
  returnTime,
  saving,
  onSave,
}: {
  contract: AssetRecoveryDetail;
  returnDate: string;
  returnTime: string;
  saving: boolean;
  onSave: (values: FormValues) => Promise<void>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assets: mapAssetsToForm(contract.taiSan),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "assets" });
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    form.reset({
      assets: mapAssetsToForm(contract.taiSan),
    });
  }, [contract, form]);

  const handleUpload = async (index: number, file: File | undefined) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const result = await uploadRecoveryProof(file);
      form.setValue(`assets.${index}.proofUrl`, result.duongDan, { shouldDirty: true });
      form.setValue(`assets.${index}.proofName`, file.name, { shouldDirty: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh minh chứng");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-gray-500">Hợp đồng</p>
            <p className="font-mono text-sm font-bold text-gray-900">{contract.maHD}</p>
            <p className="mt-1 text-sm text-gray-600">
              {contract.tenKhachHang} • {contract.soPhong}
              {contract.toaNha ? ` • ${contract.toaNha}` : ""}
            </p>
          </div>
          <Badge className="h-6 bg-emerald-100 text-[10px] text-emerald-700">
            Lịch trả: {formatReturnDate(returnDate)}
            {returnTime ? ` ${returnTime}` : ""}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Form {...form}>
          <form id="recovery-form" onSubmit={form.handleSubmit(onSave)}>
            <div className="rounded-lg border border-gray-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2 text-xs">STT</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Tài sản</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Số lượng chuẩn</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Số lượng thu hồi</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Tình trạng</TableHead>
                    <TableHead className="w-28 px-2 py-2 text-center text-xs">Minh chứng</TableHead>
                    <TableHead className="px-2 py-2 text-xs">Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="p-2 text-xs text-gray-500">{index + 1}</TableCell>
                      <TableCell className="p-2 text-sm font-medium">{field.name}</TableCell>
                      <TableCell className="p-2 text-sm">{field.expectedQty}</TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.recoveredQty` as const}
                          render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-8 px-2 text-sm"
                                  value={qtyField.value}
                                  onChange={(event) => qtyField.onChange(event.target.value)}
                                />
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.condition` as const}
                          render={({ field: conditionField }) => (
                            <FormItem>
                              <FormControl>
                                <Select
                                  value={conditionField.value}
                                  onValueChange={conditionField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 px-2 text-sm">
                                      <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Bình thường">Bình thường</SelectItem>
                                    <SelectItem value="Hư hỏng">Hư hỏng</SelectItem>
                                    <SelectItem value="Mất mát">Mất mát</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.proofName` as const}
                          render={({ field: proofField }) => {
                            const condition = form.watch(`assets.${index}.condition`);
                            const needsProof = condition !== "Bình thường";
                            const isUploading = uploadingIndex === index;
                            return (
                              <FormItem>
                                <FormControl>
                                  {proofField.value ? (
                                    <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
                                      <ImageIcon className="size-3.5 shrink-0 text-gray-400" />
                                      <span
                                        className="flex-1 truncate text-[11px] font-medium text-gray-700"
                                        title={proofField.value}
                                      >
                                        {proofField.value}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          proofField.onChange(undefined);
                                          form.setValue(`assets.${index}.proofUrl`, undefined);
                                        }}
                                        className="text-gray-400 hover:text-rose-600"
                                      >
                                        <X className="size-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        disabled={isUploading || saving}
                                        className="absolute inset-0 w-full cursor-pointer opacity-0"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          void handleUpload(index, file);
                                          e.target.value = "";
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                          "pointer-events-none h-8 w-full px-2 text-[11px] font-normal shadow-none",
                                          needsProof
                                            ? "border-amber-300 bg-amber-50 text-amber-700"
                                            : "bg-white text-gray-500",
                                        )}
                                      >
                                        <Upload className="mr-1.5 size-3" />
                                        {isUploading
                                          ? "Đang tải..."
                                          : needsProof
                                            ? "Cần ảnh"
                                            : "Tải lên"}
                                      </Button>
                                    </div>
                                  )}
                                </FormControl>
                              </FormItem>
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <FormField
                          control={form.control}
                          name={`assets.${index}.note` as const}
                          render={({ field: noteField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Ghi chú..."
                                  className="h-8 px-2 text-sm"
                                  {...noteField}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </form>
        </Form>
      </div>

      <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
        <div className="text-xs text-gray-400">
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          /
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
            S
          </kbd>
          : Lưu biên bản thu hồi
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="recovery-form"
            disabled={saving || uploadingIndex !== null}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <ClipboardCheck className="mr-1.5 size-4" />
            {saving ? "Đang lưu..." : "Lưu biên bản thu hồi"}
          </Button>
        </div>
      </footer>
    </section>
  );
}
