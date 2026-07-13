import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DepositDetailPanel, DepositStatusBadge } from "./DepositDetailPanel";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  loadDepositLookupDetail,
  lookupDeposits,
  type DepositLookupDetail,
  type DepositLookupItem,
} from "@/features/deposits/services/deposit-lookup-service";

const schema = z
  .object({ maPhieuCoc: z.string(), sdt: z.string(), email: z.string(), soGiayTo: z.string() })
  .refine((value) => Object.values(value).some((item) => item.trim()), {
    message: "Vui lòng nhập ít nhất một tiêu chí tìm kiếm",
    path: ["maPhieuCoc"],
  });
type FormValues = z.infer<typeof schema>;

export function DepositLookupWorkspace() {
  const [items, setItems] = useState<DepositLookupItem[]>([]);
  const [selected, setSelected] = useState<DepositLookupDetail | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { maPhieuCoc: "", sdt: "", email: "", soGiayTo: "" },
  });

  const search = handleSubmit(
    async (values) => {
      setLoading(true);
      setSelected(null);
      try {
        const result = await lookupDeposits(values);
        setItems(result);
        setSearched(true);
        if (!result.length) toast.info("Không tìm thấy Phiếu cọc phù hợp");
      } catch (error) {
        setItems([]);
        setSearched(true);
        toast.error(error instanceof Error ? error.message : "Không thể tra cứu phiếu cọc.");
      } finally {
        setLoading(false);
      }
    },
    () => toast.error("Vui lòng nhập ít nhất một tiêu chí tìm kiếm"),
  );

  const select = async (id: string) => {
    setLoading(true);
    try {
      setSelected(await loadDepositLookupDetail(id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết phiếu cọc.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-50">
      <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <form onSubmit={search} className="shrink-0 space-y-3 border-b border-gray-200 p-4">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Tra cứu phiếu cọc</h1>
            <p className="mt-1 text-xs text-gray-500">Nhập ít nhất một tiêu chí để tìm kiếm.</p>
          </div>
          <Field
            label="Mã phiếu"
            input={
              <Input {...register("maPhieuCoc")} placeholder="PC..." className="h-8 text-xs" />
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Số điện thoại"
              input={<Input {...register("sdt")} className="h-8 text-xs" />}
            />
            <Field
              label="CCCD/Hộ chiếu"
              input={<Input {...register("soGiayTo")} className="h-8 text-xs" />}
            />
          </div>
          <Field
            label="Email"
            input={<Input {...register("email")} type="email" className="h-8 text-xs" />}
          />
          {errors.maPhieuCoc && <p className="text-xs text-red-600">{errors.maPhieuCoc.message}</p>}
          <Button type="submit" disabled={loading} className="h-8 w-full text-xs">
            <Search className="mr-1 size-3.5" />
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </form>
        <div className="flex-1 overflow-y-auto">
          {!searched ? (
            <Empty text="Nhập tiêu chí và nhấn Tìm kiếm." />
          ) : !items.length ? (
            <Empty text="Không tìm thấy Phiếu cọc phù hợp." />
          ) : (
            items.map((item) => (
              <button
                key={item.maPhieuCoc}
                type="button"
                onClick={() => void select(item.maPhieuCoc)}
                className={`w-full border-b px-4 py-3 text-left hover:bg-gray-50 ${selected?.maPhieuCoc === item.maPhieuCoc ? "bg-blue-50" : "bg-white"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {item.maPhieuCoc}
                  </span>
                  <DepositStatusBadge status={item.trangThai} />
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-900">{item.hoTenKhachHang}</p>
                <p className="mt-1 text-xs text-gray-500">
                  P.{item.soPhong} · {item.sdt || "Không có SĐT"}
                </p>
              </button>
            ))
          )}
        </div>
        <footer className="shrink-0 border-t px-4 py-2 text-xs text-gray-500">
          {searched ? `${items.length} phiếu cọc` : "Chưa tìm kiếm"}
        </footer>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50/60">
        {selected ? (
          <DepositDetailPanel deposit={selected} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            Chọn một phiếu cọc để xem chi tiết.
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, input }: { label: string; input: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-[11px] text-gray-600">{label}</Label>
      {input}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="p-6 text-center text-xs text-gray-500">{text}</div>;
}
