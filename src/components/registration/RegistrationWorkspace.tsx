import { useState } from "react";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

// Mock data for demo
const MOCK_REGISTRATIONS = [
  {
    id: "1",
    number: "REG-20260531-12345",
    name: "Nguyễn Văn A",
    phone: "0912345678",
    people: 2,
    area: "Khu vực A",
    price: "3-5m",
    status: "pending",
    date: "2026-05-31",
  },
  {
    id: "2",
    number: "REG-20260530-54321",
    name: "Trần Thị B",
    phone: "0987654321",
    people: 3,
    area: "Khu vực B",
    price: "5-7m",
    status: "approved",
    date: "2026-05-30",
  },
  {
    id: "3",
    number: "REG-20260529-98765",
    name: "Phạm Hoàng C",
    phone: "0988888888",
    people: 1,
    area: "Khu vực C",
    price: "1-3m",
    status: "draft",
    date: "2026-05-29",
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ duyệt" },
    approved: { bg: "bg-green-100", text: "text-green-800", label: "Đã duyệt" },
    draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Nháp" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Từ chối" },
  };
  const variant = variants[status] || variants.pending;
  return <Badge className={`${variant.bg} ${variant.text} border-0`}>{variant.label}</Badge>;
};

interface RegistrationWorkspaceProps {
  onRegistrationCreated?: () => void;
}

export function RegistrationWorkspace({ onRegistrationCreated }: RegistrationWorkspaceProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [registrations, setRegistrations] = useState(MOCK_REGISTRATIONS);

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery) ||
      reg.number.includes(searchQuery),
  );

  const selectedRegistration = registrations.find((r) => r.id === selectedId);

  const handleCreateSuccess = () => {
    setIsCreating(false);
    setSelectedId(null);
    onRegistrationCreated?.();
    // Optionally reload list
  };

  if (isCreating) {
    return (
      <div className="h-screen w-full overflow-hidden">
        <RegistrationForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreating(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-gray-50">
      {/* Left Column: Queue/List */}
      <div className="w-full md:w-[350px] border-r bg-white flex flex-col">
        {/* Header */}
        <div className="border-b p-4 sticky top-0 bg-white">
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Phiếu đăng ký mới
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedId(reg.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedId === reg.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{reg.name}</p>
                      <p className="text-xs text-gray-500">{reg.number}</p>
                      <p className="text-xs text-gray-400 mt-1">{reg.phone}</p>
                    </div>
                    <div className="flex-shrink-0">{getStatusBadge(reg.status)}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">Không tìm thấy kết quả</div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3 text-xs text-gray-500 sticky bottom-0 bg-white">
          Tổng cộng: {filteredRegistrations.length} phiếu
        </div>
      </div>

      {/* Right Column: Workspace/Detail */}
      <div className="flex-1 flex flex-col hidden md:flex overflow-hidden">
        {/* Header */}
        {selectedRegistration ? (
          <div className="border-b bg-white px-6 py-4 sticky top-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedRegistration.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRegistration.number} • {selectedRegistration.date}
                </p>
              </div>
              {getStatusBadge(selectedRegistration.status)}
            </div>
          </div>
        ) : (
          <div className="border-b bg-white px-6 py-4 sticky top-0">
            <p className="text-gray-500">👈 Chọn một phiếu từ danh sách để bắt đầu</p>
          </div>
        )}

        {/* Body */}
        <ScrollArea className="flex-1">
          {selectedRegistration ? (
            <div className="px-6 py-6 space-y-6">
              {/* Thông tin cá nhân */}
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-4 text-gray-900">Thông tin cá nhân</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Tên khách hàng</p>
                    <p className="text-gray-900 font-medium">{selectedRegistration.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Số điện thoại</p>
                    <p className="text-gray-900 font-medium">{selectedRegistration.phone}</p>
                  </div>
                </div>
              </Card>

              {/* Thông tin lưu trú */}
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-4 text-gray-900">Thông tin lưu trú</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Số người ở</p>
                    <p className="text-gray-900 font-medium">{selectedRegistration.people} người</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Khu vực</p>
                    <p className="text-gray-900 font-medium">{selectedRegistration.area}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Mức giá</p>
                    <p className="text-gray-900 font-medium">{selectedRegistration.price}</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p className="text-lg">Chưa chọn phiếu nào</p>
                <p className="text-sm mt-2">Chọn phiếu từ danh sách bên trái hoặc tạo mới</p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {selectedRegistration && (
          <div className="border-t bg-white px-6 py-4 flex gap-2 sticky bottom-0">
            <Button variant="outline" size="sm">
              Chỉnh sửa
            </Button>
            <Button variant="outline" size="sm">
              In phiếu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistrationWorkspace;
