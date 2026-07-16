import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DashboardKpi,
  DashboardQueueItem,
  DashboardStatusBreakdown,
  DashboardTask,
  DashboardTone,
  DashboardTrendPoint,
} from "@/features/dashboards/services/dashboard-service";
import { cn } from "@/shared/lib/utils";

export const toneClass = {
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
} as const;

const chartColors = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0f766e"];

function asTone(value: string): DashboardTone {
  if (value === "green" || value === "orange" || value === "red") return value;
  return "blue";
}

function formatAsOf(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export function DashboardPageShell({
  title,
  description,
  asOf,
  scopeLabel,
  isFetching,
  onRefresh,
  children,
}: {
  title: string;
  description: string;
  asOf?: string;
  scopeLabel?: string;
  isFetching?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            {scopeLabel ? (
              <p className="mt-1 text-xs font-medium text-gray-400">Phạm vi: {scopeLabel}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
              <CheckCircle2 className="size-4 text-emerald-600" />
              {asOf ? `Cập nhật lúc ${formatAsOf(asOf)}` : "Đang tải dữ liệu vận hành"}
            </div>
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {isFetching ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Làm mới
              </button>
            ) : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function DashboardLoadingState({ label = "Đang tải tổng quan..." }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-500">
      <Loader2 className="size-5 animate-spin text-blue-600" />
      {label}
    </div>
  );
}

export function DashboardErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-white px-4 text-center">
      <AlertCircle className="size-6 text-red-500" />
      <div>
        <p className="text-sm font-semibold text-gray-900">Không tải được dashboard</p>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Thử lại
        </button>
      ) : null}
    </div>
  );
}

export function DashboardStaleBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
      {message}
    </div>
  );
}

export function DashboardKpiGrid({
  items,
  icons,
}: {
  items: DashboardKpi[];
  icons: Record<string, LucideIcon | ComponentType<{ className?: string }>>;
}) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = icons[item.key] ?? CheckCircle2;
        const tone = asTone(item.tone);
        return (
          <div key={item.key} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  toneClass[tone].iconBg,
                )}
              >
                <Icon className={cn("size-5", toneClass[tone].iconText)} />
              </div>
              <span className={cn("text-right text-xs font-medium", toneClass[tone].text)}>
                {item.subtext}
              </span>
            </div>
            <div className="mt-4">
              <div className="break-words text-2xl font-bold tracking-tight text-gray-900 xl:text-3xl">
                {item.value}
              </div>
              <div className="mt-1 text-sm font-medium text-gray-600">{item.label}</div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function DashboardTaskPanel({
  title = "Việc cần xử lý",
  description,
  tasks,
}: {
  title?: string;
  description: string;
  tasks: DashboardTask[];
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500">
            Không có việc cần xử lý.
          </div>
        ) : (
          tasks.map((item) => {
            const tone = asTone(item.tone);
            return (
              <Link
                key={`${item.to}-${item.text}`}
                to={item.to}
                className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 transition-colors hover:bg-blue-50/40"
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    toneClass[tone].iconBg,
                  )}
                >
                  {tone === "red" ? (
                    <AlertCircle className={cn("size-4", toneClass[tone].iconText)} />
                  ) : (
                    <Circle className={cn("size-3.5", toneClass[tone].iconText)} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.text}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.meta}</p>
                </div>
                <span className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700">
                  Xử lý
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

export function DashboardQueueTable({
  title,
  description,
  viewAllTo,
  columns,
  rows,
  emptyText,
  rightAlignLast = false,
}: {
  title: string;
  description: string;
  viewAllTo?: string;
  columns: [string, string, string] | [string, string, string, string];
  rows: DashboardQueueItem[];
  emptyText: string;
  rightAlignLast?: boolean;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {viewAllTo ? (
          <Link
            to={viewAllTo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
          >
            Xem tất cả
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column}
                  className={cn(
                    "px-3 py-2",
                    rightAlignLast && index === columns.length - 1 && "text-right",
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.length > 0 ? (
              rows.map((item) => {
                const tone = asTone(item.tone);
                const cells =
                  columns.length === 4
                    ? [item.title, item.timeLabel ?? item.subtitle ?? "—", item.room ?? "—", item.status ?? item.extra ?? "—"]
                    : [
                        item.title,
                        item.room ?? item.subtitle ?? "—",
                        item.amount != null
                          ? item.amount.toLocaleString("vi-VN") + " VNĐ"
                          : (item.extra ?? item.status ?? "—"),
                      ];
                return (
                  <tr key={item.id} className="align-top">
                    {cells.map((cell, index) => (
                      <td
                        key={`${item.id}-${index}`}
                        className={cn(
                          "px-3 py-3",
                          index === 0 && "font-semibold text-gray-900",
                          index === 1 && "text-gray-600",
                          index === 2 && (columns.length === 4 ? "font-mono text-gray-700" : "text-gray-600"),
                          rightAlignLast &&
                            index === cells.length - 1 &&
                            "text-right font-semibold text-emerald-700",
                          !rightAlignLast && index === cells.length - 1 && columns.length === 4 && "py-3",
                        )}
                      >
                        {index === cells.length - 1 && columns.length === 4 && item.status ? (
                          <span
                            className={cn(
                              "inline-flex rounded px-2 py-1 text-xs font-semibold",
                              toneClass[tone].badge,
                            )}
                          >
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-sm text-gray-500"
                  colSpan={columns.length}
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardQuickActions({
  actions,
}: {
  actions: ReadonlyArray<{
    to: string;
    title: string;
    description: string;
    icon: LucideIcon | ComponentType<{ className?: string }>;
  }>;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Thao tác nhanh</h2>
          <p className="mt-1 text-sm text-gray-500">Mở nhanh các nghiệp vụ thường dùng</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
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
  );
}

export function ReceiptTrendChart({ points }: { points: DashboardTrendPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 px-3 py-8 text-center text-sm text-gray-500">
        Chưa có dữ liệu thu 7 ngày gần nhất.
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-base font-bold text-gray-900">Tiền thu 7 ngày</h2>
        <p className="mt-1 text-sm text-gray-500">Tổng phiếu thu đã ghi nhận theo ngày nghiệp vụ</p>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={72}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value: number) =>
                value >= 1_000_000
                  ? `${Math.round(value / 1_000_000)}tr`
                  : value.toLocaleString("vi-VN")
              }
            />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString("vi-VN")} VNĐ`, "Tiền thu"]}
              labelFormatter={(label) => `Ngày ${label}`}
              contentStyle={{
                borderRadius: 8,
                borderColor: "#e5e7eb",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              fill="#93c5fd"
              fillOpacity={0.35}
              strokeWidth={2}
              name="Tiền thu"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2 text-right">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {points.map((point) => (
              <tr key={point.date}>
                <td className="px-3 py-2 text-gray-700">{point.label}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">
                  {point.value.toLocaleString("vi-VN")} VNĐ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function BedStatusChart({ items }: { items: DashboardStatusBreakdown[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 px-3 py-8 text-center text-sm text-gray-500">
        Chưa có dữ liệu trạng thái giường.
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-base font-bold text-gray-900">Phân bố trạng thái giường</h2>
        <p className="mt-1 text-sm text-gray-500">Theo danh mục hiện hành toàn hệ thống</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="count"
                nameKey="label"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
              >
                {items.map((item, index) => (
                  <Cell key={item.label} fill={chartColors[index % chartColors.length]} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name]}
                contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2 text-right">Số lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {items.map((item, index) => (
                <tr key={item.label}>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      {item.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
