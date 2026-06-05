import { Link, useNavigate } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import {
  Bed,
  Bell,
  CalendarDays,
  ClipboardEdit,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  Settings,
  UserCircle2,
} from "lucide-react";

import { useRoleGuard } from "@/components/app/RoleShell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/lib/workflow-store";

type SaleNavItem = {
  to:
    | "/sale/dashboard"
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
  icon: ComponentType<{ className?: string }>;
};

type SaleNavGroup = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: SaleNavItem[];
};

const SALE_SIDEBAR_STORAGE_KEY = "homestay-sale-sidebar-expanded";
let saleSidebarExpandedState = true;

const saleNavGroups: SaleNavGroup[] = [
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
  const [expanded, setExpanded] = useState(saleSidebarExpandedState);
  const currentItem = saleNavGroups
    .flatMap((group) => group.items.map((item) => ({ ...item, groupTitle: group.title })))
    .find((item) => item.to === currentPath);

  useEffect(() => {
    const saved = localStorage.getItem(SALE_SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      const nextExpanded = saved === "true";
      saleSidebarExpandedState = nextExpanded;
      setExpanded(nextExpanded);
    }
  }, []);

  const updateExpanded = (nextExpanded: boolean) => {
    saleSidebarExpandedState = nextExpanded;
    setExpanded(nextExpanded);
    localStorage.setItem(SALE_SIDEBAR_STORAGE_KEY, String(nextExpanded));
  };

  if (!allowed) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-50 p-4">
      <div className="flex h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <aside
          className={cn(
            "flex h-full shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200",
            expanded ? "w-[244px]" : "w-[56px]",
          )}
        >
          <div
            className={cn(
              "flex h-14 items-center",
              expanded ? "gap-3 px-4" : "justify-center px-2",
            )}
          >
            {expanded ? (
              <>
                <Link to="/sale/dashboard" className="min-w-0 flex-1 text-left">
                  <h1 className="truncate text-lg font-bold tracking-tight text-gray-900">
                    HomeStay Dorm
                  </h1>
                </Link>
                <button
                  type="button"
                  onClick={() => updateExpanded(false)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  aria-label="Thu gọn menu"
                >
                  <PanelLeftClose className="size-5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => updateExpanded(true)}
                className="group flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-gray-50"
                aria-label="Mở rộng menu"
              >
                <img
                  src="/homestay-logo.svg"
                  alt=""
                  className="size-8 object-contain group-hover:hidden"
                />
                <PanelLeftOpen className="hidden size-5 text-gray-500 group-hover:block" />
              </button>
            )}
          </div>

          <nav className={cn("flex-1 overflow-y-auto", expanded ? "px-3 py-2" : "px-2 py-1")}>
            {expanded ? (
              saleNavGroups.map((group) => (
                <div key={group.title} className="mb-4">
                  <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = currentPath === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-700",
                            active && "bg-blue-50 text-blue-700 shadow-[inset_3px_0_0_#2563eb]",
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                <div className="space-y-1">
                  {saleNavGroups.map((group) => {
                    const GroupIcon = group.icon;
                    const active = group.items.some((item) => item.to === currentPath);
                    const [primaryItem] = group.items;
                    const triggerClassName = cn(
                      "flex h-10 w-full items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-700",
                      active && "bg-blue-50 text-blue-700",
                    );

                    if (group.items.length === 1 && primaryItem) {
                      return (
                        <Tooltip key={group.title}>
                          <TooltipTrigger asChild>
                            <Link to={primaryItem.to} className={triggerClassName}>
                              <GroupIcon className="size-4" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="center"
                            sideOffset={10}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-md"
                          >
                            {group.title}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <DropdownMenu key={group.title}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className={triggerClassName}>
                                <GroupIcon className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="center"
                            sideOffset={10}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-md"
                          >
                            {group.title}
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent
                          side="right"
                          align="start"
                          sideOffset={10}
                          className="w-56 rounded-xl border-gray-200 p-2"
                        >
                          <DropdownMenuLabel className="px-2 py-1.5 text-sm text-gray-900">
                            {group.title}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <DropdownMenuItem key={item.to} asChild>
                                <Link
                                  to={item.to}
                                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700"
                                >
                                  <ItemIcon className="size-4" />
                                  {item.label}
                                </Link>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })}
                </div>
              </TooltipProvider>
            )}
          </nav>

          <div className={cn("shrink-0 border-t border-gray-100", expanded ? "h-3" : "h-2")} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="hidden min-w-0 items-center gap-2 text-xs text-gray-500 md:flex">
              <span className="truncate">Sale</span>
              {showWorkspaceNav && currentItem && (
                <>
                  <span>›</span>
                  <span className="truncate">{currentItem.groupTitle}</span>
                  <span>›</span>
                  <span className="truncate font-semibold text-gray-900">{currentItem.label}</span>
                </>
              )}
              {!showWorkspaceNav && (
                <>
                  <span>›</span>
                  <span className="truncate font-semibold text-gray-900">Tổng quan</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="Thông báo"
              >
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  1
                </span>
              </button>
              <span className="inline-flex h-7 items-center rounded-full border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-700">
                Sale
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    aria-label="Tài khoản"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                      MP
                    </div>
                    <span className="hidden font-medium text-gray-900 xl:inline">Minh Phạm</span>
                    <Settings className="hidden size-4 text-gray-400 xl:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-lg border-gray-200 p-2">
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <div className="text-sm font-semibold text-gray-900">Minh Phạm</div>
                    <div className="mt-0.5 text-xs font-normal text-blue-600">Sale</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                    onSelect={() => {
                      setRole(null);
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-hidden bg-gray-50/70">{children}</main>
        </div>
      </div>
    </div>
  );
}
