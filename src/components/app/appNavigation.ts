import type { ComponentType } from "react";
import {
  Bed,
  CalendarDays,
  Calculator,
  ClipboardCheck,
  ClipboardEdit,
  CreditCard,
  DoorOpen,
  FileText,
  FileWarning,
  Landmark,
  LayoutDashboard,
  Package,
  Receipt,
  ScrollText,
  Search,
  Settings2,
  ShieldCheck,
  Undo2,
  UserCircle2,
  Users,
} from "lucide-react";

import type { UserRole } from "@/lib/workflow-store";

export type AppNavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  aliases?: string[];
};

export type AppNavGroup = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: AppNavItem[];
};

export const roleMeta: Record<
  UserRole,
  {
    label: string;
    badgeLabel: string;
    home: string;
  }
> = {
  sale: {
    label: "Sale",
    badgeLabel: "Sale",
    home: "/sale/dashboard",
  },
  manager: {
    label: "Quản lý",
    badgeLabel: "Quản lý",
    home: "/manager",
  },
  accountant: {
    label: "Kế toán",
    badgeLabel: "Kế toán",
    home: "/accountant",
  },
  admin: {
    label: "Admin",
    badgeLabel: "Admin",
    home: "/admin",
  },
};

export const navGroupsByRole: Record<UserRole, AppNavGroup[]> = {
  sale: [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      items: [{ to: "/sale/dashboard", label: "Tổng quan", icon: LayoutDashboard }],
    },
    {
      title: "Đăng ký dịch vụ",
      icon: ClipboardEdit,
      items: [{ to: "/sale/lap-phieu-dang-ky", label: "Lập phiếu đăng ký", icon: ClipboardEdit }],
    },
    {
      title: "Đặt cọc",
      icon: Receipt,
      items: [
        { to: "/sale/lap-phieu-coc", label: "Lập phiếu cọc", icon: Receipt },
        { to: "/sale/ghi-nhan-coc", label: "Ghi nhận cọc", icon: Receipt },
      ],
    },
    {
      title: "Hợp đồng",
      icon: FileText,
      items: [{ to: "/sale/lap-hop-dong", label: "Lập hợp đồng thuê", icon: FileText }],
    },
    {
      title: "Lịch hẹn",
      icon: CalendarDays,
      items: [{ to: "/sale/lich-hen", label: "Tạo lịch hẹn", icon: CalendarDays }],
    },
    {
      title: "Hồ sơ lưu trú",
      icon: UserCircle2,
      items: [{ to: "/sale/ho-so-luu-tru", label: "Hồ sơ lưu trú", icon: UserCircle2 }],
    },
    {
      title: "Tra cứu",
      icon: Search,
      items: [
        { to: "/sale/tra-cuu-phieu-dang-ky", label: "Tra cứu đăng ký", icon: Search },
        { to: "/sale/tra-cuu-hop-dong", label: "Tra cứu hợp đồng", icon: Search },
        { to: "/sale/tra-cuu-lich-hen", label: "Tra cứu lịch hẹn", icon: Search },
        { to: "/sale/tra-cuu-phong", label: "Tra cứu phòng / giường", icon: Bed },
      ],
    },
  ],
  manager: [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      items: [{ to: "/manager", label: "Tổng quan", icon: LayoutDashboard }],
    },
    {
      title: "Xét duyệt",
      icon: ClipboardCheck,
      items: [
        { to: "/manager/approval", label: "Xét duyệt hồ sơ", icon: ClipboardCheck },
        { to: "/manager/confirm-deposit", label: "Xác nhận tiền cọc", icon: ShieldCheck },
      ],
    },
    {
      title: "Bàn giao / trả phòng",
      icon: DoorOpen,
      items: [
        { to: "/manager/handover", label: "Bàn giao phòng", icon: DoorOpen },
        { to: "/manager/thu-hoi-tai-san", label: "Thu hồi tài sản", icon: ClipboardCheck },
        { to: "/manager/termination", label: "Thanh lý hợp đồng", icon: ScrollText },
      ],
    },
    {
      title: "Tra cứu",
      icon: Search,
      items: [
        {
          to: "/manager/contracts",
          label: "Tra cứu hợp đồng",
          icon: Search,
          aliases: ["/manager/tra-cuu-hop-dong"],
        },
        { to: "/manager/tra-cuu-phong", label: "Tra cứu phòng / giường", icon: Bed },
      ],
    },
  ],
  accountant: [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      items: [{ to: "/accountant", label: "Tổng quan", icon: LayoutDashboard }],
    },
    {
      title: "Thu tiền",
      icon: CreditCard,
      items: [
        { to: "/accountant/payments", label: "Thu tiền hợp đồng", icon: CreditCard },
        { to: "/accountant/receipts", label: "Lập phiếu thu", icon: Receipt },
      ],
    },
    {
      title: "Cọc / đối soát",
      icon: Calculator,
      items: [
        { to: "/accountant/deposit-calc", label: "Tính tiền cọc", icon: Calculator },
        { to: "/accountant/doi-soat", label: "Lập phiếu đối soát", icon: ClipboardCheck },
        { to: "/accountant/refunds", label: "Lập phiếu hoàn cọc", icon: Undo2 },
      ],
    },
    {
      title: "Trả phòng",
      icon: FileWarning,
      items: [
        {
          to: "/accountant/thanh-toan-tra-phong",
          label: "Thanh toán trả phòng",
          icon: CreditCard,
        },
        { to: "/accountant/compensation", label: "Hóa đơn bồi thường", icon: FileWarning },
      ],
    },
    {
      title: "Tra cứu",
      icon: Search,
      items: [
        { to: "/accountant/tra-cuu-hop-dong", label: "Tra cứu hợp đồng", icon: Search },
        { to: "/accountant/tra-cuu-phong", label: "Tra cứu phòng / giường", icon: Bed },
      ],
    },
  ],
  admin: [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      items: [{ to: "/admin", label: "Tổng quan", icon: LayoutDashboard }],
    },
    {
      title: "Danh mục",
      icon: Settings2,
      items: [
        { to: "/admin/services", label: "Dịch vụ", icon: Settings2 },
        { to: "/admin/rooms-beds", label: "Phòng / Giường", icon: Bed },
        { to: "/admin/assets", label: "Tài sản", icon: Package },
        { to: "/admin/regulations", label: "Quy định", icon: ScrollText },
      ],
    },
    {
      title: "Người dùng",
      icon: Users,
      items: [{ to: "/admin/users", label: "Người dùng", icon: Users }],
    },
    {
      title: "Chính sách",
      icon: Landmark,
      items: [{ to: "/admin/deposit-policy", label: "Hoàn cọc", icon: Landmark }],
    },
  ],
};

export function findNavItem(role: UserRole, currentPath: string) {
  for (const group of navGroupsByRole[role]) {
    for (const item of group.items) {
      const paths = [item.to, ...(item.aliases ?? [])];
      if (paths.includes(currentPath)) {
        return { ...item, groupTitle: group.title };
      }
    }
  }
  return null;
}
