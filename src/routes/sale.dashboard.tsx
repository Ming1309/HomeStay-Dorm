import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  FileText,
  HandCoins,
  ReceiptText,
  UserPlus,
  Users,
} from "lucide-react";

import { SaleShell } from "@/components/app/SaleShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sale/dashboard")({
  component: SaleDashboardPortalPage,
});

const kpis = [
  {
    label: "Lịch hẹn hôm nay",
    value: "8",
    subtext: "3 lịch hẹn cần xác nhận",
    icon: CalendarDays,
    tone: "blue",
  },
  {
    label: "Phiếu cọc chờ xác nhận",
    value: "5",
    subtext: "Cập nhật mới nhất",
    icon: HandCoins,
    tone: "orange",
  },
  {
    label: "Hợp đồng chờ lập",
    value: "3",
    subtext: "Sau khi khách đã cọc",
    icon: FileText,
    tone: "blue",
  },
  {
    label: "Phòng còn trống",
    value: "12",
    subtext: "Sẵn sàng tư vấn",
    icon: BedDouble,
    tone: "green",
  },
];

const taskItems = [
  {
    text: "3 lịch hẹn xem phòng hôm nay",
    meta: "Ưu tiên gọi xác nhận trước 10:00",
    tone: "orange",
  },
  {
    text: "2 phiếu cọc chưa ghi nhận thanh toán",
    meta: "Kiểm tra chứng từ chuyển khoản",
    tone: "orange",
  },
  {
    text: "1 hợp đồng chờ lập sau khi khách đã cọc",
    meta: "Phòng P-305, khách Lê Hoàng Cường",
    tone: "blue",
  },
  {
    text: "1 hồ sơ lưu trú cần bổ sung thông tin",
    meta: "Thiếu địa chỉ thường trú",
    tone: "red",
  },
];

const quickActions = [
  {
    to: "/sale/lap-phieu-coc",
    title: "Lập phiếu cọc",
    description: "Tạo phiếu từ lịch hẹn thành công",
    icon: ReceiptText,
  },
  {
    to: "/sale/ghi-nhan-coc",
    title: "Ghi nhận cọc",
    description: "Cập nhật chứng từ thanh toán",
    icon: HandCoins,
  },
  {
    to: "/sale/lap-phieu-dang-ky",
    title: "Lập phiếu đăng ký",
    description: "Tạo hồ sơ tư vấn mới",
    icon: UserPlus,
  },
  {
    to: "/sale/lich-hen",
    title: "Tạo lịch hẹn",
    description: "Đặt lịch xem phòng",
    icon: CalendarDays,
  },
  {
    to: "/sale/lap-hop-dong",
    title: "Lập hợp đồng thuê",
    description: "Soạn hợp đồng cho khách đã cọc",
    icon: FileText,
  },
  {
    to: "/sale/ho-so-luu-tru",
    title: "Nhập hồ sơ lưu trú",
    description: "Bổ sung thông tin người ở",
    icon: Users,
  },
];

const recentAppointments = [
  {
    customer: "Nguyễn Văn An",
    time: "09:30 hôm nay",
    room: "P-101",
    status: "Đã xác nhận",
    tone: "green",
  },
  {
    customer: "Trần Thị Bình",
    time: "10:45 hôm nay",
    room: "P-203",
    status: "Chờ gọi lại",
    tone: "orange",
  },
  {
    customer: "Lê Hoàng Cường",
    time: "14:00 hôm nay",
    room: "P-305",
    status: "Đã cọc",
    tone: "blue",
  },
  {
    customer: "Phạm Thu Dung",
    time: "16:00 hôm nay",
    room: "P-401",
    status: "Cần bổ sung",
    tone: "red",
  },
];

function SaleDashboardPortalPage() {
  return (
    <SaleShell currentPath="/sale/dashboard" showWorkspaceNav={false}>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Bảng điều khiển Sale
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Theo dõi lịch hẹn, phiếu cọc và hợp đồng cần xử lý
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
              <Clock className="size-4 text-blue-600" />
              Cập nhật lúc 08:30 hôm nay
            </div>
          </header>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        toneClass[item.tone].iconBg,
                      )}
                    >
                      <Icon className={cn("size-5", toneClass[item.tone].iconText)} />
                    </div>
                    <span className={cn("text-xs font-medium", toneClass[item.tone].text)}>
                      {item.subtext}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold tracking-tight text-gray-900">
                      {item.value}
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-600">{item.label}</div>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Việc cần xử lý</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Các đầu việc ảnh hưởng trực tiếp đến đặt cọc và nhận phòng
                  </p>
                </div>
                <span className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                  7 việc
                </span>
              </div>

              <div className="space-y-3">
                {taskItems.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                        toneClass[item.tone].iconBg,
                      )}
                    >
                      {item.tone === "red" ? (
                        <AlertCircle className={cn("size-4", toneClass[item.tone].iconText)} />
                      ) : (
                        <Circle className={cn("size-3.5", toneClass[item.tone].iconText)} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.text}</p>
                      <p className="mt-1 text-xs text-gray-500">{item.meta}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Xử lý
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Lịch hẹn gần nhất</h2>
                  <p className="mt-1 text-sm text-gray-500">Theo dõi khách sắp xem phòng</p>
                </div>
                <Link
                  to="/sale/tra-cuu-lich-hen"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Xem tất cả
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Khách hàng</th>
                      <th className="px-3 py-2">Thời gian</th>
                      <th className="px-3 py-2">Phòng</th>
                      <th className="px-3 py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {recentAppointments.map((item) => (
                      <tr key={`${item.customer}-${item.time}`} className="align-top">
                        <td className="px-3 py-3 font-semibold text-gray-900">{item.customer}</td>
                        <td className="px-3 py-3 text-gray-600">{item.time}</td>
                        <td className="px-3 py-3 font-mono text-gray-700">{item.room}</td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded px-2 py-1 text-xs font-semibold",
                              toneClass[item.tone].badge,
                            )}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Thao tác nhanh</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Mở nhanh các nghiệp vụ thường dùng trong ngày
                </p>
              </div>
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-gray-900">{action.title}</h3>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{action.description}</p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-gray-300 transition-colors group-hover:text-blue-600" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </SaleShell>
  );
}

const toneClass: Record<string, { iconBg: string; iconText: string; text: string; badge: string }> =
  {
    blue: {
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      text: "text-blue-600",
      badge: "bg-blue-50 text-blue-700",
    },
    green: {
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      text: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700",
    },
    orange: {
      iconBg: "bg-orange-50",
      iconText: "text-orange-600",
      text: "text-orange-600",
      badge: "bg-orange-50 text-orange-700",
    },
    red: {
      iconBg: "bg-red-50",
      iconText: "text-red-600",
      text: "text-red-600",
      badge: "bg-red-50 text-red-700",
    },
  };
