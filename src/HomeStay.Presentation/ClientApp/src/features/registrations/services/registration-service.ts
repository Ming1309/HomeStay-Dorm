import { z } from "zod";

export interface CustomerInfo {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  gender: "male" | "female" | "other";
  idType: "cccd" | "passport" | "other";
  idNumber: string;
}

export interface AccommodationInfo {
  numberOfPeople: string;
  roomType: "whole-room" | "shared-room";
  rentalType: string;
  rentalDuration: string;
  desiredArea: string;
  priceRange: string;
  moveInDate: string;
}

export interface PreferenceInfo {
  quietHours?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  parkingRequired: boolean;
  acRequired: boolean;
  wifiRequired: boolean;
  kitchenRequired: boolean;
  gymRequired: boolean;
  laundryRequired: boolean;
  securityRequired: boolean;
  petFriendly?: boolean;
  smokingAllowed?: boolean;
}

export interface RegistrationData extends CustomerInfo, AccommodationInfo {
  preferences?: PreferenceInfo;
  notes?: string;
}

const customerSchema = z.object({
  maKH: z.string(),
  hoTen: z.string(),
  gioiTinh: z.string().nullish(),
  loaiGiayTo: z.string().nullish(),
  soGiayTo: z.string().nullish(),
  diaChiThuongTru: z.string().nullish(),
  sdt: z.string().nullish(),
  email: z.string().nullish(),
});

export const registrationApiSchema = z.object({
  maPDK: z.string().min(1),
  khuVuc: z.string().nullish(),
  soLuongNguoi: z.number().int().nullish(),
  loaiDichVu: z.string().nullish(),
  mucGia: z.number().nullish(),
  thoiGianDuKienVao: z.string().nullish(),
  thoiHanThue: z.number().int().nullish(),
  yeuCauKhac: z.string().nullish(),
  trangThai: z.string().min(1),
  maKH: z.string().min(1),
  maNV: z.string().nullish(),
  khachHang: customerSchema.nullish(),
});

export type RegistrationApiDto = z.infer<typeof registrationApiSchema>;

export interface RegistrationResponse {
  id: string;
  registrationNumber: string;
  status: string;
  data: RegistrationData;
}

export type RegistrationSearchParams = {
  sdt?: string;
  soGiayTo?: string;
  email?: string;
  hoTen?: string;
  maPDK?: string;
};

const errorSchema = z.object({
  message: z.string().optional(),
  Message: z.string().optional(),
});

async function readError(response: Response, fallback: string): Promise<Error> {
  const payload = errorSchema.safeParse(await response.json().catch(() => null));
  return new Error(payload.success ? payload.data.message ?? payload.data.Message ?? fallback : fallback);
}

async function readJson<T>(response: Response, schema: z.ZodType<T>, fallback: string): Promise<T> {
  if (!response.ok) throw await readError(response, fallback);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Dữ liệu phiếu đăng ký từ máy chủ không đúng định dạng.");
  return parsed.data;
}

function rentalMonths(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
}

function priceCeiling(value: string): number {
  const ceilings: Record<string, number> = {
    "1-3m": 3_000_000,
    "3-5m": 5_000_000,
    "5-7m": 7_000_000,
    "7-10m": 10_000_000,
    "10m+": 10_000_000,
  };
  return ceilings[value] ?? 3_000_000;
}

export function formatArea(area: string): string {
  const areas: Record<string, string> = {
    "area-a": "Khu vực A",
    "area-b": "Khu vực B",
    "area-c": "Khu vực C",
    "area-d": "Khu vực D",
  };
  return areas[area] ?? area;
}

export function formatPriceRange(range: string): string {
  const ranges: Record<string, string> = {
    "1-3m": "1 - 3 triệu VNĐ",
    "3-5m": "3 - 5 triệu VNĐ",
    "5-7m": "5 - 7 triệu VNĐ",
    "7-10m": "7 - 10 triệu VNĐ",
    "10m+": "> 10 triệu VNĐ",
  };
  return ranges[range] ?? range;
}

export function formatRentalType(type: string): string {
  const types: Record<string, string> = {
    "short-term": "Thuê ngắn hạn",
    "long-term": "Thuê dài hạn",
    semester: "Thuê theo học kỳ",
    yearly: "Thuê theo năm",
  };
  return types[type] ?? type;
}

export function getPreferenceLabel(id: string): string {
  const preferences: Record<string, string> = {
    wifi: "WiFi miễn phí",
    ac: "Điều hòa",
    "water-heater": "Nước nóng",
    kitchen: "Bếp chung",
    gym: "Phòng tập",
    parking: "Chỗ để xe",
    laundry: "Giặt sấy",
    security: "Bảo vệ 24/7",
  };
  return preferences[id] ?? id;
}

export async function createRegistration(data: RegistrationData): Promise<RegistrationResponse> {
  const value = await readJson(
    await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hoTen: data.customerName,
        gioiTinh: data.gender === "male" ? "Nam" : data.gender === "female" ? "Nữ" : "Khác",
        sdt: data.phone,
        email: data.email,
        diaChiThuongTru: data.address,
        loaiGiayTo: data.idType === "cccd" ? "CCCD" : data.idType === "passport" ? "Hộ chiếu" : "Khác",
        soGiayTo: data.idNumber,
        khuVuc: formatArea(data.desiredArea),
        soLuongNguoi: Number.parseInt(data.numberOfPeople, 10) || 1,
        loaiDichVu: data.roomType === "whole-room" ? "NguyenCan" : "OGhep",
        mucGia: priceCeiling(data.priceRange),
        thoiGianDuKienVao: data.moveInDate,
        thoiHanThue: rentalMonths(data.rentalDuration),
        yeuCauKhac: data.notes?.trim() || null,
      }),
    }),
    registrationApiSchema,
    "Không thể tạo phiếu đăng ký.",
  );
  return { id: value.maPDK, registrationNumber: value.maPDK, status: value.trangThai, data };
}

const DRAFT_KEY = "registration-draft";

export async function saveRegistrationDraft(data: RegistrationData): Promise<RegistrationResponse> {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  return { id: "draft", registrationNumber: "DRAFT", status: "draft", data };
}

export function loadRegistrationDraft(): RegistrationData | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegistrationData;
  } catch {
    localStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

export function clearRegistrationDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^[0-9]{10,11}$/.test(phone.replace(/\D/g, ""));
}

export async function searchRegistrations(paramsValue: RegistrationSearchParams): Promise<RegistrationApiDto[]> {
  const params = new URLSearchParams();
  Object.entries(paramsValue).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });
  return readJson(
    await fetch(`/api/registrations/search?${params.toString()}`),
    z.array(registrationApiSchema),
    "Không thể tra cứu phiếu đăng ký.",
  );
}

export const registrationService = {
  create: createRegistration,
  saveDraft: saveRegistrationDraft,
  async loadDraft(): Promise<RegistrationData | null> {
    return loadRegistrationDraft();
  },
  async clearDraft(): Promise<void> {
    clearRegistrationDraft();
  },
  search: searchRegistrations,
};
