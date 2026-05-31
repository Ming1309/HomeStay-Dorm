import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/lib/workflow-store";

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { setRole } = useWorkflowStore();

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
              <Building2 className="size-4 text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gray-800">Quản lý lưu trú</h1>
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                <ShieldCheck className="size-3.5" />
                Phân hệ: Admin
              </span>
            </div>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-gray-600"
            onClick={() => {
              setRole(null);
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-3.5" />
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="h-[calc(100vh-61px)] overflow-hidden">{children}</main>
    </div>
  );
}
