export type AppNotificationTone = "blue" | "green" | "orange";

export type AppNotificationDto = {
  maTB: string;
  tieuDe: string;
  noiDung: string;
  vaiTroNhan: string;
  lienKet: string | null;
  tone: AppNotificationTone;
  thoiGianTao: string;
  daDoc: boolean;
  maThamChieu: string | null;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
  const body = (await response.json().catch(() => null)) as { message?: string; Message?: string } | null;
  throw new Error(body?.message ?? body?.Message ?? "Không thể xử lý yêu cầu thông báo.");
}

export async function loadNotifications(signal?: AbortSignal) {
  return readResponse<AppNotificationDto[]>(
    await fetch("/api/notifications", { signal }),
  );
}

export async function markNotificationRead(maTB: string) {
  return readResponse<void>(
    await fetch(`/api/notifications/${encodeURIComponent(maTB)}/read`, { method: "POST" }),
  );
}

export async function markAllNotificationsRead() {
  return readResponse<void>(
    await fetch("/api/notifications/read-all", { method: "POST" }),
  );
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}
