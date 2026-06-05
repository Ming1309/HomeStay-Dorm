import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Building2, LogOut, UserCircle2 } from "lucide-react";

import { useRoleGuard } from "@/components/app/RoleShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflow-store";

type SaleNavItem = {
  to:
    | "/sale/lap-phieu-dang-ky"
    | "/sale/ho-so-luu-tru"
    | "/sale/lap-hop-dong"
    | "/sale/tra-cuu-hop-dong"
    | "/sale/tra-cuu-phieu-dang-ky"
    | "/sale/lich-hen"
    | "/sale/tra-cuu-lich-hen"
    | "/sale/tra-cuu-phong"
    | "/sale/lap-phieu-coc"
    | "/sale/ghi-nhan-coc";
  label: string;
};

const saleWorkspaceLinks: SaleNavItem[] = [
  { to: "/sale/lap-phieu-dang-ky", label: "Lập phiếu đăng ký" },
  { to: "/sale/tra-cuu-phieu-dang-ky", label: "Tra cứu phiếu đăng ký" },
  { to: "/sale/ho-so-luu-tru", label: "Nhập hồ sơ lưu trú" },
  { to: "/sale/lap-phieu-coc", label: "Lập phiếu cọc" },
  { to: "/sale/ghi-nhan-coc", label: "Ghi nhận cọc" },
  { to: "/sale/lap-hop-dong", label: "Lập hợp đồng thuê" },
  { to: "/sale/tra-cuu-hop-dong", label: "Tra cứu hợp đồng" },
  { to: "/sale/lich-hen", label: "Tạo lịch hẹn" },
  { to: "/sale/tra-cuu-lich-hen", label: "Tra cứu lịch hẹn" },
  { to: "/sale/tra-cuu-phong", label: "Tra cứu phòng" },
];

export function SaleShell({
  currentPath,
  showWorkspaceNav,
  children,
}: {
  currentPath: string;
  showWorkspaceNav: boolean;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { setRole } = useWorkflowStore();
  const allowed = useRoleGuard("sale");

  if (!allowed) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-50">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/sale/dashboard" })}
          className="flex items-center gap-3"
        >
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
            <Building2 className="size-4 text-blue-600" />
          </div>
          <h1 className="text-sm font-bold text-gray-800">HomeStay Dorm</h1>
        </button>

        <nav className="flex h-full items-end gap-1">
          {showWorkspaceNav &&
            saleWorkspaceLinks.map((item) => {
              const active = currentPath === item.to;
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

        <div className="flex items-center gap-3">
          <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100">
            <Bell className="size-4" />
          </button>
          <div className="flex items-center gap-1.5 text-gray-600">
            <UserCircle2 className="size-5" />
            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium">Sale</span>
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
        </div>
      </header>
      <main className="h-[calc(100vh-64px)] overflow-hidden">{children}</main>
    </div>
  );
}
