import { useEffect, useState, type ReactNode } from "react";
import { Eye, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

import {
  type ContractLookupDetail,
  type ContractLookupItem,
  type ContractMember,
  type LookupStatus,
  loadContractLookupDetail,
  lookupContracts,
  statusBadgeClass,
  STATUS_LABEL,
  toBackendStatus,
  toLookupStatus,
} from "@/features/contracts/services/contract-lookup-service";

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const formatPeriod = (start: string, end: string) => `${formatDate(start)} - ${formatDate(end)}`;

const formatPaymentCycle = (kyThanhToan: number | null) =>
  kyThanhToan ? `${kyThanhToan} tháng / lần` : "—";

const mapMember = (member: ContractMember): ApprovedMember => ({
  id: member.maKH,
  fullName: member.hoTen,
  gender: member.gioiTinh === "Nữ" ? "female" : "male",
  dob: formatDate(member.ngaySinh),
  nationality: member.quocTich ?? "Việt Nam",
  docType: member.loaiGiayTo === "Hộ chiếu" ? "Hộ chiếu" : "CCCD",
  docNumber: member.soGiayTo ?? "—",
  phone: member.sdt ?? "—",
  diaChiThuongTru: member.diaChiThuongTru,
});

type ApprovedMember = {
  id: string;
  fullName: string;
  gender: "male" | "female";
  dob: string;
  nationality: string;
  docType: "CCCD" | "Hộ chiếu";
  docNumber: string;
  phone: string;
  diaChiThuongTru: string | null;
};

export function ContractLookupWorkspace() {
  const linkedContractId = new URLSearchParams(window.location.search).get("maHD");
  // A2: mặc định lọc hợp đồng đang hiệu lực khi mở màn hình / không nhập tiêu chí
  const [queryInput, setQueryInput] = useState("");
  const [statusInput, setStatusInput] = useState<string>("active");

  const [items, setItems] = useState<ContractLookupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(linkedContractId);
  const [selected, setSelected] = useState<ContractLookupDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [viewMemberDetails, setViewMemberDetails] = useState<ApprovedMember | null>(null);

  const fetchList = async (
    criteria: { tuKhoa?: string; trangThai?: string },
    showEmptyToast = false,
  ) => {
    setLoading(true);
    try {
      const results = await lookupContracts(criteria);
      setItems(results);
      setSearched(true);
      if (showEmptyToast && results.length === 0) {
        toast.info("Không tìm thấy hợp đồng phù hợp");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách hợp đồng");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (linkedContractId) {
      setQueryInput(linkedContractId);
      setStatusInput("all");
      void fetchList({ tuKhoa: linkedContractId, trangThai: "all" });
      return;
    }
    // A2: mở form = danh sách HĐ đang hiệu lực
    void fetchList({});
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }

    const controller = new AbortController();
    setLoadingDetail(true);
    loadContractLookupDetail(selectedId, controller.signal)
      .then((detail) => {
        setSelected(detail);
      })
      .catch((error) => {
        if ((error as Error).name === "AbortError") return;
        toast.error(error instanceof Error ? error.message : "Không thể tải chi tiết hợp đồng");
        setSelected(null);
      })
      .finally(() => setLoadingDetail(false));

    return () => controller.abort();
  }, [selectedId]);

  useEffect(() => {
    if (selectedId && !items.some((item) => item.maHD === selectedId)) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  const onSearch = () => {
    const criteria = {
      tuKhoa: queryInput.trim() || undefined,
      // "all" gửi rõ "all" → backend trả mọi trạng thái
      // rỗng hoàn toàn (mở form / không chọn) → A2 danh sách đang hiệu lực
      trangThai: toBackendStatus(statusInput),
    };
    void fetchList(criteria, true);
  };

  const selectedStatus: LookupStatus | null = selected ? toLookupStatus(selected.trangThai) : null;

  const monthlyTotal = selected
    ? selected.giaThue + selected.dichVus.reduce((sum, service) => sum + service.donGiaKyKet, 0)
    : 0;

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-3">
          <Card className="border-gray-200 shadow-none">
            <CardContent className="space-y-2 p-3">
              <Input
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                placeholder="Tìm theo Tên, SĐT, CCCD, Phòng..."
                className="h-9 text-sm"
              />
              <Select value={statusInput} onValueChange={setStatusInput}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Trạng thái hợp đồng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending_sign">Chờ ký</SelectItem>
                  <SelectItem value="pending_payment">Chờ thanh toán</SelectItem>
                  <SelectItem value="pending_handover">Chờ bàn giao</SelectItem>
                  <SelectItem value="active">Đang hiệu lực</SelectItem>
                  <SelectItem value="liquidated">Đã thanh lý</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                className="h-9 w-full bg-blue-600 hover:bg-blue-700"
                onClick={onSearch}
                disabled={loading}
              >
                <Search className="size-4" />
                Tìm kiếm
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="border-b border-gray-100 px-4 py-2">
          <p className="text-xs text-gray-500">
            {loading ? "Đang tải..." : `${items.length} hợp đồng`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500">
              {searched
                ? "Không tìm thấy hợp đồng phù hợp. Vui lòng thử lại với từ khóa khác."
                : "Đang tải danh sách hợp đồng..."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => {
                const status = toLookupStatus(item.trangThai);
                return (
                  <li key={item.maHD}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.maHD)}
                      className={cn(
                        "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-blue-50/50",
                        selectedId === item.maHD && "border-l-blue-500 bg-blue-50/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {item.maHD}
                        </span>
                        <Badge className={cn("h-5 text-[10px]", statusBadgeClass(status))}>
                          {STATUS_LABEL[status]}
                        </Badge>
                      </div>
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {item.hoTenKhachHang}
                      </p>
                      <p className="font-mono text-xs text-gray-500">{item.soPhong}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex h-full flex-1 flex-col overflow-y-auto bg-gray-50/60 p-5">
        {!selected ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
            {loadingDetail
              ? "Đang tải chi tiết hợp đồng..."
              : "👈 Chọn một hợp đồng từ danh sách bên trái để xem toàn bộ thông tin chi tiết."}
          </div>
        ) : (
          <Card className="mx-auto w-full max-w-5xl border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100 py-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-bold text-gray-900">
                  BẢNG TÓM TẮT THÔNG SỐ HỢP ĐỒNG
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
                <Info label="Mã HD" value={selected.maHD} mono />
                <Info label="Phòng" value={selected.soPhong} mono />
                <Info label="Đại diện" value={selected.hoTenKhachHang} />
                <Info label="SĐT" value={selected.sdt ?? "—"} mono />
                <Info
                  label="Địa chỉ thường trú"
                  value={selected.diaChiThuongTru ? `Địa chỉ: ${selected.diaChiThuongTru}` : "—"}
                />
                <Info
                  label="Trạng thái"
                  value={
                    selectedStatus && (
                      <Badge className={cn("text-[11px]", statusBadgeClass(selectedStatus))}>
                        {STATUS_LABEL[selectedStatus]}
                      </Badge>
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm md:grid-cols-3">
                <Info label="Tiền cọc" value={formatCurrency(selected.tienCoc)} mono />
                <Info
                  label="Thời hạn thuê"
                  value={formatPeriod(selected.ngayBatDau, selected.ngayKetThuc)}
                />
                <Info label="Kỳ thanh toán" value={formatPaymentCycle(selected.kyThanhToan)} />
              </div>

              <div className="rounded-md border border-gray-200">
                <div className="border-b border-gray-100 px-3 py-2 text-sm font-semibold text-gray-800">
                  BẢNG KÊ KHOẢN THU HÀNG THÁNG
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-2 py-2 text-xs">Khoản thu</TableHead>
                      <TableHead className="px-2 py-2 text-xs">Số lượng/Kỳ</TableHead>
                      <TableHead className="px-2 py-2 text-right text-xs">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="px-2 py-2 text-sm text-gray-700">
                        Tiền thuê phòng
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm text-gray-600">1 tháng</TableCell>
                      <TableCell className="px-2 py-2 text-right font-mono text-sm text-gray-900">
                        {formatCurrency(selected.giaThue)}
                      </TableCell>
                    </TableRow>
                    {selected.dichVus.map((service) => (
                      <TableRow key={service.maDV}>
                        <TableCell className="px-2 py-2 text-sm text-gray-700">
                          {service.tenDV}
                        </TableCell>
                        <TableCell className="px-2 py-2 text-sm text-gray-600">1 tháng</TableCell>
                        <TableCell className="px-2 py-2 text-right font-mono text-sm text-gray-900">
                          {formatCurrency(service.donGiaKyKet)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t border-blue-200 bg-blue-50/50">
                      <TableCell
                        colSpan={2}
                        className="px-2 py-2.5 text-sm font-bold text-gray-900"
                      >
                        Tổng thanh toán hàng tháng (Tiền thuê + Dịch vụ):
                      </TableCell>
                      <TableCell className="px-2 py-2.5 text-right font-mono text-sm font-bold text-gray-900">
                        {formatCurrency(monthlyTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-2 py-2 text-xs">STT</TableHead>
                      <TableHead className="px-2 py-2 text-xs">Họ và tên</TableHead>
                      <TableHead className="px-2 py-2 text-xs">SĐT</TableHead>
                      <TableHead className="px-2 py-2 text-right text-xs">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.thanhViens.map((member, index) => {
                      const mapped = mapMember(member);
                      return (
                        <TableRow key={member.maKH}>
                          <TableCell className="p-2 text-xs">{index + 1}</TableCell>
                          <TableCell className="p-2 text-sm">{mapped.fullName}</TableCell>
                          <TableCell className="p-2 font-mono text-sm">{mapped.phone}</TableCell>
                          <TableCell className="p-2 text-right">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="size-7 border border-gray-200"
                              onClick={() => setViewMemberDetails(mapped)}
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <Dialog
                open={!!viewMemberDetails}
                onOpenChange={(open) => !open && setViewMemberDetails(null)}
              >
                <DialogContent className="max-w-md overflow-hidden border-gray-200 p-0">
                  <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <DialogTitle className="text-base font-bold text-gray-800">
                      Chi tiết thành viên
                    </DialogTitle>
                  </DialogHeader>
                  {viewMemberDetails && (
                    <div className="px-6 py-5">
                      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                        <ReadOnlyField label="Họ và tên" value={viewMemberDetails.fullName} />
                        <ReadOnlyField
                          label="Số điện thoại"
                          value={viewMemberDetails.phone || "—"}
                          mono
                        />
                        <ReadOnlyField
                          label="Giới tính"
                          value={viewMemberDetails.gender === "male" ? "Nam" : "Nữ"}
                        />
                        <ReadOnlyField label="Ngày sinh" value={viewMemberDetails.dob} />
                        <ReadOnlyField label="Loại giấy tờ" value={viewMemberDetails.docType} />
                        <ReadOnlyField
                          label="Số giấy tờ"
                          value={viewMemberDetails.docNumber}
                          mono
                        />
                        <ReadOnlyField
                          label="Quốc tịch"
                          value={viewMemberDetails.nationality || "Việt Nam"}
                        />
                        <div />
                        {viewMemberDetails.nationality === "Việt Nam" &&
                          viewMemberDetails.diaChiThuongTru && (
                            <ReadOnlyField
                              label="Địa chỉ thường trú"
                              value={viewMemberDetails.diaChiThuongTru}
                              wide
                            />
                          )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn("space-y-1", wide && "col-span-2")}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={cn(
          "rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700",
          mono && "font-mono",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <div className={cn("mt-0.5 text-sm font-medium text-gray-800", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}
