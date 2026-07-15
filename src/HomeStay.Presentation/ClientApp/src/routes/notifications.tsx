import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { AlertTriangle, Bell, CheckCircle2, CircleDot, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/app/layouts/AppShell";
import { useAuth } from "@/features/auth/model/auth-store";
import {
  formatRelativeTime,
  loadNotifications,
  markNotificationRead,
  type AppNotificationDto,
  type AppNotificationFilter,
} from "@/features/notifications/services/notification-service";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/notifications")({
  component: NotificationsRoute,
});

function NotificationsRoute() {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return <div className="flex h-screen items-center justify-center"><Loader2 className="size-5 animate-spin" /></div>;
  if (!user) return <Navigate to="/" />;

  return (
    <AppShell role={user.role} currentPath="/notifications" showWorkspaceNav={false}>
      <NotificationHistory />
    </AppShell>
  );
}

function NotificationHistory() {
  const [filter, setFilter] = useState<AppNotificationFilter>("open");
  const [items, setItems] = useState<AppNotificationDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (cursor?: string | null) => {
    cursor ? setLoadingMore(true) : setLoading(true);
    try {
      const page = await loadNotifications({ filter, limit: 30, cursor });
      setItems((current) => cursor ? [...current, ...page.items] : page.items);
      setNextCursor(page.nextCursor);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải thông báo.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const openItem = async (item: AppNotificationDto) => {
    if (item.daDoc) return;
    try {
      await markNotificationRead(item.maTB);
      setItems((current) => current.map((value) => value.maTB === item.maTB ? { ...value, daDoc: true } : value));
    } catch {
      // Điều hướng vẫn hữu ích ngay cả khi trạng thái đọc chưa lưu được.
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Thông báo</h1>
          <p className="mt-0.5 text-sm text-gray-500">Tác vụ trong chi nhánh và phản hồi dành cho bạn.</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {([['open', 'Cần xử lý'], ['unread', 'Chưa đọc'], ['all', 'Tất cả']] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === value ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-900",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-500"><Loader2 className="mr-2 size-4 animate-spin" />Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center text-gray-500">
            <Bell className="mb-3 size-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">Không có thông báo phù hợp</p>
            <p className="mt-1 text-xs">Các tác vụ đã xử lý vẫn có thể xem trong mục Tất cả.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const Icon = item.trangThai === "DangMo" ? CircleDot : item.loaiThongBao === "CanhBao" ? AlertTriangle : CheckCircle2;
              return (
                <Link
                  key={item.maTB}
                  to={item.lienKet || "/notifications"}
                  onClick={() => { void openItem(item); }}
                  className={cn("flex gap-4 px-6 py-4 hover:bg-gray-50", !item.daDoc && "bg-blue-50/40")}
                >
                  <div className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    item.trangThai === "DangMo" ? "bg-orange-50 text-orange-600" : item.tone === "red" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600",
                  )}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.tieuDe}</p>
                        <p className="mt-1 text-sm leading-5 text-gray-600">{item.noiDung}</p>
                      </div>
                      {!item.daDoc && <span className="mt-1 size-2 shrink-0 rounded-full bg-blue-600" />}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>{formatRelativeTime(item.thoiGianTao)}</span>
                      {item.trangThai === "DangMo" && <span className="font-semibold text-orange-700">Cần xử lý</span>}
                      {item.thoiGianXuLy && <span className="font-semibold text-emerald-700">{item.tenNguoiXuLy || "Đồng nghiệp"} đã xử lý</span>}
                      {item.trangThai === "DaHuy" && <span className="font-semibold text-red-600">Đã hủy</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {nextCursor && (
        <footer className="flex shrink-0 justify-center border-t border-gray-200 p-3">
          <Button variant="outline" size="sm" disabled={loadingMore} onClick={() => { void load(nextCursor); }}>
            {loadingMore && <Loader2 className="mr-2 size-4 animate-spin" />}Tải thêm
          </Button>
        </footer>
      )}
    </div>
  );
}
