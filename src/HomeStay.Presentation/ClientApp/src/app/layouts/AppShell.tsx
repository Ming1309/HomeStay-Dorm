import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { toast } from "sonner";

import {
  findNavItem,
  navGroupsByRole,
  roleMeta,
  type AppNavGroup,
} from "@/app/navigation/appNavigation";
import {
  formatRelativeTime,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotificationDto,
  type AppNotificationTone,
} from "@/features/notifications/services/notification-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { useWorkflowStore, type UserRole } from "@/app/providers/workflow-store";
import { useAuth } from "@/features/auth/model/auth-store";

const SIDEBAR_STORAGE_KEY = "homestay-sidebar-expanded";
let appSidebarExpandedState = true;

export function AppShell({
  role,
  currentPath,
  showWorkspaceNav = true,
  children,
}: {
  role: UserRole;
  currentPath: string;
  showWorkspaceNav?: boolean;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setRole } = useWorkflowStore();
  const [expanded, setExpanded] = useState(appSidebarExpandedState);
  const meta = roleMeta[role];
  const navGroups = navGroupsByRole[role];
  const currentItem = findNavItem(role, currentPath);
  const [notifications, setNotifications] = useState<AppNotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const employeeName = user?.hoTen || user?.tenDangNhap || "Người dùng";
  const employeeInitials = getInitials(employeeName);

  const refreshNotifications = useCallback(async (signal?: AbortSignal) => {
    setLoadingNotifications(true);
    try {
      const [openPage, unreadPage] = await Promise.all([
        loadNotifications({ filter: "open", limit: 20, signal }),
        loadNotifications({ filter: "unread", limit: 20, signal }),
      ]);
      const seen = new Set<string>();
      const items = [...openPage.items, ...unreadPage.items].filter((item) => {
        if (seen.has(item.maTB)) return false;
        seen.add(item.maTB);
        return true;
      });
      setNotifications(items.slice(0, 20));
      setUnreadCount(unreadPage.unreadCount);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      // Giữ dữ liệu gần nhất nếu polling tạm thời thất bại.
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      const nextExpanded = saved === "true";
      appSidebarExpandedState = nextExpanded;
      setExpanded(nextExpanded);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshNotifications(controller.signal);
    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") void refreshNotifications();
    };
    const timer = window.setInterval(refreshWhenActive, 60_000);
    window.addEventListener("focus", refreshWhenActive);
    document.addEventListener("visibilitychange", refreshWhenActive);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenActive);
      document.removeEventListener("visibilitychange", refreshWhenActive);
    };
  }, [role, refreshNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, daDoc: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đánh dấu đã đọc");
    }
  };

  const handleOpenNotification = async (item: AppNotificationDto) => {
    if (!item.daDoc) {
      try {
        await markNotificationRead(item.maTB);
        setNotifications((current) =>
          current.map((n) => (n.maTB === item.maTB ? { ...n, daDoc: true } : n)),
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // Không chặn điều hướng nếu mark-read thất bại
      }
    }
  };

  const updateExpanded = (nextExpanded: boolean) => {
    appSidebarExpandedState = nextExpanded;
    setExpanded(nextExpanded);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextExpanded));
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-100">
      <div className="flex h-full overflow-hidden border border-gray-200 bg-white">
        <aside
          className={cn(
            "flex h-full shrink-0 flex-col border-r border-gray-200 bg-gray-50 transition-[width] duration-200",
            expanded ? "w-[236px]" : "w-[52px]",
          )}
        >
          <SidebarHeader expanded={expanded} home={meta.home} onExpandedChange={updateExpanded} />
          <SidebarNav navGroups={navGroups} currentPath={currentPath} expanded={expanded} />
          <div className={cn("shrink-0 border-t border-gray-100", expanded ? "h-3" : "h-2")} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
            <Breadcrumb
              roleLabel={meta.label}
              currentItem={currentItem}
              showWorkspaceNav={showWorkspaceNav}
            />

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative flex size-9 items-center justify-center rounded-lg border border-transparent text-gray-500 transition-colors hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                    aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`}
                  >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 rounded-xl border-gray-200 p-0">
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
                    <div>
                      <DropdownMenuLabel className="p-0 text-sm font-bold text-gray-900">
                        Thông báo
                      </DropdownMenuLabel>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {unreadCount} thông báo chưa đọc trong phân hệ {meta.badgeLabel}
                      </p>
                    </div>
                    {notifications.some((item) => item.trangThai === "DangMo") && (
                      <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                        Có việc cần xử lý
                      </span>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto p-2">
                    {loadingNotifications ? (
                      <p className="px-3 py-6 text-center text-xs text-gray-500">
                        Đang tải thông báo...
                      </p>
                    ) : notifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-gray-500">
                        Chưa có thông báo nào.
                      </p>
                    ) : (
                      notifications.map((item) => {
                        const tone = (item.tone in notificationTone
                          ? item.tone
                          : "blue") as AppNotificationTone;
                        const Icon = notificationIconByTone[tone];
                        const href = item.lienKet || "#";
                        return (
                          <DropdownMenuItem
                            key={item.maTB}
                            asChild
                            className="cursor-pointer rounded-lg p-0 focus:bg-blue-50"
                          >
                            <Link
                              to={href}
                              className="flex items-start gap-3 px-3 py-3"
                              onClick={() => {
                                void handleOpenNotification(item);
                              }}
                            >
                              <div
                                className={cn(
                                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                                  notificationTone[tone].iconBg,
                                )}
                              >
                                <Icon
                                  className={cn("size-4", notificationTone[tone].iconText)}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold leading-5 text-gray-900">
                                    {item.tieuDe}
                                  </p>
                                  {!item.daDoc && (
                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-gray-500">
                                  {item.noiDung}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  {item.trangThai === "DangMo" && (
                                    <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
                                      Cần xử lý
                                    </span>
                                  )}
                                  {item.thoiGianXuLy && (
                                    <span className="truncate text-[10px] text-emerald-700">
                                      {item.tenNguoiXuLy || "Đồng nghiệp"} đã xử lý
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-[11px] font-medium text-gray-400">
                                  {formatRelativeTime(item.thoiGianTao)}
                                </p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-100 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleMarkAllRead();
                      }}
                      disabled={unreadCount === 0}
                      className="flex h-8 w-full items-center justify-center rounded-md text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                    <Link
                      to="/notifications"
                      className="flex h-8 items-center justify-center rounded-md text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="inline-flex h-6 items-center rounded px-2 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                {meta.badgeLabel}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    aria-label="Tài khoản"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                      {employeeInitials}
                    </div>
                    <span className="hidden font-medium text-gray-900 xl:inline">{employeeName}</span>
                    <Settings className="hidden size-4 text-gray-400 xl:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-lg border-gray-200 p-2">
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <div className="text-sm font-semibold text-gray-900">{employeeName}</div>
                    <div className="mt-0.5 text-xs font-normal text-blue-600">
                      {meta.badgeLabel}
                    </div>
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
          <main className="min-h-0 flex-1 overflow-hidden bg-gray-50">{children}</main>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}` : parts[0]?.slice(0, 2) || "ND")
    .toLocaleUpperCase("vi-VN");
}

const notificationTone = {
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  green: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  orange: {
    iconBg: "bg-orange-50",
    iconText: "text-orange-600",
  },
  red: {
    iconBg: "bg-red-50",
    iconText: "text-red-600",
  },
} as const;

const notificationIconByTone: Record<
  AppNotificationTone,
  ComponentType<{ className?: string }>
> = {
  blue: FileText,
  green: CheckCircle2,
  orange: CreditCard,
  red: AlertTriangle,
};

function SidebarHeader({
  expanded,
  home,
  onExpandedChange,
}: {
  expanded: boolean;
  home: string;
  onExpandedChange: (expanded: boolean) => void;
}) {
  return (
    <div className={cn("flex h-14 items-center", expanded ? "gap-3 px-3" : "justify-center px-1")}>
      {expanded ? (
        <>
          <Link to={home} className="min-w-0 flex-1 text-left">
            <h1 className="truncate text-lg font-bold tracking-tight text-gray-900">
              HomeStay Dorm
            </h1>
          </Link>
          <button
            type="button"
            onClick={() => onExpandedChange(false)}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
            aria-label="Thu gọn menu"
          >
            <PanelLeftClose className="size-5" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onExpandedChange(true)}
          className="group flex size-8 items-center justify-center rounded-md transition-colors hover:bg-white"
          aria-label="Mở rộng menu"
        >
          <img
            src="/homestay-logo.svg"
            alt=""
            className="size-7 object-contain group-hover:hidden"
          />
          <PanelLeftOpen className="hidden size-5 text-gray-500 group-hover:block" />
        </button>
      )}
    </div>
  );
}

function SidebarNav({
  navGroups,
  currentPath,
  expanded,
}: {
  navGroups: AppNavGroup[];
  currentPath: string;
  expanded: boolean;
}) {
  return (
    <nav className={cn("flex-1 overflow-y-auto", expanded ? "px-2 py-2" : "px-1.5 py-1")}>
      {expanded ? (
        navGroups.map((group) => (
          <div key={group.title} className="mb-3">
            <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item, currentPath);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex h-9 items-center gap-2.5 rounded-md border-l-2 border-transparent px-2 text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-blue-700",
                      active && "border-blue-600 bg-white text-blue-700",
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
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const active = group.items.some((item) => isItemActive(item, currentPath));
              const [primaryItem] = group.items;
              const triggerClassName = cn(
                "flex h-9 w-full items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-white hover:text-blue-700",
                active && "bg-white text-blue-700 ring-1 ring-inset ring-blue-200",
              );

              if (group.items.length === 1 && primaryItem) {
                return (
                  <Tooltip key={group.title}>
                    <TooltipTrigger asChild>
                      <Link to={primaryItem.to} className={triggerClassName}>
                        <GroupIcon className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <CollapsedTooltip>{group.title}</CollapsedTooltip>
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
                    <CollapsedTooltip>{group.title}</CollapsedTooltip>
                  </Tooltip>
                  <DropdownMenuContent
                    side="right"
                    align="start"
                    sideOffset={10}
                    className="w-56 rounded-lg border-gray-200 p-1.5"
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
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700"
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
  );
}

function Breadcrumb({
  roleLabel,
  currentItem,
  showWorkspaceNav,
}: {
  roleLabel: string;
  currentItem: ReturnType<typeof findNavItem>;
  showWorkspaceNav: boolean;
}) {
  return (
    <div className="hidden min-w-0 items-center gap-2 text-xs text-gray-500 md:flex">
      <span className="truncate">{roleLabel}</span>
      {showWorkspaceNav && currentItem ? (
        <>
          <span>›</span>
          <span className="truncate">{currentItem.groupTitle}</span>
          <span>›</span>
          <span className="truncate font-semibold text-gray-900">{currentItem.label}</span>
        </>
      ) : (
        <>
          <span>›</span>
          <span className="truncate font-semibold text-gray-900">Tổng quan</span>
        </>
      )}
    </div>
  );
}

function CollapsedTooltip({ children }: { children: ReactNode }) {
  return (
    <TooltipContent
      side="right"
      align="center"
      sideOffset={10}
      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm"
    >
      {children}
    </TooltipContent>
  );
}

function isItemActive(item: { to: string; aliases?: string[] }, currentPath: string) {
  return [item.to, ...(item.aliases ?? [])].includes(currentPath);
}
