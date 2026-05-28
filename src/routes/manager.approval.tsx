import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/manager/approval")({
  component: ManagerApprovalPage,
});

type Member = {
  id: string;
  fullName: string;
  gender: "male" | "female";
  birthYear: number;
  nationality: string;
  docType: "CCCD" | "Hộ chiếu";
  docNumber: string;
  phone: string;
  address: {
    street: string;
    ward: string;
    district: string;
    province: string;
  };
  status: "pending" | "rejected";
};

type ApprovalContract = {
  id: string;
  customerName: string;
  room: string;
  status: "pending_approval";
  members: Member[];
};

const mockApprovalContracts: ApprovalContract[] = [
  {
    id: "HD-PC020",
    customerName: "Phạm Hoàng Sơn",
    room: "P.208",
    status: "pending_approval",
    members: [
      {
        id: "m20-1",
        fullName: "Phạm Hoàng Sơn",
        gender: "male",
        birthYear: 2000,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079200456789",
        phone: "0901234567",
        address: {
          street: "12 Nguyễn Huệ",
          ward: "Phường Bến Nghé",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
      {
        id: "m20-2",
        fullName: "Lê Gia Hân",
        gender: "female",
        birthYear: 2001,
        nationality: "Singapore",
        docType: "Hộ chiếu",
        docNumber: "E12345678",
        phone: "0909001122",
        address: {
          street: "102 Hai Bà Trưng",
          ward: "Phường Đa Kao",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
    ],
  },
  {
    id: "HD-PC021",
    customerName: "Nguyễn Khánh Duy",
    room: "P.310",
    status: "pending_approval",
    members: [
      {
        id: "m21-1",
        fullName: "Nguyễn Khánh Duy",
        gender: "male",
        birthYear: 1999,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079199123888",
        phone: "0911223344",
        address: {
          street: "45 Hoàng Sa",
          ward: "Phường Tân Định",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
    ],
  },
];

function ManagerApprovalPage() {
  const allowed = useRoleGuard("manager");
  const [items, setItems] = useState<ApprovalContract[]>(mockApprovalContracts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q),
    );
  }, [items, query]);
  const selected = filtered.find((item) => item.id === selectedId) ?? null;

  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath="/manager/approval">
      <div className="flex h-full overflow-hidden">
        <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-800">Hồ sơ chờ duyệt</h2>
            <p className="mt-0.5 text-xs text-gray-400">{filtered.length} hồ sơ chờ duyệt</p>
          </div>
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm hợp đồng..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "flex w-full flex-col gap-1.5 border-l-2 border-transparent px-4 py-3 text-left hover:bg-amber-50/60",
                      selectedId === item.id && "border-l-amber-500 bg-amber-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{item.id}</span>
                      <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">
                        Chờ duyệt
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.customerName}</p>
                    <p className="font-mono text-xs text-gray-500">{item.room}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {!selected ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn hồ sơ để xét duyệt thành viên.</p>
          </section>
        ) : (
          <section className="flex h-full flex-1 flex-col overflow-hidden bg-gray-50/60">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-3">
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-sm font-bold text-gray-900">{selected.id}</h1>
                <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">Chờ duyệt</Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {selected.customerName} • {selected.room}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="rounded-lg border border-gray-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-2 py-2 text-xs">STT</TableHead>
                      <TableHead className="px-2 py-2 text-xs">HỌ VÀ TÊN</TableHead>
                      <TableHead className="px-2 py-2 text-xs">ĐẶC ĐIỂM</TableHead>
                      <TableHead className="px-2 py-2 text-xs">QUỐC TỊCH</TableHead>
                      <TableHead className="px-2 py-2 text-xs">GIẤY TỜ</TableHead>
                      <TableHead className="px-2 py-2 text-xs">SĐT</TableHead>
                      <TableHead className="px-2 py-2 text-right text-xs">HÀNH ĐỘNG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.members.map((member, index) => {
                      const rejected = member.status === "rejected";
                      return (
                        <TableRow
                          key={member.id}
                          className={cn(rejected ? "bg-red-50/50 hover:bg-red-50/50" : "")}
                        >
                          <TableCell className="p-2 text-xs text-gray-500">{index + 1}</TableCell>
                          <TableCell
                            className={cn(
                              "p-2 text-sm font-medium",
                              rejected ? "text-gray-500 line-through" : "text-gray-800",
                            )}
                          >
                            {member.fullName}
                          </TableCell>
                          <TableCell className="p-2 text-sm text-gray-600">
                            {member.gender === "male" ? "Nam" : "Nữ"} • {member.birthYear}
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            {member.nationality !== "Việt Nam" ? (
                              <Badge className="h-5 bg-amber-100 text-[10px] text-amber-700">
                                {member.nationality}
                              </Badge>
                            ) : (
                              <span className="text-gray-700">{member.nationality}</span>
                            )}
                          </TableCell>
                          <TableCell className="p-2 font-mono text-sm text-gray-700">
                            {member.docType}: {member.docNumber}
                          </TableCell>
                          <TableCell className="p-2 font-mono text-sm text-gray-700">
                            {member.phone}
                          </TableCell>
                          <TableCell className="p-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 border border-gray-200"
                                  >
                                    <Eye className="size-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Chi tiết thành viên</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <ReadOnlyLine label="Họ và tên" value={member.fullName} />
                                    <ReadOnlyLine
                                      label="Đặc điểm"
                                      value={`${member.gender === "male" ? "Nam" : "Nữ"} • ${member.birthYear}`}
                                    />
                                    <ReadOnlyLine label="Quốc tịch" value={member.nationality} />
                                    <ReadOnlyLine
                                      label="Giấy tờ"
                                      value={`${member.docType}: ${member.docNumber}`}
                                    />
                                    <ReadOnlyLine label="Số điện thoại" value={member.phone} />
                                    <div className="col-span-2">
                                      <ReadOnlyLine
                                        label="Địa chỉ thường trú"
                                        value={`${member.address.street}, ${member.address.ward}, ${member.address.district}, ${member.address.province}`}
                                      />
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className={cn(
                                  "h-7 text-xs",
                                  rejected
                                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    : "border-red-300 text-red-700 hover:bg-red-50",
                                )}
                                onClick={() => {
                                  setItems((current) =>
                                    current.map((contract) =>
                                      contract.id !== selected.id
                                        ? contract
                                        : {
                                            ...contract,
                                            members: contract.members.map((m) =>
                                              m.id === member.id
                                                ? {
                                                    ...m,
                                                    status: rejected ? "pending" : "rejected",
                                                  }
                                                : m,
                                            ),
                                          },
                                    ),
                                  );
                                  toast.success(
                                    rejected
                                      ? `Đã hoàn tác thành viên ${member.fullName}.`
                                      : `Đã từ chối thành viên ${member.fullName}.`,
                                  );
                                }}
                              >
                                {rejected ? "Hoàn tác" : "Từ chối"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <footer className="sticky bottom-0 flex h-14 items-center justify-between border-t border-gray-200 bg-white px-5">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users className="size-3.5" />
                <span>Sub-flow A4: Duyệt theo thành viên</span>
              </div>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setItems((current) => current.filter((c) => c.id !== selected.id));
                  setSelectedId(null);
                  toast.success("Duyệt hồ sơ thành công.", {
                    icon: <CheckCircle2 className="size-4 text-emerald-100" />,
                  });
                }}
              >
                {selected.members.some((m) => m.status === "rejected")
                  ? "Duyệt các thành viên còn lại"
                  : "Duyệt toàn bộ"}
              </Button>
            </footer>
          </section>
        )}
      </div>
    </RoleShell>
  );
}

function ReadOnlyLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-700">
        {value}
      </p>
    </div>
  );
}
