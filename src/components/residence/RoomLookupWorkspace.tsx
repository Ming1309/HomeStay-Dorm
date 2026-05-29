import { useMemo, useState } from "react";
import { Search, Bed, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { useWorkflowStore, type Room, type BedStatus, type RoomStatus } from "@/lib/workflow-store";
import { roomAreas, roomTypes } from "@/lib/residence/mock-rooms";

function roomStatusLabel(room: Room): string {
  if (room.status === "full") return "Đã đầy";
  if (room.status === "maintenance") return "Đang bảo trì";
  const available = room.beds.filter((b) => b.status === "available").length;
  if (available === room.beds.length) return "Trống nguyên phòng";
  return `${available} giường trống`;
}

const statusBadgeClass: Record<RoomStatus, string> = {
  available: "bg-emerald-100 text-emerald-700",
  partially_available: "bg-amber-100 text-amber-700",
  full: "bg-gray-200 text-gray-600",
  maintenance: "bg-red-100 text-red-700",
};

const bedStatusLabels: Record<BedStatus, string> = {
  available: "Còn trống",
  deposited: "Đã cọc",
  occupied: "Đang sử dụng",
  maintenance: "Đang bảo trì",
};

const bedStatusBadgeClass: Record<BedStatus, string> = {
  available: "bg-emerald-100 text-emerald-700",
  deposited: "bg-amber-100 text-amber-700",
  occupied: "bg-blue-100 text-blue-700",
  maintenance: "bg-red-100 text-red-700",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function RoomLookupWorkspace() {
  const { rooms } = useWorkflowStore();

  const [areaFilter, setAreaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appliedArea, setAppliedArea] = useState("all");
  const [appliedType, setAppliedType] = useState("all");
  const [appliedStatus, setAppliedStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    setAppliedArea(areaFilter);
    setAppliedType(typeFilter);
    setAppliedStatus(statusFilter);
  };

  const filtered = useMemo(() => {
    let result = rooms;

    if (appliedArea !== "all") {
      result = result.filter((r) => r.area === appliedArea);
    }
    if (appliedType !== "all") {
      result = result.filter((r) => r.type === appliedType);
    }
    if (appliedStatus !== "all") {
      result = result.filter((r) => r.status === appliedStatus);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q),
      );
    }

    return result;
  }, [rooms, appliedArea, appliedType, appliedStatus, query]);

  const selected = filtered.find((r) => r.id === selectedId) ?? null;

  const roomStatusCount = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((r) => r.status === "available").length;
    return { total, available };
  }, [rooms]);

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-800">Tra cứu phòng / giường</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {roomStatusCount.available}/{roomStatusCount.total} phòng còn trống
          </p>
        </div>

        <div className="sticky top-0 z-10 space-y-2 border-b border-gray-100 bg-white px-3 py-3">
          <div>
            <Label className="text-xs text-gray-500">Khu vực</Label>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Tất cả khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Tất cả khu vực</SelectItem>
                {roomAreas.map((area) => (
                  <SelectItem key={area} value={area} className="text-xs">{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Loại phòng</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Tất cả loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Tất cả loại phòng</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Trạng thái</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Tất cả trạng thái</SelectItem>
                <SelectItem value="available" className="text-xs">Còn trống</SelectItem>
                <SelectItem value="partially_available" className="text-xs">Còn giường trống</SelectItem>
                <SelectItem value="full" className="text-xs">Đã đầy</SelectItem>
                <SelectItem value="maintenance" className="text-xs">Đang bảo trì</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </div>

        <div className="border-b border-gray-100 bg-white px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId(null);
              }}
              placeholder="Tìm phòng..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-center text-sm text-gray-400">
              Không tìm thấy phòng/giường phù hợp với bộ lọc. Vui lòng thử lại với tiêu chí khác.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((room) => (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(room.id)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-blue-50/60",
                      selectedId === room.id && "border-l-blue-500 bg-blue-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {room.code}
                      </span>
                      <Badge className={cn("h-5 text-[10px]", statusBadgeClass[room.status])}>
                        {roomStatusLabel(room)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{room.area}</span>
                      <span>•</span>
                      <span>{room.type}</span>
                      <span>•</span>
                      <span>{formatCurrency(room.basePrice)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {!selected ? (
        <section className="flex flex-1 items-center justify-center bg-gray-50/60">
          <p className="text-sm text-gray-500">
            Chọn phòng từ danh sách để xem chi tiết.
          </p>
        </section>
      ) : (
        <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-sm font-bold text-gray-900">{selected.code}</h1>
              <Badge className={cn("h-5 text-[10px]", statusBadgeClass[selected.status])}>
                {roomStatusLabel(selected)}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {selected.area} • {selected.type} • {formatCurrency(selected.basePrice)}/tháng
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Bed className="size-3.5" />
                Danh sách giường ({selected.beds.length})
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {selected.beds.map((bed) => (
                  <div
                    key={bed.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2",
                      bed.status === "available" && "border-emerald-200 bg-emerald-50/50",
                      bed.status === "deposited" && "border-amber-200 bg-amber-50/50",
                      bed.status === "occupied" && "border-blue-200 bg-blue-50/50",
                      bed.status === "maintenance" && "border-red-200 bg-red-50/50",
                    )}
                  >
                    <span className="font-mono text-xs text-gray-800">{bed.code}</span>
                    <Badge className={cn("h-5 text-[10px]", bedStatusBadgeClass[bed.status])}>
                      {bedStatusLabels[bed.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Package className="size-3.5" />
                Tài sản trang bị ({selected.assets.length})
              </h3>
              <div className="rounded-lg border border-gray-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-3 py-2 text-xs">Tên tài sản</TableHead>
                      <TableHead className="px-3 py-2 text-xs">Số lượng</TableHead>
                      <TableHead className="px-3 py-2 text-xs">Tình trạng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="px-3 py-2 text-sm text-gray-800">
                          {asset.name}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-sm text-gray-600">
                          {asset.quantity}
                        </TableCell>
                        <TableCell className="px-3 py-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 text-[10px]",
                              asset.condition === "Tốt" || asset.condition === "Mới"
                                ? "border-emerald-200 text-emerald-700"
                                : "border-amber-200 text-amber-700",
                            )}
                          >
                            {asset.condition}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
