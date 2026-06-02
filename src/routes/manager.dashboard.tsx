import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ComponentType } from "react";
import { Bed, Home, ScrollText, Search, ShieldCheck, ShieldHalf, ClipboardCheck } from "lucide-react";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/manager/dashboard")({
  component: ManagerDashboardPage,
});

function ManagerDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/manager" });
  }, [navigate]);

  return null;
}

const launchpadItems = [
  {
    to: "/manager/approval",
    title: "Xét duyệt hồ sơ",
    description:
      "Kiểm tra điều kiện lưu trú và duyệt/từ chối danh sách thành viên trước khi ký hợp đồng.",
    icon: ShieldCheck,
  },
  {
    to: "/manager/confirm-deposit",
    title: "Xác nhận tiền cọc",
    description: "Đối chiếu chứng từ giao dịch và xác nhận khoản tiền cọc của khách hàng.",
    icon: ShieldHalf,
  },
  {
    to: "/manager/handover",
    title: "Bàn giao phòng",
    description:
      "Kiểm tra hiện trạng trang thiết bị vật tư và lập biên bản bàn giao phòng cho khách dọn vào ở.",
    icon: Home,
  },
  {
    to: "/manager/termination",
    title: "Thanh lý hợp đồng",
    description:
      "Xác nhận thanh lý hợp đồng sau khi hoàn tất mọi nghĩa vụ tài chính và bàn giao phòng.",
    icon: ScrollText,
  },
  {
    to: "/manager/thu-hoi-tai-san",
    title: "Thu hồi tài sản",
    description: "Lập biên bản thu hồi tài sản khi khách trả phòng để Kế toán đối soát.",
    icon: ClipboardCheck,
  },
  {
    to: "/manager/contracts",
    title: "Tra cứu hợp đồng",
    description: "Tìm kiếm, tra cứu và in ấn thông tin chi tiết các hợp đồng thuê trong hệ thống.",
    icon: Search,
  },
  {
    to: "/manager/tra-cuu-phong",
    title: "Tra cứu phòng / giường",
    description: "Kiểm tra trạng thái thực tế và tính khả dụng của phòng hoặc giường.",
    icon: Bed,
  },
] as const;

export function ManagerDashboardScreen({ currentPath }: { currentPath: string }) {
  const allowed = useRoleGuard("manager");
  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath={currentPath}>
      <main className="flex h-full items-center justify-center overflow-y-auto px-6 py-10">
        <div className="w-full max-w-6xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Quản lý</h1>
            <p className="mt-2 text-sm text-gray-500">Chọn nghiệp vụ bạn muốn thực hiện</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {launchpadItems.map((item) => (
              <LaunchpadCard key={item.to} {...item} />
            ))}
          </div>
        </div>
      </main>
    </RoleShell>
  );
}

function LaunchpadCard({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: (typeof launchpadItems)[number]["to"];
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link to={to} className="group block h-full">
      <Card className="h-full rounded-lg border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
        <CardContent className="flex h-full flex-col p-6">
          <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <Icon className="size-5" />
          </div>
          <h2 className="mt-5 text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
