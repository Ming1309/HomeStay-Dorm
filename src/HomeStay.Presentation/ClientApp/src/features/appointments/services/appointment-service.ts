import { z } from "zod";

export type AppointmentType = "view-room" | "checkin" | "checkout";

export type AppointmentRecord = {
  id: string;
  appointmentType: AppointmentType;
  referenceLabel: string;
  branch: string;
  date: string;
  time: string;
  status: string;
};

export type AppointmentDocument = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  status: string;
};

export type BranchOption = { value: string; label: string };

export const APPOINTMENT_TYPES = [
  { value: "view-room", label: "Xem phòng", helper: "Cho phép tìm kiếm Phiếu đăng ký." },
  { value: "checkin", label: "Nhận phòng", helper: "Cho phép tìm kiếm Phiếu cọc đã duyệt." },
  { value: "checkout", label: "Trả phòng", helper: "Cho phép tìm kiếm Hợp đồng đang hiệu lực." },
] as const;

const customerSchema = z.object({
  hoTen: z.string(),
  soGiayTo: z.string().nullish(),
});

const appointmentSchema = z.object({
  maLH: z.string().min(1),
  ngayHen: z.string().min(1),
  gioHen: z.string().min(1),
  loaiLichHen: z.enum(["XemPhong", "NhanPhong", "TraPhong"]),
  trangThai: z.string().min(1),
  maPDK: z.string().nullish(),
  maPhieuCoc: z.string().nullish(),
  maHD: z.string().nullish(),
  maCN: z.string().nullish(),
  khachHang: customerSchema.nullish(),
});

const documentSchema = z.object({
  maPDK: z.string().nullish(),
  maPhieuCoc: z.string().nullish(),
  maHD: z.string().nullish(),
  hoTen: z.string().nullish(),
  sdt: z.string().nullish(),
  trangThai: z.string().min(1),
});

const branchSchema = z.object({
  maCN: z.string().min(1),
  tenChiNhanh: z.string().min(1),
});

const errorSchema = z.object({
  message: z.string().optional(),
  Message: z.string().optional(),
});

function mapType(type: z.infer<typeof appointmentSchema>["loaiLichHen"]): AppointmentType {
  if (type === "NhanPhong") return "checkin";
  if (type === "TraPhong") return "checkout";
  return "view-room";
}

function mapAppointment(value: z.infer<typeof appointmentSchema>): AppointmentRecord {
  const reference = value.maPDK ?? value.maPhieuCoc ?? value.maHD ?? value.maLH;
  const customer = value.khachHang?.hoTen?.trim();
  return {
    id: value.maLH,
    appointmentType: mapType(value.loaiLichHen),
    referenceLabel: customer ? `${reference} - ${customer}` : reference,
    branch: value.maCN ?? "",
    date: value.ngayHen.slice(0, 10),
    time: value.gioHen.slice(0, 5),
    status: value.trangThai,
  };
}

async function readError(response: Response, fallback: string): Promise<Error> {
  const payload = errorSchema.safeParse(await response.json().catch(() => null));
  return new Error(payload.success ? payload.data.message ?? payload.data.Message ?? fallback : fallback);
}

async function readJson<T>(response: Response, schema: z.ZodType<T>, fallback: string): Promise<T> {
  if (!response.ok) throw await readError(response, fallback);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Dữ liệu lịch hẹn từ máy chủ không đúng định dạng.");
  return parsed.data;
}

export const appointmentService = {
  async list(keyword?: string, date?: string, time?: string): Promise<AppointmentRecord[]> {
    const params = new URLSearchParams();
    if (keyword?.trim()) params.set("keyword", keyword.trim());
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    const values = await readJson(
      await fetch(`/api/appointments/all?${params.toString()}`),
      z.array(appointmentSchema),
      "Không thể tải danh sách lịch hẹn.",
    );
    return values.map(mapAppointment);
  },

  async create(data: {
    loaiLichHen: "XemPhong" | "NhanPhong" | "TraPhong";
    maChungTu: string;
    maCN: string;
    ngayHen: string;
    gioHen: string;
  }): Promise<AppointmentRecord> {
    const value = await readJson(
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      appointmentSchema,
      "Không thể tạo lịch hẹn.",
    );
    return mapAppointment(value);
  },

  async fetchDocuments(type: "XemPhong" | "NhanPhong" | "TraPhong", keyword = ""):
    Promise<AppointmentDocument[]> {
    const params = new URLSearchParams({ type });
    if (keyword.trim()) params.set("keyword", keyword.trim());
    const values = await readJson(
      await fetch(`/api/appointments/documents?${params.toString()}`),
      z.array(documentSchema),
      "Không thể tải chứng từ đủ điều kiện.",
    );
    return values.map((value) => {
      const code = value.maPDK ?? value.maPhieuCoc ?? value.maHD;
      if (!code) throw new Error("Chứng từ lịch hẹn thiếu mã tham chiếu.");
      return {
        id: code,
        code,
        customerName: value.hoTen?.trim() || "Chưa có tên khách",
        phone: value.sdt?.trim() || "Chưa có SĐT",
        status: value.trangThai,
      };
    });
  },

  async getBranches(): Promise<BranchOption[]> {
    const values = await readJson(
      await fetch("/api/branches"),
      z.array(branchSchema),
      "Không thể tải danh sách chi nhánh.",
    );
    return values.map((value) => ({ value: value.maCN, label: value.tenChiNhanh }));
  },

  async update(id: string, data: {
    ngayHen: string;
    gioHen: string;
    trangThai: string;
  }): Promise<AppointmentRecord> {
    const value = await readJson(
      await fetch(`/api/appointments/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      appointmentSchema,
      "Không thể cập nhật lịch hẹn.",
    );
    return mapAppointment(value);
  },
};
