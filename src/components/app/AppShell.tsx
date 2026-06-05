import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import {
  findNavItem,
  navGroupsByRole,
  roleMeta,
  type AppNavGroup,
} from "@/components/app/appNavigation";
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
import { useWorkflowStore, type UserRole } from "@/lib/workflow-store";

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
  const { setRole } = useWorkflowStore();
  const [expanded, setExpanded] = useState(appSidebarExpandedState);
  const meta = roleMeta[role];
  const navGroups = navGroupsByRole[role];
  const currentItem = findNavItem(role, currentPath);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      const nextExpanded = saved === "true";
      appSidebarExpandedState = nextExpanded;
      setExpanded(nextExpanded);
    }
  }, []);

  const updateExpanded = (nextExpanded: boolean) => {
    appSidebarExpandedState = nextExpanded;
    setExpanded(nextExpanded);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextExpanded));
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gray-50 p-4">
      <div className="flex h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <aside
          className={cn(
            "flex h-full shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200",
            expanded ? "w-[244px]" : "w-[56px]",
          )}
        >
          <SidebarHeader expanded={expanded} home={meta.home} onExpandedChange={updateExpanded} />
          <SidebarNav navGroups={navGroups} currentPath={currentPath} expanded={expanded} />
          <div className={cn("shrink-0 border-t border-gray-100", expanded ? "h-3" : "h-2")} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
            <Breadcrumb
              roleLabel={meta.label}
              currentItem={currentItem}
              showWorkspaceNav={showWorkspaceNav}
            />

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
                {meta.badgeLabel}
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
          <main className="min-h-0 flex-1 overflow-hidden bg-gray-50/70">{children}</main>
        </div>
      </div>
    </div>
  );
}

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
    <div className={cn("flex h-14 items-center", expanded ? "gap-3 px-4" : "justify-center px-2")}>
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
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            aria-label="Thu gọn menu"
          >
            <PanelLeftClose className="size-5" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onExpandedChange(true)}
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
    <nav className={cn("flex-1 overflow-y-auto", expanded ? "px-3 py-2" : "px-2 py-1")}>
      {expanded ? (
        navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const active = group.items.some((item) => isItemActive(item, currentPath));
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
      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-md"
    >
      {children}
    </TooltipContent>
  );
}

function isItemActive(item: { to: string; aliases?: string[] }, currentPath: string) {
  return [item.to, ...(item.aliases ?? [])].includes(currentPath);
}
