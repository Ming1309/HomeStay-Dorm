import { useState } from "react";
import { Bell, Building2, ClipboardCheck, UserCircle2 } from "lucide-react";

import {
  mockApprovalProfiles,
  type ApprovalProfile,
} from "@/lib/residence/mock-approvals";
import { ApprovalQueue } from "./ApprovalQueue";
import { ApprovalPanel } from "./ApprovalPanel";

export function ProfileApprovalPage() {
  const [profiles, setProfiles] = useState<ApprovalProfile[]>(
    mockApprovalProfiles,
  );
  const [selected, setSelected] = useState<ApprovalProfile | null>(null);

  const handleApprove = (
    profile: ApprovalProfile,
    _rejectedIds: Set<string>,
  ) => {
    // Remove approved profile from the pending queue
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    setSelected(null);
  };

  const handleRejectAll = (profile: ApprovalProfile) => {
    // Remove rejected profile from the pending queue
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    setSelected(null);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">
            Quản lý lưu trú
          </span>
          <span className="text-gray-300">/</span>
          <ClipboardCheck className="size-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-600">
            Xét duyệt hồ sơ nhận phòng
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Thông báo"
          >
            <Bell className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <UserCircle2 className="size-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Manager
            </span>
          </div>
        </div>
      </header>

      {/* ── Split view ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <ApprovalQueue
          profiles={profiles}
          selectedId={selected?.id ?? null}
          onSelect={(p) => setSelected(p)}
        />
        <ApprovalPanel
          profile={selected}
          onApprove={handleApprove}
          onRejectAll={handleRejectAll}
        />
      </div>
    </div>
  );
}
