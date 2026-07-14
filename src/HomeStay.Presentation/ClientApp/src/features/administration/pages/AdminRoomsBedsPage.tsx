import { Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useWorkflowStore } from "@/app/providers/workflow-store";
import {
  capNhatGiuong,
  capNhatPhong,
  layDanhSachChiNhanh,
  layDanhSachGiuong,
  layDanhSachLoaiPhong,
  layDanhSachPhong,
  themGiuong,
  themPhong,
  xoaGiuong,
  xoaPhong,
  type ChiNhanhResponse,
  type GiuongResponse,
  type LoaiPhongResponse,
  type PhongResponse,
} from "@/features/administration/services/rooms-beds-service";

const GIOI_TINH_NU = "Nữ";
const GIOI_TINH_TAT_CA = "TatCa";
const KHONG_CO_TOA = "__khong_co_toa__";

// Trang thai admin co the tu dat; cac trang thai coc/hop dong do workflow quan ly.
const ROOM_STATUSES = [
  "Trong",
  "ConGiuongTrong",
  "GiuCho",
  "DaCoc",
  "DangSuDung",
  "DangBaoTri",
  "NgungSuDung",
] as const;
const BED_STATUSES = [
  "Trong",
  "GiuCho",
  "DaCoc",
  "DangSuDung",
  "DangBaoTri",
  "NgungSuDung",
] as const;
const ADMIN_ROOM_STATUS_OPTIONS = new Set<string>(["Trong", "DangBaoTri", "NgungSuDung"]);
const ADMIN_BED_STATUS_OPTIONS = new Set<string>(["Trong", "DangBaoTri", "NgungSuDung"]);

const ROOM_STATUS_LABELS: Record<string, string> = {
  Trong: "Còn trống",
  ConGiuongTrong: "Còn giường trống",
  GiuCho: "Giữ chỗ",
  DaCoc: "Đã cọc",
  DangSuDung: "Đang sử dụng",
  DangBaoTri: "Đang bảo trì",
  NgungSuDung: "Ngừng sử dụng",
};

const BED_STATUS_LABELS: Record<string, string> = {
  Trong: "Trống",
  GiuCho: "Giữ chỗ",
  DaCoc: "Đã cọc",
  DangSuDung: "Đang sử dụng",
  DangBaoTri: "Đang bảo trì",
  NgungSuDung: "Ngừng sử dụng",
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "Trong":
    case "ConGiuongTrong":
      return "bg-emerald-100 text-emerald-700";
    case "DaCoc":
    case "DangSuDung":
      return "bg-blue-100 text-blue-700";
    case "GiuCho":
      return "bg-amber-100 text-amber-700";
    case "NgungSuDung":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function toaNhaValue(room: PhongResponse): string {
  return room.toaNha?.trim() || KHONG_CO_TOA;
}

function normalizeLocationValue(value: string, prefix: "Tòa" | "Tầng"): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  if (/^\d+$/.test(trimmed)) return `${prefix} ${Number(trimmed)}`;
  const withoutPrefix = trimmed.replace(
    prefix === "Tòa" ? /^(tòa|toa)\s+/i : /^(tầng|tang)\s+/i,
    "",
  );
  return `${prefix} ${withoutPrefix}`;
}

function CreatableCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  normalize,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  normalize: (value: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const normalizedSearch = normalize(search);
  const matchingOptions = options.filter((option) =>
    option.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")),
  );
  const canCreate =
    normalizedSearch.length > 0 &&
    !options.some(
      (option) => option.localeCompare(normalizedSearch, "vi", { sensitivity: "base" }) === 0,
    );

  const selectValue = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={value ? "truncate" : "truncate text-muted-foreground"}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} placeholder={searchPlaceholder} />
          <CommandList>
            {matchingOptions.length === 0 && !canCreate ? (
              <CommandEmpty>Không có dữ liệu phù hợp.</CommandEmpty>
            ) : null}
            <CommandGroup>
              {canCreate ? (
                <CommandItem
                  value={`create-${normalizedSearch}`}
                  onSelect={() => selectValue(normalizedSearch)}
                >
                  <Plus className="size-4" />
                  Thêm “{normalizedSearch}”
                </CommandItem>
              ) : null}
              {matchingOptions.map((option) => (
                <CommandItem key={option} value={option} onSelect={() => selectValue(option)}>
                  <Check className={value === option ? "size-4 opacity-100" : "size-4 opacity-0"} />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const roomSchema = z.object({
  soPhong: z.string().trim().min(1, "Vui lòng nhập số phòng").max(20, "Tối đa 20 ký tự"),
  toaNha: z.string().trim().max(50, "Tối đa 50 ký tự"),
  tang: z.string().trim().max(10, "Tối đa 10 ký tự"),
  gioiTinhChoPhep: z.enum(["Nam", GIOI_TINH_NU, GIOI_TINH_TAT_CA]),
  trangThai: z.enum(ROOM_STATUSES),
  maLP: z.string().min(1, "Vui lòng chọn loại phòng"),
  maCN: z.string().min(1, "Vui lòng chọn chi nhánh"),
});

const bedSchema = z.object({
  soGiuong: z.string().trim().min(1, "Vui lòng nhập số giường").max(20, "Tối đa 20 ký tự"),
  maCN: z.string().min(1, "Vui lòng chọn chi nhánh"),
  toaNha: z.string().min(1, "Vui lòng chọn tòa"),
  maPhong: z.string().min(1, "Vui lòng chọn phòng"),
  trangThai: z.enum(BED_STATUSES),
});

type RoomFormValues = z.infer<typeof roomSchema>;
type BedFormValues = z.infer<typeof bedSchema>;

const ROOM_FORM_DEFAULTS: RoomFormValues = {
  soPhong: "",
  toaNha: "",
  tang: "",
  gioiTinhChoPhep: GIOI_TINH_TAT_CA,
  trangThai: "Trong",
  maLP: "",
  maCN: "",
};

const BED_FORM_DEFAULTS: BedFormValues = {
  soGiuong: "",
  maCN: "",
  toaNha: "",
  maPhong: "",
  trangThai: "Trong",
};

export function AdminRoomsBedsPage() {
  const navigate = useNavigate();
  const { role, isHydrated } = useWorkflowStore();

  const [tab, setTab] = useState<"rooms" | "beds">("rooms");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [rooms, setRooms] = useState<PhongResponse[]>([]);
  const [beds, setBeds] = useState<GiuongResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<LoaiPhongResponse[]>([]);
  const [branches, setBranches] = useState<ChiNhanhResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [roomOpen, setRoomOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<PhongResponse | null>(null);
  const [editBed, setEditBed] = useState<GiuongResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "room" | "bed"; id: string } | null>(
    null,
  );

  const roomForm = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: ROOM_FORM_DEFAULTS,
  });
  const bedForm = useForm<BedFormValues>({
    resolver: zodResolver(bedSchema),
    defaultValues: BED_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (isHydrated && role !== "admin") navigate({ to: "/" });
  }, [isHydrated, role, navigate]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [roomList, bedList, typeList, branchList] = await Promise.all([
        layDanhSachPhong({}),
        layDanhSachGiuong({}),
        layDanhSachLoaiPhong(),
        layDanhSachChiNhanh(),
      ]);
      setRooms(roomList);
      setBeds(bedList);
      setRoomTypes(typeList);
      setBranches(branchList);
    } catch (error) {
      const message = errorMessage(error, "Không thể tải dữ liệu phòng / giường.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && role === "admin") void loadData();
  }, [isHydrated, role, loadData]);

  const refreshRooms = useCallback(async () => {
    try {
      setRooms(await layDanhSachPhong({}));
    } catch (error) {
      toast.error(errorMessage(error, "Không thể tải lại danh sách phòng."));
    }
  }, []);

  const refreshBeds = useCallback(async () => {
    try {
      setBeds(await layDanhSachGiuong({}));
    } catch (error) {
      toast.error(errorMessage(error, "Không thể tải lại danh sách giường."));
    }
  }, []);

  const branchName = useCallback(
    (maCN: string) => branches.find((b) => b.maCN === maCN)?.tenChiNhanh ?? maCN,
    [branches],
  );

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((room) => {
      if (branchFilter !== "all" && room.maCN !== branchFilter) return false;
      if (statusFilter !== "all" && room.trangThai !== statusFilter) return false;
      if (!q) return true;
      return [room.soPhong, room.toaNha ?? "", room.tenLoaiPhong, room.tenChiNhanh ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rooms, search, branchFilter, statusFilter]);

  const filteredBeds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return beds.filter((bed) => {
      if (statusFilter !== "all" && bed.trangThai !== statusFilter) return false;
      if (branchFilter !== "all") {
        const parentRoom = rooms.find((room) => room.maPhong === bed.maPhong);
        if (!parentRoom || parentRoom.maCN !== branchFilter) return false;
      }
      if (!q) return true;
      return [bed.soGiuong, bed.maGiuong, bed.soPhong, bed.toaNha ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [beds, rooms, search, branchFilter, statusFilter]);

  const statusFilterOptions = tab === "rooms" ? ROOM_STATUS_LABELS : BED_STATUS_LABELS;

  const openCreateRoom = useCallback(() => {
    setEditRoom(null);
    roomForm.reset({
      ...ROOM_FORM_DEFAULTS,
      maLP: roomTypes[0]?.maLP ?? "",
      maCN: branches[0]?.maCN ?? "",
    });
    setRoomOpen(true);
  }, [branches, roomForm, roomTypes]);

  const openEditRoom = (room: PhongResponse) => {
    setEditRoom(room);
    roomForm.reset({
      soPhong: room.soPhong,
      toaNha: room.toaNha ?? "",
      tang: room.tang ?? "",
      gioiTinhChoPhep:
        room.gioiTinhChoPhep === "Nam"
          ? "Nam"
          : room.gioiTinhChoPhep === GIOI_TINH_NU || room.gioiTinhChoPhep === "Nu"
            ? GIOI_TINH_NU
            : GIOI_TINH_TAT_CA,
      trangThai: ROOM_STATUSES.includes(room.trangThai as (typeof ROOM_STATUSES)[number])
        ? (room.trangThai as (typeof ROOM_STATUSES)[number])
        : "Trong",
      maLP: room.maLP,
      maCN: room.maCN,
    });
    setRoomOpen(true);
  };

  const openCreateBed = useCallback(() => {
    setEditBed(null);
    const firstRoom = rooms[0];
    bedForm.reset({
      ...BED_FORM_DEFAULTS,
      maCN: firstRoom?.maCN ?? "",
      toaNha: firstRoom ? toaNhaValue(firstRoom) : "",
      maPhong: firstRoom?.maPhong ?? "",
    });
    setBedOpen(true);
  }, [bedForm, rooms]);

  const openEditBed = (bed: GiuongResponse) => {
    setEditBed(bed);
    const parentRoom = rooms.find((room) => room.maPhong === bed.maPhong);
    bedForm.reset({
      soGiuong: bed.soGiuong,
      maCN: parentRoom?.maCN ?? "",
      toaNha: parentRoom ? toaNhaValue(parentRoom) : "",
      maPhong: bed.maPhong,
      trangThai: BED_STATUSES.includes(bed.trangThai as (typeof BED_STATUSES)[number])
        ? (bed.trangThai as (typeof BED_STATUSES)[number])
        : "Trong",
    });
    setBedOpen(true);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "n") return;
      event.preventDefault();
      if (tab === "rooms") openCreateRoom();
      else if (rooms.length > 0) openCreateBed();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [openCreateBed, openCreateRoom, rooms.length, tab]);

  const submitRoom = async (values: RoomFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        soPhong: values.soPhong,
        toaNha: values.toaNha.trim() ? values.toaNha : null,
        tang: values.tang.trim() ? values.tang : null,
        gioiTinhChoPhep:
          values.gioiTinhChoPhep === GIOI_TINH_TAT_CA ? null : values.gioiTinhChoPhep,
        maLP: values.maLP,
        maCN: values.maCN,
      };
      if (editRoom)
        await capNhatPhong(editRoom.maPhong, { ...payload, trangThai: values.trangThai });
      else await themPhong(payload);
      await Promise.all([refreshRooms(), refreshBeds()]);
      toast.success(editRoom ? "Cập nhật phòng thành công." : "Thêm phòng mới thành công.");
      setRoomOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể lưu phòng."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBed = async (values: BedFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        soGiuong: values.soGiuong,
        maPhong: values.maPhong,
      };
      if (editBed)
        await capNhatGiuong(editBed.maGiuong, { ...payload, trangThai: values.trangThai });
      else await themGiuong(payload);
      await Promise.all([refreshBeds(), refreshRooms()]);
      toast.success(editBed ? "Cập nhật giường thành công." : "Thêm giường mới thành công.");
      setBedOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể lưu giường."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "room") {
        await xoaPhong(deleteTarget.id);
        await Promise.all([refreshRooms(), refreshBeds()]);
        toast.success("Đã xóa phòng.");
      } else {
        await xoaGiuong(deleteTarget.id);
        await Promise.all([refreshBeds(), refreshRooms()]);
        toast.success("Đã xóa giường.");
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(errorMessage(error, "Không thể xóa bản ghi."));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isHydrated || role !== "admin") return null;

  return (
    <RoomsBedsView
      tab={tab}
      setTab={setTab}
      search={search}
      setSearch={setSearch}
      branchFilter={branchFilter}
      setBranchFilter={setBranchFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      statusFilterOptions={statusFilterOptions}
      branches={branches}
      roomTypes={roomTypes}
      rooms={rooms}
      isLoading={isLoading}
      loadError={loadError}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      filteredRooms={filteredRooms}
      filteredBeds={filteredBeds}
      branchName={branchName}
      roomForm={roomForm}
      bedForm={bedForm}
      roomOpen={roomOpen}
      setRoomOpen={setRoomOpen}
      bedOpen={bedOpen}
      setBedOpen={setBedOpen}
      editRoom={editRoom}
      editBed={editBed}
      deleteTarget={deleteTarget}
      setDeleteTarget={setDeleteTarget}
      openCreateRoom={openCreateRoom}
      openEditRoom={openEditRoom}
      openCreateBed={openCreateBed}
      openEditBed={openEditBed}
      submitRoom={submitRoom}
      submitBed={submitBed}
      confirmDelete={confirmDelete}
      loadData={loadData}
    />
  );
}

type RoomFormApi = ReturnType<typeof useForm<RoomFormValues>>;
type BedFormApi = ReturnType<typeof useForm<BedFormValues>>;

type RoomsBedsViewProps = {
  tab: "rooms" | "beds";
  setTab: (value: "rooms" | "beds") => void;
  search: string;
  setSearch: (value: string) => void;
  branchFilter: string;
  setBranchFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  statusFilterOptions: Record<string, string>;
  branches: ChiNhanhResponse[];
  roomTypes: LoaiPhongResponse[];
  rooms: PhongResponse[];
  isLoading: boolean;
  loadError: string | null;
  isSubmitting: boolean;
  isDeleting: boolean;
  filteredRooms: PhongResponse[];
  filteredBeds: GiuongResponse[];
  branchName: (maCN: string) => string;
  roomForm: RoomFormApi;
  bedForm: BedFormApi;
  roomOpen: boolean;
  setRoomOpen: (value: boolean) => void;
  bedOpen: boolean;
  setBedOpen: (value: boolean) => void;
  editRoom: PhongResponse | null;
  editBed: GiuongResponse | null;
  deleteTarget: { type: "room" | "bed"; id: string } | null;
  setDeleteTarget: (value: { type: "room" | "bed"; id: string } | null) => void;
  openCreateRoom: () => void;
  openEditRoom: (room: PhongResponse) => void;
  openCreateBed: () => void;
  openEditBed: (bed: GiuongResponse) => void;
  submitRoom: (values: RoomFormValues) => void;
  submitBed: (values: BedFormValues) => void;
  confirmDelete: () => void;
  loadData: () => Promise<void>;
};

function RoomsBedsView(props: RoomsBedsViewProps) {
  const {
    tab,
    setTab,
    search,
    setSearch,
    branchFilter,
    setBranchFilter,
    statusFilter,
    setStatusFilter,
    statusFilterOptions,
    branches,
    roomTypes,
    rooms,
    isLoading,
    loadError,
    isSubmitting,
    isDeleting,
    filteredRooms,
    filteredBeds,
    branchName,
    roomForm,
    bedForm,
    roomOpen,
    setRoomOpen,
    bedOpen,
    setBedOpen,
    editRoom,
    editBed,
    deleteTarget,
    setDeleteTarget,
    openCreateRoom,
    openEditRoom,
    openCreateBed,
    openEditBed,
    submitRoom,
    submitBed,
    confirmDelete,
    loadData,
  } = props;

  const recordCount = tab === "rooms" ? filteredRooms.length : filteredBeds.length;

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
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={tab === "rooms" ? openCreateRoom : openCreateBed}
                disabled={isLoading || (tab === "beds" && rooms.length === 0)}
              >
                <Plus className="size-4" />
                {tab === "rooms" ? "Thêm phòng mới" : "Thêm giường mới"}
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:w-[420px]">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm phòng, tòa nhà, giường..."
                  className="h-9 text-sm"
                />
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Chi nhánh</p>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Chi nhánh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.maCN} value={branch.maCN}>
                        {branch.tenChiNhanh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[220px]">
                <p className="mb-1 text-xs font-medium text-gray-600">Trạng thái</p>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {Object.entries(statusFilterOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
          {loadError ? (
            <div className="mb-3 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <span>{loadError}</span>
              <Button variant="outline" size="sm" onClick={() => void loadData()}>
                Thử lại
              </Button>
            </div>
          ) : null}
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "rooms" | "beds")}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="w-fit">
              <TabsTrigger value="rooms">Danh sách Phòng</TabsTrigger>
              <TabsTrigger value="beds">Danh sách Giường</TabsTrigger>
            </TabsList>

            <TabsContent
              value="rooms"
              className="mt-4 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white"
            >
              <RoomsTable
                isLoading={isLoading}
                rooms={filteredRooms}
                branchName={branchName}
                onEdit={openEditRoom}
                onDelete={(id) => setDeleteTarget({ type: "room", id })}
              />
            </TabsContent>

            <TabsContent
              value="beds"
              className="mt-4 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white"
            >
              <BedsTable
                isLoading={isLoading}
                beds={filteredBeds}
                onEdit={openEditBed}
                onDelete={(id) => setDeleteTarget({ type: "bed", id })}
              />
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
          <span>{recordCount} bản ghi</span>
        </footer>
      </section>

      <RoomDialog
        open={roomOpen}
        onOpenChange={setRoomOpen}
        form={roomForm}
        isEdit={Boolean(editRoom)}
        isSubmitting={isSubmitting}
        roomTypes={roomTypes}
        branches={branches}
        rooms={rooms}
        onSubmit={submitRoom}
      />

      <BedDialog
        open={bedOpen}
        onOpenChange={setBedOpen}
        form={bedForm}
        isEdit={Boolean(editBed)}
        isSubmitting={isSubmitting}
        rooms={rooms}
        onSubmit={submitBed}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Quay lại</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function RoomsTable({
  isLoading,
  rooms,
  branchName,
  onEdit,
  onDelete,
}: {
  isLoading: boolean;
  rooms: PhongResponse[];
  branchName: (maCN: string) => string;
  onEdit: (room: PhongResponse) => void;
  onDelete: (maPhong: string) => void;
}) {
  if (isLoading) return <TableSkeleton />;
  if (rooms.length === 0) {
    return (
      <EmptyState message="Không có phòng nào phù hợp. Hãy thêm phòng hoặc điều chỉnh bộ lọc." />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Số phòng</TableHead>
          <TableHead>Tòa nhà</TableHead>
          <TableHead>Chi nhánh</TableHead>
          <TableHead>Giới tính</TableHead>
          <TableHead>Loại phòng</TableHead>
          <TableHead>Sức chứa</TableHead>
          <TableHead className="text-right">Giá thuê</TableHead>
          <TableHead>Giường</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.maPhong}>
            <TableCell className="font-medium">{room.soPhong}</TableCell>
            <TableCell>{room.toaNha ?? "—"}</TableCell>
            <TableCell>{room.tenChiNhanh ?? branchName(room.maCN)}</TableCell>
            <TableCell>{genderLabel(room.gioiTinhChoPhep)}</TableCell>
            <TableCell>{room.tenLoaiPhong}</TableCell>
            <TableCell>{room.sucChua}</TableCell>
            <TableCell className="text-right">
              {new Intl.NumberFormat("vi-VN").format(room.giaThue)} VNĐ
            </TableCell>
            <TableCell>
              {room.soGiuongTrong}/{room.soGiuong}
            </TableCell>
            <TableCell>
              <Badge className={statusBadgeClass(room.trangThai)}>
                {ROOM_STATUS_LABELS[room.trangThai] ?? room.trangThai}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="inline-flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Sửa phòng ${room.soPhong}`}
                  onClick={() => onEdit(room)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  aria-label={`Xóa phòng ${room.soPhong}`}
                  onClick={() => onDelete(room.maPhong)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BedsTable({
  isLoading,
  beds,
  onEdit,
  onDelete,
}: {
  isLoading: boolean;
  beds: GiuongResponse[];
  onEdit: (bed: GiuongResponse) => void;
  onDelete: (maGiuong: string) => void;
}) {
  if (isLoading) return <TableSkeleton />;
  if (beds.length === 0) {
    return (
      <EmptyState message="Không có giường nào phù hợp. Hãy thêm giường hoặc điều chỉnh bộ lọc." />
    );
  }

  return (
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
        {beds.map((bed) => (
          <TableRow key={bed.maGiuong}>
            <TableCell className="font-medium">{bed.maGiuong}</TableCell>
            <TableCell>{bed.soGiuong}</TableCell>
            <TableCell>{bed.soPhong}</TableCell>
            <TableCell>{bed.toaNha ?? "—"}</TableCell>
            <TableCell>
              <Badge className={statusBadgeClass(bed.trangThai)}>
                {BED_STATUS_LABELS[bed.trangThai] ?? bed.trangThai}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="inline-flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Sửa giường ${bed.soGiuong}`}
                  onClick={() => onEdit(bed)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  aria-label={`Xóa giường ${bed.soGiuong}`}
                  onClick={() => onDelete(bed.maGiuong)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function genderLabel(value: string | null): string {
  if (value === "Nam") return "Nam";
  if (value === "Nu") return "Nữ";
  return "Tất cả";
}

function RoomDialog({
  open,
  onOpenChange,
  form,
  isEdit,
  isSubmitting,
  roomTypes,
  branches,
  rooms,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: RoomFormApi;
  isEdit: boolean;
  isSubmitting: boolean;
  roomTypes: LoaiPhongResponse[];
  branches: ChiNhanhResponse[];
  rooms: PhongResponse[];
  onSubmit: (values: RoomFormValues) => void;
}) {
  const selectedBranch = form.watch("maCN");
  const selectedBuilding = form.watch("toaNha");
  const buildingOptions = Array.from(
    new Set(
      rooms
        .filter((room) => room.maCN === selectedBranch)
        .map((room) => room.toaNha?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
  const floorOptions = Array.from(
    new Set(
      rooms
        .filter(
          (room) =>
            room.maCN === selectedBranch && (room.toaNha?.trim() ?? "") === selectedBuilding.trim(),
        )
        .map((room) => room.tang?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</DialogTitle>
          <DialogDescription>Nhập thông tin phòng để lưu vào hệ thống.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="maCN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi nhánh *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("toaNha", "", { shouldDirty: true });
                      form.setValue("tang", "", { shouldDirty: true });
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chi nhánh" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.maCN} value={branch.maCN}>
                          {branch.tenChiNhanh}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="toaNha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tòa nhà</FormLabel>
                    <CreatableCombobox
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        form.setValue("tang", "", { shouldDirty: true });
                      }}
                      options={buildingOptions}
                      placeholder="Chọn hoặc thêm tòa"
                      searchPlaceholder="Nhập tên hoặc số tòa..."
                      normalize={(value) => normalizeLocationValue(value, "Tòa")}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tầng</FormLabel>
                    <CreatableCombobox
                      value={field.value}
                      onChange={field.onChange}
                      options={floorOptions}
                      placeholder="Chọn hoặc thêm tầng"
                      searchPlaceholder="Nhập tên hoặc số tầng..."
                      normalize={(value) => normalizeLocationValue(value, "Tầng")}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="soPhong"
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
              control={form.control}
              name="maLP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại phòng *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.maLP} value={type.maLP}>
                          {type.tenLoaiPhong} ({type.sucChua} chỗ)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={isEdit ? "grid grid-cols-2 gap-3" : undefined}>
              <FormField
                control={form.control}
                name="gioiTinhChoPhep"
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
                        <SelectItem value={GIOI_TINH_NU}>Nữ</SelectItem>
                        <SelectItem value={GIOI_TINH_TAT_CA}>Tất cả</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEdit ? (
                <FormField
                  control={form.control}
                  name="trangThai"
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
                          {ROOM_STATUSES.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              disabled={!ADMIN_ROOM_STATUS_OPTIONS.has(status)}
                            >
                              {ROOM_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function BedDialog({
  open,
  onOpenChange,
  form,
  isEdit,
  isSubmitting,
  rooms,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  form: BedFormApi;
  isEdit: boolean;
  isSubmitting: boolean;
  rooms: PhongResponse[];
  onSubmit: (values: BedFormValues) => void;
}) {
  const selectedBranch = form.watch("maCN");
  const selectedToaNha = form.watch("toaNha");
  const branchOptions = Array.from(
    new Map(
      rooms.map((room) => [room.maCN, { value: room.maCN, label: room.tenChiNhanh ?? room.maCN }]),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label, "vi"));
  const toaNhaOptions = Array.from(
    new Map(
      rooms
        .filter((room) => room.maCN === selectedBranch)
        .map((room) => [
          toaNhaValue(room),
          {
            value: toaNhaValue(room),
            label: room.toaNha?.trim() || "Chưa xác định",
          },
        ]),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label, "vi"));
  const filteredRooms = rooms.filter(
    (room) => room.maCN === selectedBranch && toaNhaValue(room) === selectedToaNha,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa giường" : "Thêm giường mới"}</DialogTitle>
          <DialogDescription>Nhập thông tin giường để lưu vào hệ thống.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="soGiuong"
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
              control={form.control}
              name="maCN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi nhánh *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const firstRoom = rooms.find((room) => room.maCN === value);
                      form.setValue("toaNha", firstRoom ? toaNhaValue(firstRoom) : "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      form.setValue("maPhong", firstRoom?.maPhong ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chi nhánh" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branchOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toaNha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tòa *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const firstRoom = rooms.find(
                        (room) => room.maCN === selectedBranch && toaNhaValue(room) === value,
                      );
                      form.setValue("maPhong", firstRoom?.maPhong ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tòa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toaNhaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maPhong"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredRooms.map((room) => (
                        <SelectItem key={room.maPhong} value={room.maPhong}>
                          Phòng {room.soPhong}
                          {room.tang ? ` · ${room.tang}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEdit ? (
              <FormField
                control={form.control}
                name="trangThai"
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
                        {BED_STATUSES.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            disabled={!ADMIN_BED_STATUS_OPTIONS.has(status)}
                          >
                            {BED_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
