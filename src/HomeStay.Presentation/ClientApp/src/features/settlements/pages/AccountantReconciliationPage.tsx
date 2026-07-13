import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileText,
  Receipt,
  Search,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type HoSoChoDoiSoat = {
  maHoSo: string;
  loaiHoSo: string; // "PhieuCoc" | "HopDong"
  tenKhachHang: string;
  phong: string;
  soTien: number;
  ngayYeuCau: string;
  trangThai: string;
};

type HoaDonDto = {
  maHoaDon: string;
  loaiHoaDon: string;
  tongTien: number;
  ngayLap: string;
};

type ChiTietDoiSoatDto = {
  maHoSo: string;
  loaiHoSo: string;
  soTienCoc: number;
  tyLeHoanCoc: number;
  tongKhauTru: number;
  tienHoan: number;
  tienThuThem: number;
  hoaDons: HoaDonDto[];
};

export function AccountantReconciliationPage() {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<HoSoChoDoiSoat[]>([]);
  const [selected, setSelected] = useState<HoSoChoDoiSoat | null>(null);
  const [calculation, setCalculation] = useState<ChiTietDoiSoatDto | null>(null);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadHoSoList = async (searchQuery: string = "") => {
    setLoadingList(true);
    try {
      const url = searchQuery
        ? `/api/reconciliations/cho-doi-soat?text=${encodeURIComponent(searchQuery)}`
        : "/api/reconciliations/cho-doi-soat";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        if (data.length > 0) {
          // Keep current selection if still in list, else select first
          const found = selected && data.some((p: HoSoChoDoiSoat) => p.maHoSo === selected.maHoSo);
          if (!found) {
            setSelected(data[0]);
            setIssuedCode(null);
          }
        } else {
          setSelected(null);
          setCalculation(null);
        }
      }
    } catch (e) {
      toast.error("Không thể tải danh sách hồ sơ chờ đối soát.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadHoSoList(query);
  }, [query]);

  useEffect(() => {
    if (!selected) {
      setCalculation(null);
      return;
    }
    const loadDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await fetch(
          `/api/reconciliations/chi-tiet-tinh-toan?maHoSo=${encodeURIComponent(
            selected.maHoSo,
          )}&loaiHoSo=${encodeURIComponent(selected.loaiHoSo)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setCalculation(data);
        }
      } catch (e) {
        toast.error("Không thể tải chi tiết tính toán đối soát.");
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [selected]);

  const handleCreate = async () => {
    if (!selected || !calculation) return;
    try {
      const response = await fetch("/api/reconciliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maHoSo: selected.maHoSo,
          loaiHoSo: selected.loaiHoSo,
          ghiChu: "Lập phiếu đối soát tự động từ Web Portal",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIssuedCode(result.maPDS);
        toast.success("Lập phiếu đối soát thành công", {
          description: `${result.maPDS} đã chốt và gửi thông báo sang Quản lý.`,
          icon: <CheckCircle2 className="size-4 text-emerald-600" />,
        });
        loadHoSoList(query);
      } else {
        const err = await response.json();
        toast.error(err.message ?? "Lập phiếu đối soát thất bại.");
      }
    } catch (e) {
      toast.error("Có lỗi xảy ra khi gửi yêu cầu lập phiếu.");
    }
  };

  const baseRefund = calculation ? calculation.soTienCoc * calculation.tyLeHoanCoc : 0;
  const finalAmount = calculation ? calculation.tienHoan - calculation.tienThuThem : 0;

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <aside className="flex w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-4">
          <h1 className="text-base font-bold text-gray-900">Lập phiếu đối soát</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tính toán hoàn cọc, khấu trừ và chốt kết quả tài chính
          </p>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm hồ sơ, khách hàng, phòng…"
              className="h-10 rounded-lg border-gray-200 pl-9 text-sm shadow-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingList ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-500">
              Đang tải danh sách...
            </div>
          ) : profiles.length > 0 ? (
            profiles.map((profile) => (
              <button
                key={profile.maHoSo}
                type="button"
                onClick={() => {
                  setSelected(profile);
                  setIssuedCode(null);
                }}
                className={cn(
                  "mb-2 w-full rounded-lg border px-3 py-3 text-left transition-colors",
                  selected?.maHoSo === profile.maHoSo
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-blue-700">{profile.maHoSo}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                      {profile.tenKhachHang}
                    </p>
                  </div>
                  <Badge className="shrink-0 bg-amber-100 text-[10px] font-semibold text-amber-700">
                    Chờ đối soát
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500">{profile.phong}</span>
                  <span className="font-mono font-bold text-gray-800">
                    {formatCurrency(profile.soTien)}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
              Không có hồ sơ nào đang chờ đối soát.
            </div>
          )}
        </div>
      </aside>

      {loadingDetail ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Đang tải chi tiết tính toán...</p>
        </section>
      ) : !selected || !calculation ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">Chọn hồ sơ để lập phiếu đối soát.</p>
        </section>
      ) : (
        <section className="flex h-full flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-700">
                  {selected.maHoSo}
                </span>
                <h2 className="truncate text-base font-bold text-gray-900">
                  {selected.tenKhachHang}
                </h2>
                {selected.loaiHoSo === "PhieuCoc" && (
                  <Badge className="h-5 bg-blue-100 text-[10px] font-semibold text-blue-700">
                    Phiếu cọc đã hủy
                  </Badge>
                )}
                <Badge className="h-5 bg-amber-100 text-[10px] font-semibold text-amber-700">
                  Chờ đối soát
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">{selected.phong}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Kết quả đối soát
              </p>
              <p
                className={cn(
                  "font-mono text-lg font-bold",
                  finalAmount >= 0 ? "text-emerald-700" : "text-rose-700",
                )}
              >
                {formatCurrency(Math.abs(finalAmount))}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="mx-auto max-w-6xl space-y-4">
              <Card title="Thông tin hồ sơ">
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <Info label="Mã hồ sơ" value={selected.maHoSo} mono />
                  <Info label="Loại hồ sơ" value={selected.loaiHoSo === "PhieuCoc" ? "Phiếu cọc" : "Hợp đồng"} />
                  <Info label="Họ tên khách hàng" value={selected.tenKhachHang} />
                  <Info label="Phòng" value={selected.phong} />
                  <Info label="Tiền cọc ban đầu" value={formatCurrency(calculation.soTienCoc)} mono />
                  <Info label="Ngày yêu cầu" value={formatDate(new Date(selected.ngayYeuCau))} />
                </div>
              </Card>

              <Card
                title="Chính sách hoàn cọc áp dụng"
                icon={<FileText className="size-4 text-blue-600" />}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                    <PolicyLine label="Đã đặt cọc nhưng chưa ký hợp đồng" value={80} />
                    <PolicyLine label="Đã ký hợp đồng, lưu trú dưới 6 tháng" value={50} />
                    <PolicyLine label="Đã ký hợp đồng, lưu trú trên 6 tháng" value={70} />
                    <PolicyLine label="Hết hạn hợp đồng" value={100} />
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <Info label="Chính sách" value="CS01 - Tiêu Chuẩn 2024" />
                    <div className="mt-3 grid gap-2">
                      <SummaryLine label="Tiền cọc ban đầu" value={calculation.soTienCoc} />
                      <SummaryLine
                        label="Tỷ lệ hoàn cọc"
                        textValue={`${calculation.tyLeHoanCoc * 100}%`}
                      />
                      <SummaryLine
                        label="Số tiền hoàn cọc cơ bản"
                        value={baseRefund}
                        highlight
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                title="Các khoản khấu trừ phát sinh"
                icon={<Receipt className="size-4 text-blue-600" />}
              >
                {selected.loaiHoSo === "PhieuCoc" ? (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-800">
                    Phiếu cọc đã hủy, áp dụng chính sách hoàn cọc. Không phát sinh khấu trừ từ hóa
                    đơn lưu trú.
                  </div>
                ) : (
                  <DeductionTable rows={calculation.hoaDons} />
                )}
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <SummaryLine
                    label="Tổng khấu trừ"
                    value={calculation.tongKhauTru}
                    highlight
                  />
                </div>
              </Card>

              <Card
                title="Kết quả đối soát"
                icon={<Calculator className="size-4 text-blue-600" />}
              >
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Chi tiết tính toán
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <ResultLine label="Tiền cọc ban đầu" value={formatCurrency(calculation.soTienCoc)} />
                    <ResultLine label="Tỷ lệ hoàn cọc" value={`${calculation.tyLeHoanCoc * 100}%`} />
                    <ResultLine
                      label="Số tiền hoàn cọc cơ bản"
                      value={formatCurrency(baseRefund)}
                    />
                    <ResultLine label="Tổng khấu trừ" value={formatCurrency(calculation.tongKhauTru)} />
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Công thức</p>
                  <p className="mt-2 font-medium text-gray-800">
                    Số tiền cuối cùng = Số tiền hoàn cọc cơ bản - Tổng khấu trừ
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-gray-900">
                    {formatCurrency(baseRefund)} - {formatCurrency(calculation.tongKhauTru)} ={" "}
                    {formatCurrency(Math.abs(finalAmount))}
                  </p>
                </div>
                <ResultBanner amount={finalAmount} />
              </Card>
            </div>
          </div>

          <footer className="sticky bottom-0 flex min-h-16 items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
            <div className="text-xs text-gray-500">
              {issuedCode ? (
                <span className="font-semibold text-emerald-700">
                  Đã chốt phiếu đối soát {issuedCode}
                </span>
              ) : (
                <span>Hệ thống sẽ gửi thông báo sang Quản lý sau khi tạo phiếu.</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="h-9 bg-blue-600 hover:bg-blue-700"
                onClick={handleCreate}
                disabled={!!issuedCode}
              >
                <CheckCircle2 className="size-4" />
                Tạo phiếu đối soát
              </Button>
              {issuedCode && finalAmount > 0 && (
                <Button type="button" variant="outline" className="h-9" asChild>
                  <Link to="/accountant/refunds">
                    Lập phiếu hoàn cọc
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
              {issuedCode && finalAmount < 0 && (
                <Button type="button" variant="outline" className="h-9" asChild>
                  <Link to="/accountant/thanh-toan-tra-phong">
                    Thanh toán trả phòng
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </footer>
        </section>
      )}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-900", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function PolicyLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-mono font-bold text-gray-900">{value}%</span>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  textValue,
  highlight,
}: {
  label: string;
  value?: number;
  textValue?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        highlight ? "border-blue-100 bg-blue-50" : "border-gray-100 bg-white",
      )}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-sm font-bold",
          highlight ? "text-blue-700" : "text-gray-900",
        )}
      >
        {textValue ?? formatCurrency(value ?? 0)}
      </p>
    </div>
  );
}

function DeductionTable({ rows }: { rows: HoaDonDto[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
        Không có khoản khấu trừ phát sinh.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2">Mã hóa đơn</th>
            <th className="px-3 py-2">Loại hóa đơn</th>
            <th className="px-3 py-2">Ngày lập</th>
            <th className="px-3 py-2 text-right">Số tiền</th>
            <th className="px-3 py-2">Trạng thái hóa đơn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row) => (
            <tr key={row.maHoaDon} className="align-top">
              <td className="px-3 py-3 font-mono text-xs font-semibold text-blue-700">{row.maHoaDon}</td>
              <td className="px-3 py-3 text-gray-700">{row.loaiHoaDon}</td>
              <td className="px-3 py-3 text-gray-600">{formatDate(new Date(row.ngayLap))}</td>
              <td className="px-3 py-3 text-right font-mono font-semibold text-rose-700">
                {formatCurrency(row.tongTien)}
              </td>
              <td className="px-3 py-3">
                <Badge className="bg-orange-100 text-orange-700">Chưa thanh toán</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultBanner({ amount }: { amount: number }) {
  if (amount > 0) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
        <p className="text-sm font-bold text-emerald-700">Số tiền khách được hoàn</p>
        <p className="mt-1 font-mono text-2xl font-bold text-emerald-800">
          {formatCurrency(amount)}
        </p>
      </div>
    );
  }
  if (amount < 0) {
    return (
      <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-4">
        <p className="text-sm font-bold text-rose-700">Số tiền khách phải đóng thêm</p>
        <p className="mt-1 font-mono text-2xl font-bold text-rose-800">
          {formatCurrency(Math.abs(amount))}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
      <p className="text-sm font-bold text-gray-700">Không phát sinh hoàn/thu thêm</p>
      <p className="mt-1 font-mono text-2xl font-bold text-gray-900">0 VNĐ</p>
    </div>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <span className="text-gray-600">{label}</span>
      <span className="font-mono font-bold text-gray-900">{value}</span>
    </div>
  );
}

function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.max(amount, 0))} VNĐ`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}
