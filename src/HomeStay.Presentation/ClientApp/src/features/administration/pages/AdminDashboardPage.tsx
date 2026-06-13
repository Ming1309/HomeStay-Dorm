import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowUpRight,
  BedDouble,
  CheckCircle2,
  Circle,
  Landmark,
  Package,
  ScrollText,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, type ComponentType } from "react";

import { cn } from "@/shared/lib/utils";
import { useWorkflowStore } from "@/app/providers/workflow-store";

const adminWorkItems = [
  {
    to: "/admin/services",
    title: "Dịch vụ",
    description: "Đơn vị tính, đơn giá và trạng thái áp dụng",
    group: "Danh mục",
    icon: Settings2,
  },
  {
    to: "/admin/rooms-beds",
    title: "Phòng / Giường",
    description: "Sức chứa, giá thuê và trạng thái vận hành",
    group: "Danh mục",
    icon: BedDouble,
  },
  {
    to: "/admin/assets",
    title: "Tài sản",
    description: "Thiết bị, vật tư và định mức bồi thường",
    group: "Danh mục",
    icon: Package,
  },
  {
    to: "/admin/regulations",
    title: "Quy định",
    description: "Nội quy và điều khoản lưu trú",
    group: "Danh mục",
    icon: ScrollText,
  },
  {
    to: "/admin/users",
    title: "Người dùng",
    description: "Tài khoản nhân viên, vai trò và chi nhánh",
    group: "Người dùng",
    icon: Users,
  },
  {
    to: "/admin/deposit-policy",
    title: "Chính sách hoàn cọc",
    description: "Tỷ lệ hoàn trả và mốc lưu trú áp dụng",
    group: "Chính sách",
    icon: Landmark,
  },
] as const;

const assumedStaffSummary = {
  total: 3,
  active: 2,
  locked: 1,
};



export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { role, isHydrated, rooms, depositPolicies, getActivePolicy } = useWorkflowStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const dashboard = useMemo(() => {
    const beds = rooms.flatMap((room) => room.beds);
    const availableBeds = beds.filter((bed) => bed.status === "available");
    const maintenanceBeds = beds.filter((bed) => bed.status === "maintenance");
    const maintenanceRooms = rooms.filter((room) => room.status === "maintenance");
    const activePolicy = getActivePolicy();
    const activeConfigCount = adminWorkItems.length + (activePolicy ? 1 : 0);

    return {
      activePolicy,
      kpis: [
        {
          label: "Tổng phòng / giường",
          value: `${rooms.length} / ${beds.length}`,
          subtext: "Danh mục đang quản trị",
          icon: BedDouble,
          tone: "blue",
        },
        {
          label: "Giường trống",
          value: String(availableBeds.length),
          subtext: `${maintenanceBeds.length} giường bảo trì`,
          icon: CheckCircle2,
          tone: "green",
        },
        {
          label: "Tài khoản hoạt động",
          value: `${assumedStaffSummary.active}/${assumedStaffSummary.total}`,
          subtext: `${assumedStaffSummary.locked} tài khoản đang khóa`,
          icon: Users,
          tone: "orange",
        },
        {
          label: "Cấu hình đang áp dụng",
          value: String(activeConfigCount),
          subtext: activePolicy?.maChinhSach ?? "Chưa có chính sách hiệu lực",
          icon: ShieldCheck,
          tone: activePolicy ? "blue" : "red",
        },
      ],
      tasks: [
        {
          text: `${maintenanceRooms.length + maintenanceBeds.length} phòng/giường cần bảo trì`,
          meta:
            maintenanceRooms[0]?.code ??
            (maintenanceBeds[0]?.code
              ? `Giường ${maintenanceBeds[0].code}`
              : "Không có phòng hoặc giường nào đang bảo trì."),
          to: "/admin/rooms-beds",
          tone: maintenanceRooms.length + maintenanceBeds.length ? "red" : "green",
        },
        {
          text: activePolicy
            ? `Chính sách hoàn cọc hiệu lực: ${activePolicy.maChinhSach}`
            : "Chưa có chính sách hoàn cọc hiệu lực",
          meta: activePolicy
            ? `${activePolicy.tenChinhSach} - áp dụng từ ${activePolicy.ngayApDung}`
            : "Cần kiểm tra cấu hình chính sách hoàn cọc.",
          to: "/admin/deposit-policy",
          tone: activePolicy ? "blue" : "red",
        },
        {
          text: `${adminWorkItems.length - 2} danh mục vận hành cần duy trì`,
          meta: "Dịch vụ, phòng/giường, tài sản và quy định lưu trú.",
          to: "/admin/services",
          tone: "blue",
        },
        {
          text: `${assumedStaffSummary.locked} tài khoản nhân viên đang khóa`,
          meta: "Kiểm tra phân quyền và trạng thái truy cập khi thay đổi nhân sự.",
          to: "/admin/users",
          tone: assumedStaffSummary.locked ? "orange" : "green",
        },
      ],
      configRows: [
        {
          name: "Phòng / Giường",
          status: `${rooms.length} phòng, ${availableBeds.length} giường trống`,
          group: "Danh mục",
          to: "/admin/rooms-beds",
          tone: "blue",
        },
        {
          name: "Chính sách hoàn cọc",
          status: activePolicy?.maChinhSach ?? "Chưa hiệu lực",
          group: "Chính sách",
          to: "/admin/deposit-policy",
          tone: activePolicy ? "green" : "red",
        },
        {
          name: "Người dùng",
          status: `${assumedStaffSummary.active} hoạt động`,
          group: "Phân quyền",
          to: "/admin/users",
          tone: "orange",
        },
      ],
    };
  }, [getActivePolicy, rooms]);

  if (!isHydrated || role !== "admin") return null;

  return (
    <div className="h-full w-full overflow-hidden bg-gray-50">
      <main className="flex h-full flex-col overflow-hidden">
        <section className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4">
            <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Tổng quan Admin
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Theo dõi danh mục, người dùng và chính sách hệ thống.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {depositPolicies.length} phiên bản chính sách
              </div>
            </header>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {dashboard.kpis.map((item) => (
                <KpiCard key={item.label} {...item} />
              ))}
            </section>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
              <TaskPanel tasks={dashboard.tasks} />
              <section className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Cấu hình nổi bật</h2>
                    <p className="mt-1 text-sm text-gray-500">Các cấu hình ảnh hưởng trực tiếp vận hành</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Cấu hình</th>
                        <th className="px-3 py-2">Nhóm</th>
                        <th className="px-3 py-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {dashboard.configRows.map((item) => (
                        <tr key={item.name} className="align-top">
                          <td className="px-3 py-3">
                            <Link to={item.to} className="font-semibold text-gray-900 hover:text-blue-700">
                              {item.name}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-gray-600">{item.group}</td>
                          <td className="px-3 py-3">
                            <span className={cn("inline-flex rounded px-2 py-1 text-xs font-semibold", toneClass[item.tone].badge)}>
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

            <QuickActions />
          </div>
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: ComponentType<{ className?: string }>;
  tone: keyof typeof toneClass;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex size-10 items-center justify-center rounded-lg", toneClass[tone].iconBg)}>
          <Icon className={cn("size-5", toneClass[tone].iconText)} />
        </div>
        <span className={cn("text-right text-xs font-medium", toneClass[tone].text)}>{subtext}</span>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-gray-900">{value}</div>
        <div className="mt-1 text-sm font-medium text-gray-600">{label}</div>
      </div>
    </div>
  );
}

function TaskPanel({
  tasks,
}: {
  tasks: Array<{ text: string; meta: string; to: (typeof adminWorkItems)[number]["to"]; tone: keyof typeof toneClass }>;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Việc cần xử lý</h2>
          <p className="mt-1 text-sm text-gray-500">Các cấu hình cần theo dõi để hệ thống ổn định</p>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((item) => (
          <Link
            key={item.text}
            to={item.to}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-3 transition-colors hover:bg-blue-50/40"
          >
            <div className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", toneClass[item.tone].iconBg)}>
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
            <span className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700">Mở</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Thao tác nhanh</h2>
          <p className="mt-1 text-sm text-gray-500">Mở nhanh các màn hình quản trị hệ thống</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {adminWorkItems.map((action) => {
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

const toneClass = {
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
