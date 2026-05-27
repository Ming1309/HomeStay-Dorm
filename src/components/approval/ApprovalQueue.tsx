import { Clock, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ApprovalProfile } from "@/lib/residence/mock-approvals";
import { useState } from "react";

type Props = {
  profiles: ApprovalProfile[];
  selectedId: string | null;
  onSelect: (p: ApprovalProfile) => void;
};

function formatRelativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return "Vừa xong";
  if (diff < 60) return `${diff} phút trước`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export function ApprovalQueue({ profiles, selectedId, onSelect }: Props) {
  const [q, setQ] = useState("");

  const filtered = profiles.filter((p) => {
    const s = q.toLowerCase().trim();
    if (!s) return true;
    return (
      p.code.toLowerCase().includes(s) ||
      p.representative.fullName.toLowerCase().includes(s) ||
      p.room.toLowerCase().includes(s)
    );
  });

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Panel header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold tracking-tight text-gray-800">
          Hồ sơ chờ duyệt
        </h2>
        <p className="mt-0.5 text-xs text-gray-400">
          {filtered.length} hồ sơ hôm nay
        </p>
      </div>

      {/* Search bar */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm mã, tên, phòng..."
            className="h-8 border-gray-200 pl-8 text-xs focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            Không tìm thấy hồ sơ nào.
          </div>
        )}
        <ul className="divide-y divide-gray-100">
          {filtered.map((p) => {
            const active = p.id === selectedId;
            const memberCount = p.members.length;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className={cn(
                    "group relative flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-amber-50/60",
                    active &&
                      "border-l-amber-500 bg-amber-50 hover:bg-amber-50",
                  )}
                >
                  {/* Row 1: code + badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      #{p.code}
                    </span>
                    <Badge className="h-5 border-transparent bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                      Chờ duyệt
                    </Badge>
                  </div>

                  {/* Row 2: rep name */}
                  <div className="flex items-center gap-1.5">
                    <User className="size-3 shrink-0 text-gray-400" />
                    <span className="truncate text-sm font-semibold text-gray-800">
                      {p.representative.fullName}
                    </span>
                  </div>

                  {/* Row 3: room + time */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-600">
                      {p.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatRelativeTime(p.submittedAt)}
                    </span>
                  </div>

                  {/* Row 4: submitted by + member count */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Bởi: {p.submittedBy}</span>
                    <span>
                      {memberCount > 0
                        ? `${memberCount} thành viên`
                        : "Chỉ đại diện"}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
