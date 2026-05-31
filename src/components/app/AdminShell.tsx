import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Building2, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflow-store";

const adminLinks = [
  { to: "/admin/services", label: "Dịch vụ" },
  { to: "/admin/rooms-beds", label: "Phòng / Giường" },
  { to: "/admin/users", label: "Người dùng" },
  { to: "/admin/deposit-policy", label: "Hoàn cọc" },
  { to: "/admin/assets", label: "Tài sản" },
  { to: "/admin/regulations", label: "Quy định" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { setRole } = useWorkflowStore();
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const hideFunctionTabs = currentPath === "/admin";

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex min-w-0 items-center">
          <Link to="/admin" className="flex items-center gap-3 pr-4">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
              <Building2 className="size-4 text-blue-600" />
            </div>
            <h1 className="whitespace-nowrap text-sm font-bold text-gray-800">HomeStay Dorm</h1>
          </Link>
        </div>

        <div className="flex flex-1 justify-center">
          {!hideFunctionTabs && (
            <nav className="flex h-full items-end gap-1">
              {adminLinks.map((item) => {
                const active =
                  item.to === "/admin" ? currentPath === "/admin" : currentPath === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "inline-flex h-12 items-center border-b-2 border-transparent px-3 text-sm font-medium text-gray-600 transition-colors hover:text-blue-700",
                      active && "border-blue-600 text-blue-700",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

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
      </header>

      <main className="h-[calc(100vh-64px)] overflow-hidden">{children}</main>
    </div>
  );
}
