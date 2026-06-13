import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { toast } from "sonner";

type RegistrationStatus = "draft" | "pending" | "approved" | "rejected";

type RegistrationLookupItem = {
  id: string;
  registrationNumber: string;
  customerName: string;
  phone: string;
  email: string;
  idType: "CCCD" | "Hộ chiếu" | "Giấy tờ khác";
  idNumber: string;
  desiredArea: string;
  priceRange: string;
  moveInDate: string;
  rentalDuration: string;
  roomType: string;
  people: number;
  submittedAt: string;
  status: RegistrationStatus;
  notes: string;
};

const MOCK_REGISTRATIONS: RegistrationLookupItem[] = [
  {
    id: "1",
    registrationNumber: "REG-1",
    customerName: "Nguyễn Văn A",
    phone: "0912345678",
    email: "nguyenvana@example.com",
    idType: "CCCD",
    idNumber: "079200123456",
    desiredArea: "Khu vực A",
    priceRange: "3-5m",
    moveInDate: "15/06/2026",
    rentalDuration: "6 tháng",
    roomType: "Thuê nguyên phòng",
    people: 2,
    submittedAt: "01/06/2026",
    status: "pending",
    notes: "Ưu tiên phòng có ban công, có chỗ để xe máy.",
  },
  {
    id: "2",
    registrationNumber: "REG-2",
    customerName: "Trần Thị B",
    phone: "0987654321",
    email: "tranthib@gmail.com",
    idType: "CCCD",
    idNumber: "079201234567",
    desiredArea: "Khu vực B",
    priceRange: "5-7m",
    moveInDate: "05/07/2026",
    rentalDuration: "12 tháng",
    roomType: "Thuê giường ở ghép",
    people: 1,
    submittedAt: "29/05/2026",
    status: "approved",
    notes: "Muốn ở gần khu vực bếp chung và phòng tập gym.",
  },
  {
    id: "3",
    registrationNumber: "REG-3",
    customerName: "Phạm Hoàng C",
    phone: "0968887777",
    email: "phamhoangc@company.vn",
    idType: "Hộ chiếu",
    idNumber: "E123456789",
    desiredArea: "Khu vực C",
    priceRange: "1-3m",
    moveInDate: "20/06/2026",
    rentalDuration: "3 tháng",
    roomType: "Thuê nguyên phòng",
    people: 3,
    submittedAt: "28/05/2026",
    status: "draft",
    notes: "Khách hàng cần có hồ sơ tạm trú để được hỗ trợ thủ tục.",
  },
];

const statusStyles: Record<RegistrationStatus, { label: string; className: string }> = {
  draft: { label: "Nháp", className: "bg-gray-100 text-gray-800" },
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-700" },
};

const getStatusBadge = (status: RegistrationStatus) => {
  const config = statusStyles[status];
  return <Badge className={`${config.className} border-0 text-[11px]`}>{config.label}</Badge>;
};

export function RegistrationLookupWorkspace() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchKey, setSearchKey] = useState("");

  const results = useMemo(() => {
    if (!hasSearched) return [];

    const q = query.trim().toLowerCase();
    if (!q) return [];

    return MOCK_REGISTRATIONS.filter((item) => {
      const matchPhone = item.phone.includes(q) || item.phone.includes(query.trim());
      const matchId = item.idNumber.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchNumber = item.registrationNumber.toLowerCase().includes(q);
      const matchName = item.customerName.toLowerCase().includes(q);
      return matchPhone || matchId || matchEmail || matchNumber || matchName;
    });
  }, [hasSearched, query]);

  const selectedRegistration = selectedId
    ? (results.find((item) => item.id === selectedId) ?? null)
    : null;

  useEffect(() => {
    if (selectedId && !results.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [results, selectedId]);

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Vui lòng nhập ít nhất một tiêu chí tìm kiếm");
      return;
    }

    const q = query.trim().toLowerCase();
    const nextResults = MOCK_REGISTRATIONS.filter((item) => {
      const matchPhone = item.phone.includes(q) || item.phone.includes(query.trim());
      const matchId = item.idNumber.toLowerCase().includes(q);
      const matchEmail = item.email.toLowerCase().includes(q);
      const matchNumber = item.registrationNumber.toLowerCase().includes(q);
      const matchName = item.customerName.toLowerCase().includes(q);
      return matchPhone || matchId || matchEmail || matchNumber || matchName;
    });

    setSearchKey(query.trim());
    setHasSearched(true);
    if (selectedId && !nextResults.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-sm text-gray-800">
      <aside className="flex h-full w-full max-w-[360px] flex-col border-r border-gray-200 bg-white">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Tra cứu phiếu đăng ký</h1>
            <p className="mt-1 text-xs text-gray-500">
              Tìm theo SĐT, CCCD hoặc Email để truy xuất dữ liệu khách hàng nhanh.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                Tìm kiếm (SĐT / CCCD / Email / Tên / Mã)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nhập SĐT, CCCD, Email, tên hoặc mã"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-10 pr-10 h-10 text-sm"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              className="flex h-10 w-full items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSearch}
            >
              <Search className="size-4" />
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-3">
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 bg-slate-50 p-3 text-xs text-gray-600">
                {hasSearched ? (
                  <>
                    Kết quả tìm kiếm cho:{" "}
                    <span className="font-medium text-gray-900">{searchKey}</span>
                  </>
                ) : (
                  "Nhập ít nhất một tiêu chí và nhấn Tìm kiếm để xem kết quả."
                )}
              </div>

              {hasSearched && results.length === 0 ? (
                <div className="rounded-lg border border-dashed border-red-300 bg-red-50 p-4 text-sm text-red-700">
                  Không tìm thấy Phiếu đăng ký phù hợp.
                </div>
              ) : null}

              {results.length > 0 && (
                <div className="space-y-2">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                        selectedId === item.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.customerName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.registrationNumber} • {item.phone}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 truncate">{item.email}</p>
                        </div>
                        <div className="flex-shrink-0">{getStatusBadge(item.status)}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        <span className="rounded bg-slate-100 px-2 py-1">{item.idType}</span>
                        <span className="rounded bg-slate-100 px-2 py-1">{item.idNumber}</span>
                        <span className="rounded bg-slate-100 px-2 py-1">{item.desiredArea}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500">
          {hasSearched ? `${results.length} phiếu đăng ký` : "Chưa tìm kiếm"}
        </div>
      </aside>

      <section className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          {selectedRegistration ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Thông tin phiếu</p>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRegistration.customerName}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRegistration.registrationNumber} • {selectedRegistration.submittedAt}
                </p>
              </div>
              {getStatusBadge(selectedRegistration.status)}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              👈 Chọn một phiếu đăng ký bên trái để xem chi tiết.
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {selectedRegistration ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-gray-900">
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Tên</p>
                      <p className="font-medium text-gray-900">
                        {selectedRegistration.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="font-medium text-gray-900">{selectedRegistration.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedRegistration.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Giấy tờ</p>
                      <p className="font-medium text-gray-900">
                        {selectedRegistration.idType} • {selectedRegistration.idNumber}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-gray-900">
                      Yêu cầu lưu trú
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Khu vực mong muốn</p>
                      <p className="font-medium text-gray-900">
                        {selectedRegistration.desiredArea}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mức giá</p>
                      <p className="font-medium text-gray-900">{selectedRegistration.priceRange}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày dự kiến vào ở</p>
                      <p className="font-medium text-gray-900">{selectedRegistration.moveInDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Thời hạn thuê</p>
                      <p className="font-medium text-gray-900">
                        {selectedRegistration.rentalDuration}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-gray-900">
                      Chi tiết thêm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Loại phòng</p>
                      <p className="font-medium text-gray-900">{selectedRegistration.roomType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Số người ở</p>
                      <p className="font-medium text-gray-900">
                        {selectedRegistration.people} người
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ngày nộp</p>
                      <p className="font-medium text-gray-900">
                        {selectedRegistration.submittedAt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Ghi chú đăng ký
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-gray-700">
                  {selectedRegistration.notes}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
              Chưa có phiếu nào được chọn. Vui lòng tìm và chọn một phiếu bên trái.
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">
            <span className="rounded border bg-slate-100 px-1.5 py-0.5 font-semibold">Ctrl</span>
            <span className="mx-1">+</span>
            <span className="rounded border bg-slate-100 px-1.5 py-0.5 font-semibold">F</span>: Tìm
            kiếm nhanh
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <Button variant="outline" size="sm">
              In phiếu
            </Button>
            <Button variant="outline" size="sm">
              Gọi khách
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
