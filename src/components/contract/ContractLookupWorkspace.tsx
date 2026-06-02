import { useMemo, useState, type ReactNode } from "react";
import { Eye, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type LookupStatus = "pending_sign" | "pending_payment" | "active" | "liquidated" | "cancelled";

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

type LookupContract = {
  id: string;
  customerName: string;
  representativeName: string;
  representativeAddress: string;
  phone: string;
  room: string;
  status: LookupStatus;
  rent: number;
  deposit: number;
  period: string;
  paymentCycle: string;
  services: Array<{ name: string; price: number }>;
  approvedMembers: ApprovedMember[];
};

const contracts: LookupContract[] = [
  {
    id: "HD-PC012",
    customerName: "Nguyễn Minh Anh",
    representativeName: "Nguyễn Minh Anh",
    representativeAddress: "45 Đường Lý Thường Kiệt, P.7, Q.10, TP.HCM",
    phone: "0901 234 567",
    room: "P.101",
    status: "active",
    rent: 4000000,
    deposit: 8000000,
    period: "01/06/2026 - 31/05/2027",
    paymentCycle: "1 tháng / lần",
    services: [
      { name: "Phí gửi xe", price: 150000 },
      { name: "Phí dọn phòng", price: 500000 },
    ],
    approvedMembers: [
      {
        id: "m1",
        fullName: "Nguyễn Minh Anh",
        gender: "male",
        dob: "20/07/2000",
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079200456789",
        phone: "0901234567",
        diaChiThuongTru: "45 Đường Lý Thường Kiệt, P.7, Q.10, TP.HCM",
      },
      {
        id: "m2",
        fullName: "Phạm Khánh Ly",
        gender: "female",
        dob: "12/03/2001",
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079201239999",
        phone: "0912333444",
        diaChiThuongTru: "88 Lê Lợi, P. Bến Thành, Q.1, TP.HCM",
      },
    ],
  },
  {
    id: "HD-PC016",
    customerName: "Lê Gia Bảo",
    representativeName: "Lê Gia Bảo",
    representativeAddress: "102 Nguyễn Trãi, P.2, Q.5, TP.HCM",
    phone: "0938 000 456",
    room: "P.206",
    status: "pending_payment",
    rent: 3800000,
    deposit: 7600000,
    period: "10/06/2026 - 09/06/2027",
    paymentCycle: "1 tháng / lần",
    services: [{ name: "Phí gửi xe", price: 150000 }],
    approvedMembers: [
      {
        id: "m3",
        fullName: "Lê Gia Bảo",
        gender: "male",
        dob: "09/10/1999",
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079199123888",
        phone: "0938000456",
        diaChiThuongTru: "102 Nguyễn Trãi, P.2, Q.5, TP.HCM",
      },
    ],
  },
  {
    id: "HD-PC018",
    customerName: "Trần Hoàng Nam",
    representativeName: "Trần Hoàng Nam",
    representativeAddress: "57 Trần Quốc Thảo, P. Võ Thị Sáu, Q.3, TP.HCM",
    phone: "0938 456 789",
    room: "P.203",
    status: "active",
    rent: 3850000,
    deposit: 7700000,
    period: "03/06/2026 - 02/06/2027",
    paymentCycle: "1 tháng / lần",
    services: [
      { name: "Phí gửi xe", price: 150000 },
      { name: "Phí dọn phòng", price: 450000 },
    ],
    approvedMembers: [
      {
        id: "m4",
        fullName: "Trần Hoàng Nam",
        gender: "male",
        dob: "05/11/1999",
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "038200456789",
        phone: "0938456789",
        diaChiThuongTru: "57 Trần Quốc Thảo, P. Võ Thị Sáu, Q.3, TP.HCM",
      },
      {
        id: "m5",
        fullName: "Lê Gia Hân",
        gender: "female",
        dob: "18/06/2000",
        nationality: "Singapore",
        docType: "Hộ chiếu",
        docNumber: "E12345678",
        phone: "0909001122",
        diaChiThuongTru: null,
      },
    ],
  },
  {
    id: "HD-PC019",
    customerName: "Đặng Quốc Bảo",
    representativeName: "Đặng Quốc Bảo",
    representativeAddress: "12 Bà Hạt, P.9, Q.10, TP.HCM",
    phone: "0911 223 344",
    room: "P.305",
    status: "liquidated",
    rent: 4200000,
    deposit: 8400000,
    period: "01/05/2025 - 30/04/2026",
    paymentCycle: "1 tháng / lần",
    services: [{ name: "Phí dọn phòng", price: 600000 }],
    approvedMembers: [
      {
        id: "m6",
        fullName: "Đặng Quốc Bảo",
        gender: "male",
        dob: "01/01/1998",
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079198222333",
        phone: "0911223344",
        diaChiThuongTru: "12 Bà Hạt, P.9, Q.10, TP.HCM",
      },
    ],
  },
  {
    id: "HD-PC022",
    customerName: "Võ Lan Chi",
    representativeName: "Võ Lan Chi",
    representativeAddress: "85 Nguyễn Đình Chiểu, P.4, Q.3, TP.HCM",
    phone: "0908 889 900",
    room: "P.402",
    status: "cancelled",
    rent: 4500000,
    deposit: 9000000,
    period: "15/06/2026 - 14/06/2027",
    paymentCycle: "1 tháng / lần",
    services: [{ name: "Phí gửi xe", price: 150000 }],
    approvedMembers: [
      {
        id: "m7",
        fullName: "Võ Lan Chi",
        gender: "female",
        dob: "22/09/2001",
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079201111222",
        phone: "0908889900",
        diaChiThuongTru: "85 Nguyễn Đình Chiểu, P.4, Q.3, TP.HCM",
      },
    ],
  },
  {
    id: "HD-PC023",
    customerName: "Ngô Quốc Anh",
    representativeName: "Ngô Quốc Anh",
    representativeAddress: "18 Lê Văn Sỹ, P.13, Q. Phú Nhuận, TP.HCM",
    phone: "0977 111 222",
    room: "P.410",
    status: "pending_sign",
    rent: 3600000,
    deposit: 7200000,
    period: "20/06/2026 - 19/06/2027",
    paymentCycle: "1 tháng / lần",
    services: [{ name: "Phí internet", price: 200000 }],
    approvedMembers: [
      {
        id: "m8",
        fullName: "Ngô Quốc Anh",
        gender: "male",
        dob: "03/04/1997",
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079197000111",
        phone: "0977111222",
        diaChiThuongTru: "18 Lê Văn Sỹ, P.13, Q. Phú Nhuận, TP.HCM",
      },
    ],
  },
];

const statusLabel: Record<LookupStatus, string> = {
  pending_sign: "Chờ ký",
  pending_payment: "Chờ thanh toán",
  active: "Đang hiệu lực",
  liquidated: "Đã thanh lý",
  cancelled: "Đã hủy",
};

const formatCurrency = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`;

function statusBadgeClass(status: LookupStatus) {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "pending_payment" || status === "pending_sign")
    return "bg-amber-100 text-amber-700";
  if (status === "liquidated") return "bg-blue-100 text-blue-700";
  return "bg-rose-100 text-rose-700";
}

const monthlyTotal = (contract: LookupContract) =>
  contract.rent + contract.services.reduce((sum, service) => sum + service.price, 0);

export function ContractLookupWorkspace() {
  const [queryInput, setQueryInput] = useState("");
  const [statusInput, setStatusInput] = useState<string>("all");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMemberDetails, setViewMemberDetails] = useState<ApprovedMember | null>(null);

  const buildSearchText = (contract: LookupContract) => {
    const memberText = contract.approvedMembers
      .map((member) => `${member.fullName} ${member.docNumber} ${member.phone}`)
      .join(" ");

    return `${contract.customerName} ${contract.representativeName} ${contract.phone} ${contract.id} ${contract.room} ${memberText}`.toLowerCase();
  };

  const results = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    return contracts.filter((contract) => {
      const statusMatched = appliedStatus === "all" ? true : contract.status === appliedStatus;
      const textMatched = q.length === 0 ? true : buildSearchText(contract).includes(q);
      return statusMatched && textMatched;
    });
  }, [appliedQuery, appliedStatus]);

  const selected = results.find((item) => item.id === selectedId) ?? null;

  const onSearch = () => {
    const next = contracts.filter((contract) => {
      const statusMatched = statusInput === "all" ? true : contract.status === statusInput;
      const textMatched = queryInput.trim().length === 0 ? true : buildSearchText(contract).includes(queryInput.trim().toLowerCase());
      return statusMatched && textMatched;
    });
    setAppliedQuery(queryInput);
    setAppliedStatus(statusInput);
    if (!next.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  };

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
                  <SelectItem value="active">Đang hiệu lực</SelectItem>
                  <SelectItem value="liquidated">Đã thanh lý</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                className="h-9 w-full bg-blue-600 hover:bg-blue-700"
                onClick={onSearch}
              >
                <Search className="size-4" />
                Tìm kiếm
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="border-b border-gray-100 px-4 py-2">
          <p className="text-xs text-gray-500">{results.length} hợp đồng</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500">
              Không tìm thấy hợp đồng phù hợp. Vui lòng thử lại với từ khóa khác.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-blue-50/50",
                      selectedId === item.id && "border-l-blue-500 bg-blue-50/60",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700">{item.id}</span>
                      <Badge className={cn("h-5 text-[10px]", statusBadgeClass(item.status))}>
                        {statusLabel[item.status]}
                      </Badge>
                    </div>
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {item.customerName}
                    </p>
                    <p className="font-mono text-xs text-gray-500">{item.room}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex h-full flex-1 flex-col overflow-y-auto bg-gray-50/60 p-5">
        {!selected ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
            👈 Chọn một hợp đồng từ danh sách bên trái để xem toàn bộ thông tin chi tiết.
          </div>
        ) : (
          <Card className="mx-auto w-full max-w-5xl border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 py-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-bold text-gray-900">
                  BẢNG TÓM TẮT THÔNG SỐ HỢP ĐỒNG
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-3">
                <Info label="Mã HD" value={selected.id} mono />
                <Info label="Phòng" value={selected.room} mono />
                <Info label="Đại diện" value={selected.representativeName} />
                <Info label="SĐT" value={selected.phone} mono />
                <Info
                  label="Địa chỉ thường trú"
                  value={`Địa chỉ: ${selected.representativeAddress}`}
                />
                <Info
                  label="Trạng thái"
                  value={
                    <Badge className={cn("text-[11px]", statusBadgeClass(selected.status))}>
                      {statusLabel[selected.status]}
                    </Badge>
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-100 bg-gray-50 p-3 text-sm md:grid-cols-3">
                <Info label="Tiền cọc" value={formatCurrency(selected.deposit)} mono />
                <Info label="Thời hạn thuê" value={selected.period} />
                <Info label="Kỳ thanh toán" value={selected.paymentCycle} />
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
                        {formatCurrency(selected.rent)}
                      </TableCell>
                    </TableRow>
                    {selected.services.map((service) => (
                      <TableRow key={service.name}>
                        <TableCell className="px-2 py-2 text-sm text-gray-700">
                          {service.name}
                        </TableCell>
                        <TableCell className="px-2 py-2 text-sm text-gray-600">1 tháng</TableCell>
                        <TableCell className="px-2 py-2 text-right font-mono text-sm text-gray-900">
                          {formatCurrency(service.price)}
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
                        {formatCurrency(monthlyTotal(selected))}
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
                    {selected.approvedMembers.map((member, index) => (
                      <TableRow key={member.id}>
                        <TableCell className="p-2 text-xs">{index + 1}</TableCell>
                        <TableCell className="p-2 text-sm">{member.fullName}</TableCell>
                        <TableCell className="p-2 font-mono text-sm">{member.phone}</TableCell>
                        <TableCell className="p-2 text-right">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 border border-gray-200"
                            onClick={() => setViewMemberDetails(member)}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Dialog
                open={!!viewMemberDetails}
                onOpenChange={(open) => !open && setViewMemberDetails(null)}
              >
                <DialogContent className="max-w-md p-0 overflow-hidden border-gray-200">
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
