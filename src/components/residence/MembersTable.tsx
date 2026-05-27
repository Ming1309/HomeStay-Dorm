import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Member = {
  id: string;
  fullName: string;
  gender: "male" | "female" | "";
  dob: string;
  docType: "cccd" | "passport";
  docId: string;
  phone: string;
};

export const newMember = (): Member => ({
  id: crypto.randomUUID(),
  fullName: "",
  gender: "",
  dob: "",
  docType: "cccd",
  docId: "",
  phone: "",
});

type Props = {
  members: Member[];
  onChange: (next: Member[]) => void;
};

export function MembersTable({ members, onChange }: Props) {
  const update = (id: string, patch: Partial<Member>) =>
    onChange(members.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const remove = (id: string) =>
    onChange(members.filter((m) => m.id !== id));

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
            <TableHead className="w-10 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
              STT
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
              Họ và tên <span className="text-red-500">*</span>
            </TableHead>
            <TableHead className="w-[90px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
              Giới tính
            </TableHead>
            <TableHead className="w-[130px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
              Ngày sinh
            </TableHead>
            <TableHead className="w-[110px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
              Loại GT <span className="text-red-500">*</span>
            </TableHead>
            <TableHead className="w-[160px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
              Số giấy tờ <span className="text-red-500">*</span>
            </TableHead>
            <TableHead className="w-[150px] text-xs font-semibold text-gray-500 uppercase tracking-wide py-2.5">
              Số điện thoại
            </TableHead>
            <TableHead className="w-[60px] py-2.5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m, i) => (
            <TableRow
              key={m.id}
              className="hover:bg-blue-50/40 border-b border-gray-100 last:border-0 transition-colors"
            >
              <TableCell className="text-center text-xs text-gray-400 tabular-nums font-medium py-2.5">
                {i + 1}
              </TableCell>
              <TableCell className="p-1 py-2.5">
                <Input
                  value={m.fullName}
                  onChange={(e) => update(m.id, { fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="h-8 border-gray-200 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
              </TableCell>
              <TableCell className="p-1 py-2.5">
                <Select
                  value={m.gender || undefined}
                  onValueChange={(v) =>
                    update(m.id, { gender: v as Member["gender"] })
                  }
                >
                  <SelectTrigger className="h-8 border-gray-200 text-sm focus:ring-1 focus:ring-blue-500">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-1 py-2.5">
                <Input
                  value={m.dob}
                  onChange={(e) => update(m.id, { dob: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="h-8 border-gray-200 text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
              </TableCell>
              <TableCell className="p-1 py-2.5">
                <Select
                  value={m.docType}
                  onValueChange={(v) =>
                    update(m.id, { docType: v as Member["docType"] })
                  }
                >
                  <SelectTrigger className="h-8 border-gray-200 text-sm focus:ring-1 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cccd">CCCD</SelectItem>
                    <SelectItem value="passport">Hộ chiếu</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="p-1 py-2.5">
                <Input
                  value={m.docId}
                  onChange={(e) => update(m.id, { docId: e.target.value })}
                  placeholder={
                    m.docType === "cccd" ? "012345678901" : "B1234567"
                  }
                  className="h-8 border-gray-200 font-mono text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
              </TableCell>
              <TableCell className="p-1 py-2.5">
                <Input
                  value={m.phone}
                  onChange={(e) => update(m.id, { phone: e.target.value })}
                  placeholder="09xx xxx xxx"
                  className="h-8 border-gray-200 font-mono text-sm focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                />
              </TableCell>
              <TableCell className="p-1 py-2.5 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => remove(m.id)}
                  title="Xóa dòng"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
