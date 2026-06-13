import { Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useWorkflowStore } from "@/app/providers/workflow-store";



type RoomStatus = "Còn trống" | "Đầy" | "Đang bảo trì" | "Đang sử dụng";
type BedStatus = "Trống" | "Giữ chỗ" | "Đã cọc" | "Đang sử dụng" | "Đang bảo trì";

type Room = {
  id: string;
  roomNo: string;
  building: "Toà A" | "Toà B";
  branch: "Chi nhánh 1" | "Chi nhánh 2";
  gender: "Nam" | "Nữ" | "Tất cả";
  roomType: "Phòng 4 người" | "Phòng 6 người";
  capacity: number;
  rent: number;
  bedCount: number;
  status: RoomStatus;
};
type Bed = {
  id: string;
  bedCode: string;
  bedNo: string;
  roomNo: string;
  building: "Toà A" | "Toà B";
  status: BedStatus;
};

const roomSchema = z.object({
  roomNo: z.string().min(1),
  building: z.enum(["Toà A", "Toà B"]),
  branch: z.enum(["Chi nhánh 1", "Chi nhánh 2"]),
  roomType: z.enum(["Phòng 4 người", "Phòng 6 người"]),
  gender: z.enum(["Nam", "Nữ", "Tất cả"]),
});
const bedSchema = z.object({
  bedNo: z.string().min(1),
  roomNo: z.string().min(1),
  status: z.enum(["Trống", "Giữ chỗ", "Đã cọc", "Đang sử dụng", "Đang bảo trì"]),
});

const initialRooms: Room[] = [
  {
    id: "r1",
    roomNo: "P.101",
    building: "Toà A",
    branch: "Chi nhánh 1",
    gender: "Nam",
    roomType: "Phòng 4 người",
    capacity: 4,
    rent: 3200000,
    bedCount: 4,
    status: "Còn trống",
  },
  {
    id: "r2",
    roomNo: "P.204",
    building: "Toà B",
    branch: "Chi nhánh 2",
    gender: "Nữ",
    roomType: "Phòng 6 người",
    capacity: 6,
    rent: 4600000,
    bedCount: 6,
    status: "Đầy",
  },
  {
    id: "r3",
    roomNo: "P.307",
    building: "Toà A",
    branch: "Chi nhánh 1",
    gender: "Tất cả",
    roomType: "Phòng 4 người",
    capacity: 4,
    rent: 3400000,
    bedCount: 4,
    status: "Đang bảo trì",
  },
];
const initialBeds: Bed[] = [
  {
    id: "b1",
    bedCode: "G101-01",
    bedNo: "Giường 1",
    roomNo: "P.101",
    building: "Toà A",
    status: "Trống",
  },
  {
    id: "b2",
    bedCode: "G101-02",
    bedNo: "Giường 2",
    roomNo: "P.101",
    building: "Toà A",
    status: "Đã cọc",
  },
  {
    id: "b3",
    bedCode: "G204-01",
    bedNo: "Giường 1",
    roomNo: "P.204",
    building: "Toà B",
    status: "Đang sử dụng",
  },
];

export function AdminRoomsBedsPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();
  const [tab, setTab] = useState<"rooms" | "beds">("rooms");
  const [search, setSearch] = useState("");
  const [building, setBuilding] = useState<"all" | "Toà A" | "Toà B">("all");
  const [branch, setBranch] = useState<"all" | "Chi nhánh 1" | "Chi nhánh 2">("all");
  const [rooms, setRooms] = useState(initialRooms);
  const [beds, setBeds] = useState(initialBeds);
  const [roomOpen, setRoomOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [editBed, setEditBed] = useState<Bed | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "room" | "bed"; id: string } | null>(
    null,
  );

  const roomForm = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNo: "",
      building: "Toà A",
      branch: "Chi nhánh 1",
      roomType: "Phòng 4 người",
      gender: "Tất cả",
    },
  });
  const bedForm = useForm<z.infer<typeof bedSchema>>({
    resolver: zodResolver(bedSchema),
    defaultValues: { bedNo: "", roomNo: "", status: "Trống" },
  });

  useEffect(() => {
    if (isHydrated && role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((r) => {
        if (building !== "all" && r.building !== building) return false;
        if (branch !== "all" && r.branch !== branch) return false;
        const q = search.toLowerCase();
        return !q || `${r.roomNo} ${r.building}`.toLowerCase().includes(q);
      }),
    [rooms, search, building, branch],
  );

  const filteredBeds = useMemo(
    () =>
      beds.filter((b) => {
        if (building !== "all" && b.building !== building) return false;
        const q = search.toLowerCase();
        return !q || `${b.bedCode} ${b.roomNo} ${b.building}`.toLowerCase().includes(q);
      }),
    [beds, search, building],
  );

  const saveRoom = (v: z.infer<typeof roomSchema>) => {
    if (editRoom) setRooms((p) => p.map((r) => (r.id === editRoom.id ? { ...r, ...v } : r)));
    else
      setRooms((p) => [
        ...p,
        {
          id: `r-${Date.now()}`,
          ...v,
          capacity: v.roomType === "Phòng 4 người" ? 4 : 6,
          bedCount: v.roomType === "Phòng 4 người" ? 4 : 6,
          rent: v.roomType === "Phòng 4 người" ? 3200000 : 4600000,
          status: "Còn trống",
        },
      ]);
    setRoomOpen(false);
    toast.success(editRoom ? "Cập nhật phòng thành công." : "Thêm phòng mới thành công.");
  };

  const saveBed = (v: z.infer<typeof bedSchema>) => {
    const room = rooms.find((r) => r.roomNo === v.roomNo);
    if (!room) return;
    if (editBed)
      setBeds((p) =>
        p.map((b) =>
          b.id === editBed.id
            ? { ...b, bedNo: v.bedNo, roomNo: v.roomNo, building: room.building, status: v.status }
            : b,
        ),
      );
    else
      setBeds((p) => [
        ...p,
        {
          id: `b-${Date.now()}`,
          bedCode: `G${v.roomNo.replace(/\D/g, "")}-${String(p.length + 1).padStart(2, "0")}`,
          bedNo: v.bedNo,
          roomNo: v.roomNo,
          building: room.building,
          status: v.status,
        },
      ]);
    setBedOpen(false);
    toast.success(editBed ? "Cập nhật giường thành công." : "Thêm giường mới thành công.");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "room") {
      const t = rooms.find((r) => r.id === deleteTarget.id);
      if (!t) return;
      if (t.status === "Đang sử dụng")
        return toast.error("Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.");
      setRooms((p) => p.filter((r) => r.id !== t.id));
      toast.success("Đã xóa phòng.");
    } else {
      const t = beds.find((b) => b.id === deleteTarget.id);
      if (!t) return;
      if (t.status === "Đang sử dụng" || t.status === "Đã cọc" || t.status === "Giữ chỗ")
        return toast.error("Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.");
      setBeds((p) => p.filter((b) => b.id !== t.id));
      toast.success("Đã xóa giường.");
    }
    setDeleteTarget(null);
  };

  if (!isHydrated || role !== "admin") return null;

  return (
    <div className="h-full w-full overflow-hidden bg-gray-50">
      <section className="flex h-full flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              <Link to="/admin" className="hover:text-blue-700">
                Tổng quan
              </Link>{" "}
              / <span>Phòng / Giường</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng / giường</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Quản lý danh mục phòng, giường, sức chứa và trạng thái vận hành trong hệ thống.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditRoom(null);
                    roomForm.reset({
                      roomNo: "",
                      building: "Toà A",
                      branch: "Chi nhánh 1",
                      roomType: "Phòng 4 người",
                      gender: "Tất cả",
                    });
                    setRoomOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Thêm phòng mới
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setEditBed(null);
                    bedForm.reset({ bedNo: "", roomNo: rooms[0]?.roomNo ?? "", status: "Trống" });
                    setBedOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Thêm giường mới
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:w-[460px]">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm phòng, tòa nhà, giường..."
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Tòa nhà</p>
                <Select
                  value={building}
                  onValueChange={(v) => setBuilding(v as "all" | "Toà A" | "Toà B")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Tòa nhà" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                    <SelectItem value="Toà A">Toà A</SelectItem>
                    <SelectItem value="Toà B">Toà B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Chi nhánh</p>
                <Select
                  value={branch}
                  onValueChange={(v) => setBranch(v as "all" | "Chi nhánh 1" | "Chi nhánh 2")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                    <SelectItem value="Chi nhánh 1">Chi nhánh 1</SelectItem>
                    <SelectItem value="Chi nhánh 2">Chi nhánh 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden p-6">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "rooms" | "beds")}
            className="flex h-full flex-col"
          >
            <TabsList className="w-fit">
              <TabsTrigger value="rooms">Danh sách Phòng</TabsTrigger>
              <TabsTrigger value="beds">Danh sách Giường</TabsTrigger>
            </TabsList>
            <TabsContent
              value="rooms"
              className="mt-4 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số phòng</TableHead>
                    <TableHead>Tòa nhà</TableHead>
                    <TableHead>Giới tính cho phép</TableHead>
                    <TableHead>Loại phòng</TableHead>
                    <TableHead>Sức chứa</TableHead>
                    <TableHead className="text-right">Giá thuê</TableHead>
                    <TableHead>Số lượng giường</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.roomNo}</TableCell>
                      <TableCell>{r.building}</TableCell>
                      <TableCell>{r.gender}</TableCell>
                      <TableCell>{r.roomType}</TableCell>
                      <TableCell>{r.capacity}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("vi-VN").format(r.rent)} VND
                      </TableCell>
                      <TableCell>{r.bedCount}</TableCell>
                      <TableCell>
                        {r.status === "Còn trống" ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Còn trống</Badge>
                        ) : r.status === "Đầy" ? (
                          <Badge className="bg-red-100 text-red-700">Đầy</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">Đang bảo trì</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditRoom(r);
                              roomForm.reset({
                                roomNo: r.roomNo,
                                building: r.building,
                                branch: r.branch,
                                roomType: r.roomType,
                                gender: r.gender,
                              });
                              setRoomOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteTarget({ type: "room", id: r.id })}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent
              value="beds"
              className="mt-4 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giường</TableHead>
                    <TableHead>Số giường</TableHead>
                    <TableHead>Thuộc phòng</TableHead>
                    <TableHead>Tòa nhà</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeds.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.bedCode}</TableCell>
                      <TableCell>{b.bedNo}</TableCell>
                      <TableCell>{b.roomNo}</TableCell>
                      <TableCell>{b.building}</TableCell>
                      <TableCell>
                        {b.status === "Trống" ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Trống</Badge>
                        ) : b.status === "Đang sử dụng" ? (
                          <Badge className="bg-blue-100 text-blue-700">Đang sử dụng</Badge>
                        ) : b.status === "Đang bảo trì" ? (
                          <Badge className="bg-gray-200 text-gray-700">Đang bảo trì</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">{b.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditBed(b);
                              bedForm.reset({ bedNo: b.bedNo, roomNo: b.roomNo, status: b.status });
                              setBedOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteTarget({ type: "bed", id: b.id })}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
        <footer className="flex h-12 items-center justify-between border-t border-gray-200 bg-white px-6 text-xs text-gray-500">
          <span>
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]">
              N
            </kbd>{" "}
            : Thêm mới
          </span>
          <span>{tab === "rooms" ? filteredRooms.length : filteredBeds.length} bản ghi</span>
        </footer>
      </section>

      <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin phòng để lưu vào hệ thống.</DialogDescription>
          </DialogHeader>
          <Form {...roomForm}>
            <form className="space-y-3" onSubmit={roomForm.handleSubmit(saveRoom)}>
              <FormField
                control={roomForm.control}
                name="roomNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số phòng *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roomForm.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tòa nhà *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Toà A">Toà A</SelectItem>
                        <SelectItem value="Toà B">Toà B</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roomForm.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi nhánh *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Chi nhánh 1">Chi nhánh 1</SelectItem>
                        <SelectItem value="Chi nhánh 2">Chi nhánh 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roomForm.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại phòng *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Phòng 4 người">Phòng 4 người</SelectItem>
                        <SelectItem value="Phòng 6 người">Phòng 6 người</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roomForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính cho phép *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Tất cả">Tất cả</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRoomOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={bedOpen} onOpenChange={setBedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBed ? "Chỉnh sửa giường" : "Thêm giường mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin giường để lưu vào hệ thống.</DialogDescription>
          </DialogHeader>
          <Form {...bedForm}>
            <form className="space-y-3" onSubmit={bedForm.handleSubmit(saveBed)}>
              <FormField
                control={bedForm.control}
                name="bedNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số giường *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bedForm.control}
                name="roomNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thuộc phòng *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((r) => (
                          <SelectItem key={r.id} value={r.roomNo}>
                            {r.roomNo} • {r.building}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bedForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Trống">Trống</SelectItem>
                        <SelectItem value="Giữ chỗ">Giữ chỗ</SelectItem>
                        <SelectItem value="Đã cọc">Đã cọc</SelectItem>
                        <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
                        <SelectItem value="Đang bảo trì">Đang bảo trì</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setBedOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
