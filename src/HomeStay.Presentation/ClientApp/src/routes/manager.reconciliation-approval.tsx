import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/manager/reconciliation-approval")({ component: ManagerReconciliationApprovalPage });

type Pds = {
  maPDS: string; maHD?: string; maPhieuCoc: string; ngayDoiSoat: string;
  tyLeHoanCoc: number; tongKhauTru: number; tienHoan: number; tienThuThem: number;
  trangThai: string; ghiChu?: string;
};

const schema = z.object({
  khachHangDongY: z.literal(true, { errorMap: () => ({ message: "Cần xác nhận khách hàng đã đồng ý." }) }),
  ghiChu: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự."),
});
type Values = z.infer<typeof schema>;
const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`;

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (response.ok) return response.json() as Promise<T>;
  const body = await response.json().catch(() => null) as { message?: string } | null;
  throw Object.assign(new Error(body?.message ?? "Không thể xử lý yêu cầu."), { status: response.status });
}

function ManagerReconciliationApprovalPage() {
  const [items, setItems] = useState<Pds[]>([]);
  const [selected, setSelected] = useState<Pds | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { khachHangDongY: false as true, ghiChu: "" } });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Pds[]>("/api/reconciliation-approvals/cho-xac-nhan");
      setItems(data);
      setSelected((current) => data.find((x) => x.maPDS === current?.maPDS) ?? null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể tải hàng đợi."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);
  const filtered = items.filter((x) => [x.maPDS, x.maHD, x.maPhieuCoc].some((v) => v?.toLowerCase().includes(query.toLowerCase().trim())));

  const submit = form.handleSubmit(async (values) => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await api(`/api/reconciliation-approvals/${encodeURIComponent(selected.maPDS)}/xac-nhan`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      toast.success("Đã xác nhận kết quả đối soát", { icon: <CheckCircle2 className="size-4 text-emerald-600" /> });
      form.reset({ khachHangDongY: false as true, ghiChu: "" });
      setSelected(null);
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xác nhận.");
      if ((error as { status?: number }).status === 409) await reload();
    } finally { setSubmitting(false); }
  });

  return <div className="flex h-full overflow-hidden">
    <aside className="flex w-[350px] shrink-0 flex-col border-r bg-white">
      <div className="border-b p-3"><h2 className="text-sm font-bold">PĐS chờ xác nhận</h2><p className="text-xs text-gray-500">{filtered.length} phiếu cần trao đổi với khách</p></div>
      <div className="relative border-b p-3"><Search className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-gray-400"/><Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 pl-8 text-xs" placeholder="Tìm PĐS, hợp đồng, phiếu cọc..."/></div>
      <div className="flex-1 overflow-y-auto">{loading && <Loader2 className="mx-auto mt-8 size-5 animate-spin"/>}<ul className="divide-y">{filtered.map((item) => <li key={item.maPDS}><button type="button" onClick={() => { setSelected(item); form.reset({ khachHangDongY: false as true, ghiChu: "" }); }} className={cn("w-full border-l-2 p-3 text-left hover:bg-amber-50", selected?.maPDS === item.maPDS && "border-amber-500 bg-amber-50")}><div className="flex justify-between"><span className="font-mono text-xs font-bold text-blue-600">{item.maPDS}</span><Badge className="bg-amber-100 text-amber-700">Chờ xác nhận</Badge></div><p className="mt-1 text-xs text-gray-600">{item.maHD ?? item.maPhieuCoc}</p><p className="mt-1 text-right text-sm font-bold">{money(item.tienHoan || item.tienThuThem)}</p></button></li>)}</ul></div>
    </aside>
    {!selected ? <section className="flex flex-1 items-center justify-center bg-gray-50 text-sm text-gray-500">Chọn phiếu đối soát để xác nhận.</section> :
    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      <header className="flex h-14 items-center gap-2 border-b bg-white px-5"><strong className="font-mono">{selected.maPDS}</strong><Badge className="bg-amber-100 text-amber-700">Chờ xác nhận</Badge><span className="text-xs text-gray-500">{selected.maHD ?? selected.maPhieuCoc}</span></header>
      <main className="flex-1 overflow-y-auto p-5"><div className="mx-auto max-w-3xl space-y-4 rounded-lg border bg-white p-5"><h3 className="font-semibold">Kết quả Kế toán đề xuất</h3><div className="grid grid-cols-2 gap-3 text-sm"><Info label="Tỷ lệ hoàn" value={`${Math.round(selected.tyLeHoanCoc * 100)}%`}/><Info label="Tổng khấu trừ" value={money(selected.tongKhauTru)}/><Info label="Tiền hoàn" value={money(selected.tienHoan)}/><Info label="Tiền thu thêm" value={money(selected.tienThuThem)}/></div>{selected.ghiChu && <p className="rounded bg-gray-50 p-3 text-sm">{selected.ghiChu}</p>}<label className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-sm"><input type="checkbox" className="mt-1" {...form.register("khachHangDongY")}/><span>Tôi xác nhận đã thông báo kết quả và khách hàng đồng ý.</span></label><p className="text-xs text-red-600">{form.formState.errors.khachHangDongY?.message}</p><label className="block text-xs font-medium">Ghi chú xác nhận<textarea {...form.register("ghiChu")} className="mt-1 min-h-24 w-full rounded border p-2 text-sm" maxLength={500}/></label></div></main>
      <footer className="flex h-14 items-center justify-between border-t bg-white px-5"><span className="text-xs text-gray-400"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> : Xác nhận</span><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="size-4 animate-spin"/>}Xác nhận khách đã đồng ý</Button></footer>
    </form>}
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded border bg-gray-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-right font-mono font-bold">{value}</p></div>; }
