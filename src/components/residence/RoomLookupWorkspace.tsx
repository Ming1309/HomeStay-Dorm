import { useMemo, useState } from "react";
import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkflowStore, type Room, type BedStatus } from "@/lib/workflow-store";
import { roomAreas, roomTypes } from "@/lib/residence/mock-rooms";

const bedColor: Record<BedStatus, string> = {
  available: "text-emerald-500",
  deposited: "text-amber-500",
  occupied: "text-red-500",
  maintenance: "text-gray-300",
};

const bedLabel: Record<BedStatus, string> = {
  available: "Còn trống",
  deposited: "Đã cọc",
  occupied: "Đang sử dụng",
  maintenance: "Đang bảo trì",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function RoomLookupWorkspace() {
  const { rooms } = useWorkflowStore();

  const [areaFilter, setAreaFilter] = useState("Tầng 1");
  const [typeFilter, setTypeFilter] = useState("2 người");
  const [statusFilter, setStatusFilter] = useState("available");

  const filtered = useMemo(() => {
    let result = rooms;

    if (areaFilter !== "all") {
      result = result.filter((r) => r.area === areaFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((r) => r.type === typeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    return result;
  }, [rooms, areaFilter, typeFilter, statusFilter]);

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col overflow-hidden bg-gray-50/60">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="mb-3 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Label className="w-12 text-xs text-gray-500">Tầng</Label>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomAreas.map((area) => (
                    <SelectItem key={area} value={area} className="text-xs">
                      {area}
                    </SelectItem>
                  ))}
                  <SelectItem value="all" className="text-xs">
                    Tất cả
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="w-20 text-xs text-gray-500">Loại phòng</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {type}
                    </SelectItem>
                  ))}
                  <SelectItem value="all" className="text-xs">
                    Tất cả
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="w-20 text-xs text-gray-500">Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available" className="text-xs">
                    Còn trống
                  </SelectItem>
                  <SelectItem value="partially_available" className="text-xs">
                    Còn giường trống
                  </SelectItem>
                  <SelectItem value="full" className="text-xs">
                    Đã đầy
                  </SelectItem>
                  <SelectItem value="maintenance" className="text-xs">
                    Đang bảo trì
                  </SelectItem>
                  <SelectItem value="all" className="text-xs">
                    Tất cả
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-400">Chú thích:</span>
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-emerald-500" fill="currentColor" /> Còn trống
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-amber-500" fill="currentColor" /> Đã cọc
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-red-500" fill="currentColor" /> Đang sử dụng
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5 text-gray-300" fill="currentColor" /> Đang bảo trì
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center p-10 text-sm text-gray-400">
              Không tìm thấy phòng phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

function RoomCard({ room }: { room: Room }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="border-b border-gray-100 px-4 py-3">
        <span className="font-mono text-sm font-bold text-blue-600">{room.code}</span>
        <p className="mt-0.5 text-xs text-gray-500">
          {room.area} • {room.type}
        </p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-gray-800">
          {formatCurrency(room.basePrice)}
          <span className="text-xs font-normal text-gray-400">/tháng</span>
        </p>
      </div>

      <div className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {room.beds.map((bed) => (
            <Tooltip key={bed.id}>
              <TooltipTrigger asChild>
                <div className="flex size-7 items-center justify-center rounded">
                  <User className={bedColor[bed.status]} fill="currentColor" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {bed.code}: {bedLabel[bed.status]}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {showDetail && (
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-gray-700">Tài sản</p>
          <ul className="space-y-1">
            {room.assets.map((asset) => (
              <li key={asset.id} className="flex justify-between text-xs text-gray-600">
                <span>{asset.name}</span>
                <span className="text-gray-400">x{asset.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className="w-full border-t border-gray-100 px-4 py-2 text-center text-[10px] text-blue-600 hover:bg-blue-50/50"
      >
        {showDetail ? "Thu gọn" : "Xem tài sản"}
      </button>
    </div>
  );
}
