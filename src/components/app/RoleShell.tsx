import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Bed,
  Bell,
  Building2,
  Calculator,
  ClipboardCheck,
  CreditCard,
  DoorOpen,
  FileText,
  FileWarning,
  Gauge,
  LogOut,
  Receipt,
  ScrollText,
  Search,
  ShieldCheck,
  Undo2,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkflowStore, type UserRole } from "@/lib/workflow-store";

type RoleLink = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const roleLinks: Record<"accountant" | "manager", RoleLink[]> = {
  accountant: [
    { to: "/accountant", label: "Bảng điều khiển", icon: Gauge },
    { to: "/accountant/payments", label: "Thu tiền hợp đồng", icon: CreditCard },
    { to: "/accountant/deposit-calc", label: "Tính tiền cọc", icon: Calculator },
    { to: "/accountant/doi-soat", label: "Phiếu đối soát", icon: ClipboardCheck },
    { to: "/accountant/thanh-toan-tra-phong", label: "Thanh toán trả phòng", icon: CreditCard },
    { to: "/accountant/transactions", label: "Lịch sử giao dịch", icon: FileText },
    { to: "/accountant/compensation", label: "Hóa đơn bồi thường", icon: FileWarning },
    { to: "/accountant/receipts", label: "Lập phiếu thu", icon: Receipt },
    { to: "/accountant/refunds", label: "Lập phiếu hoàn cọc", icon: Undo2 },
    { to: "/accountant/tra-cuu-hop-dong", label: "Tra cứu hợp đồng", icon: Search },
    { to: "/accountant/tra-cuu-phong", label: "Tra cứu phòng", icon: Bed },
  ],
  manager: [
    { to: "/manager", label: "Bảng điều khiển", icon: Gauge },
    { to: "/manager/approval", label: "Xét duyệt hồ sơ", icon: ClipboardCheck },
    { to: "/manager/handover", label: "Bàn giao phòng", icon: DoorOpen },
    { to: "/manager/thu-hoi-tai-san", label: "Thu hồi tài sản", icon: ClipboardCheck },
    { to: "/manager/confirm-deposit", label: "Xác nhận tiền cọc", icon: ShieldCheck },
    { to: "/manager/termination", label: "Thanh lý hợp đồng", icon: ScrollText },
    { to: "/manager/contracts", label: "Tra cứu hợp đồng", icon: Search },
    { to: "/manager/tra-cuu-phong", label: "Tra cứu phòng", icon: Bed },
  ],
};

function homeForRole(role: UserRole) {
  if (role === "accountant") return "/accountant";
  if (role === "manager") return "/manager";
  if (role === "sale") return "/sale/dashboard";
  return "/admin";
}

export function useRoleGuard(expectedRole: UserRole) {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!role) {
      navigate({ to: "/" });
      return;
    }
    if (role !== expectedRole) {
      navigate({ to: homeForRole(role) });
    }
  }, [role, expectedRole, navigate, isHydrated]);

  return isHydrated && role === expectedRole;
}

export function RoleShell({
  role,
  currentPath,
  children,
}: {
  role: "accountant" | "manager";
  currentPath: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { setRole } = useWorkflowStore();
  const hideTopNavOnDashboard =
    (role === "manager" && (currentPath === "/manager" || currentPath === "/manager/dashboard")) ||
    (role === "accountant" &&
      (currentPath === "/accountant" || currentPath === "/accountant/dashboard"));

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
        <button
          type="button"
          onClick={() => navigate({ to: role === "manager" ? "/manager" : "/accountant" })}
          className="flex items-center gap-3"
        >
          <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
            <Building2 className="size-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-gray-800">HomeStay Dorm</h1>
          </div>
        </button>

        {hideTopNavOnDashboard ? (
          <div className="h-full" />
        ) : (
          <nav className="flex h-full items-end gap-1">
            {roleLinks[role].map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-12 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-gray-600 transition-colors hover:text-blue-700",
                    active && "border-blue-600 text-blue-700",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button type="button" className="rounded p-1 text-gray-500 hover:bg-gray-100">
            <Bell className="size-4" />
          </button>
          <div className="flex items-center gap-1.5 text-gray-600">
            <UserCircle2 className="size-5" />
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
