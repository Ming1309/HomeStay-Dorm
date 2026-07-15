import { z } from "zod";

const optionalText = z.string().nullable().optional();

const customerSchema = z.object({
  maKH: optionalText,
  hoTen: z.string().min(1),
  sdt: optionalText,
  email: optionalText,
  gioiTinh: optionalText,
  ngaySinh: optionalText,
  quocTich: optionalText,
  loaiGiayTo: optionalText,
  soGiayTo: optionalText,
});

const appointmentSchema = z.object({
  maLH: z.string().min(1),
  ngayHen: z.string().min(1),
  gioHen: z.string().min(1),
  khachHang: customerSchema,
});

const bedSchema = z.object({
  maGiuong: z.string().min(1),
  soGiuong: z.string().min(1),
  trangThai: z.string().min(1),
});

const roomSchema = z.object({
  maPhong: z.string().min(1),
  soPhong: z.string().min(1),
  toaNha: optionalText,
  gioiTinhChoPhep: optionalText,
  trangThai: z.string().min(1),
  loaiPhong: z.object({
    maLP: z.string().min(1),
    tenLoaiPhong: z.string().min(1),
    giaThue: z.number().finite().nonnegative(),
    sucChua: z.number().int().positive(),
  }),
  giuongs: z.array(bedSchema),
});

export type DepositAppointment = z.infer<typeof appointmentSchema>;
export type DepositRoom = z.infer<typeof roomSchema>;
export type DepositBed = z.infer<typeof bedSchema>;
export type DepositRentalType = "OGhep" | "NguyenCan";

export type DepositCustomerInput = {
  hoTen: string;
  sdt: string;
  ngaySinh: string;
  email?: string;
  gioiTinh: "Nam" | "Nữ";
  quocTich: string;
  loaiGiayTo: "CCCD" | "Hộ chiếu";
  soGiayTo: string;
};

export type DepositRoomFilters = {
  rentalType: DepositRentalType;
  bedCount: number;
  building?: string;
  roomType?: string;
  minPrice?: string;
  maxPrice?: string;
  gender: "Nam" | "Nữ";
};

export class CreateDepositApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CreateDepositApiError";
  }
}

async function readResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const errorPayload = z
      .object({ message: z.string().optional(), Message: z.string().optional() })
      .safeParse(payload);
    throw new CreateDepositApiError(
      errorPayload.success
        ? (errorPayload.data.message ?? errorPayload.data.Message ?? "Không thể xử lý yêu cầu.")
        : "Không thể xử lý yêu cầu.",
      response.status,
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new CreateDepositApiError("Dữ liệu trả về từ hệ thống không đúng định dạng.", 500);
  }
  return parsed.data;
}

export async function loadDepositAppointments(text = "", signal?: AbortSignal) {
  const query = text.trim() ? `?text=${encodeURIComponent(text.trim())}` : "";
  const endpoint = text.trim() ? `/api/appointments/search${query}` : "/api/appointments/pending";
  return readResponse(await fetch(endpoint, { signal }), z.array(appointmentSchema));
}

export async function loadDepositAppointment(id: string, signal?: AbortSignal) {
  return readResponse(
    await fetch(`/api/appointments/${encodeURIComponent(id)}`, { signal }),
    appointmentSchema,
  );
}

export async function loadAvailableDepositRooms(filters: DepositRoomFilters, signal?: AbortSignal) {
  const endpoint = filters.rentalType === "OGhep" ? "available-with-beds" : "available";
  const query = new URLSearchParams({ gioiTinh: filters.gender });
  if (filters.rentalType === "OGhep") query.set("soLuong", String(filters.bedCount));
  if (filters.building) query.set("toaNha", filters.building);
  if (filters.roomType) query.set("loaiPhong", filters.roomType);
  if (filters.minPrice) query.set("giaMin", filters.minPrice);
  if (filters.maxPrice) query.set("giaMax", filters.maxPrice);
  return readResponse(
    await fetch(`/api/rooms/${endpoint}?${query.toString()}`, { signal }),
    z.array(roomSchema),
  );
}

export async function createDeposit(input: {
  appointmentId: string;
  customer: DepositCustomerInput;
  roomId: string;
  bedIds: string[];
  rentalType: DepositRentalType;
}) {
  return readResponse(
    await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        MaLichHen: input.appointmentId,
        KhachHang: {
          HoTen: input.customer.hoTen,
          SDT: input.customer.sdt,
          NgaySinh: new Date(input.customer.ngaySinh).toISOString(),
          Email: input.customer.email || null,
          GioiTinh: input.customer.gioiTinh,
          QuocTich: input.customer.quocTich,
          LoaiGiayTo: input.customer.loaiGiayTo,
          SoGiayTo: input.customer.soGiayTo,
        },
        MaPhong: input.roomId,
        DanhSachGiuong: input.bedIds,
        HinhThucThue: input.rentalType,
      }),
    }),
    z.object({ maPhieuCoc: z.string().min(1) }).passthrough(),
  );
}

export function formatAppointmentDateTime(appointment: DepositAppointment) {
  const date = appointment.ngayHen.slice(0, 10);
  const time = appointment.gioHen.slice(0, 5);
  const value = new Date(`${date}T${time}:00`);
  if (!Number.isFinite(value.getTime())) return `${date} ${time}`;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
