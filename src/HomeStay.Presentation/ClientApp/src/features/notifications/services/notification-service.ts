import { z } from "zod";

export type AppNotificationTone = "blue" | "green" | "orange" | "red";
export type AppNotificationFilter = "open" | "unread" | "all";

const notificationSchema = z.object({
  maTB: z.string().min(1),
  loaiSuKien: z.string().min(1),
  loaiThongBao: z.enum(["CanXuLy", "ThongTin", "CanhBao"]),
  tieuDe: z.string().min(1),
  noiDung: z.string().min(1),
  lienKet: z.string().nullable(),
  tone: z.enum(["blue", "green", "orange", "red"]),
  trangThai: z.enum(["DangMo", "DaXuLy", "DaHuy", "ThongTin"]),
  thoiGianTao: z.string().min(1),
  daDoc: z.boolean(),
  maThamChieu: z.string().nullable(),
  maNVXuLy: z.string().nullable(),
  tenNguoiXuLy: z.string().nullable(),
  thoiGianXuLy: z.string().nullable(),
});

const notificationPageSchema = z.object({
  items: z.array(notificationSchema),
  unreadCount: z.number().int().nonnegative(),
  nextCursor: z.string().nullable(),
});

export type AppNotificationDto = z.infer<typeof notificationSchema>;
export type AppNotificationPage = z.infer<typeof notificationPageSchema>;

const errorSchema = z.object({
  message: z.string().optional(),
  Message: z.string().optional(),
});

async function readResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T;
    const payload = await response.json();
    if (!schema) return payload as T;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) throw new Error("Dữ liệu thông báo từ máy chủ không đúng định dạng.");
    return parsed.data;
  }
  const parsed = errorSchema.safeParse(await response.json().catch(() => null));
  throw new Error(
    parsed.success
      ? parsed.data.message ?? parsed.data.Message ?? "Không thể xử lý yêu cầu thông báo."
      : "Không thể xử lý yêu cầu thông báo.",
  );
}

export async function loadNotifications(options: {
  filter?: AppNotificationFilter;
  limit?: number;
  cursor?: string | null;
  signal?: AbortSignal;
} = {}): Promise<AppNotificationPage> {
  const params = new URLSearchParams({
    filter: options.filter ?? "unread",
    limit: String(options.limit ?? 20),
  });
  if (options.cursor) params.set("cursor", options.cursor);
  return readResponse(
    await fetch(`/api/notifications?${params.toString()}`, { signal: options.signal }),
    notificationPageSchema,
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
