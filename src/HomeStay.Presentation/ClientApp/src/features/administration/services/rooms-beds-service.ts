// UC 1.4.25 - Dich vu goi API quan ly phong / giuong (vai tro QuanTri).

export type PhongResponse = {
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
  tang: string | null;
  gioiTinhChoPhep: string | null;
  trangThai: string;
  maLP: string;
  tenLoaiPhong: string;
  sucChua: number;
  giaThue: number;
  maCN: string;
  tenChiNhanh: string | null;
  soGiuong: number;
  soGiuongTrong: number;
};

export type GiuongResponse = {
  maGiuong: string;
  soGiuong: string;
  trangThai: string;
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
};

export type LoaiPhongResponse = {
  maLP: string;
  tenLoaiPhong: string;
  sucChua: number;
  giaThue: number;
};

export type ChiNhanhResponse = {
  maCN: string;
  tenChiNhanh: string;
  diaChi: string;
  sdt: string;
};

export type PhongPayload = {
  soPhong: string;
  toaNha: string | null;
  tang: string | null;
  gioiTinhChoPhep: string | null;
  trangThai: string;
  maLP: string;
  maCN: string;
};

export type TaoPhongPayload = Omit<PhongPayload, "trangThai">;

export type GiuongPayload = {
  soGiuong: string;
  trangThai: string;
  maPhong: string;
};

export type TaoGiuongPayload = Omit<GiuongPayload, "trangThai">;

const ROOMS_BEDS_BASE = "/api/admin/rooms-beds";

async function readResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    Message?: string;
  } | null;
  throw new Error(body?.message ?? body?.Message ?? fallbackMessage);
}

async function readNoContent(response: Response, fallbackMessage: string): Promise<void> {
  if (response.ok) return;
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    Message?: string;
  } | null;
  throw new Error(body?.message ?? body?.Message ?? fallbackMessage);
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const trimmed = value?.trim();
    if (trimmed) search.set(key, trimmed);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

// ---- Phong ----

export async function layDanhSachPhong(filters: {
  text?: string;
  maCN?: string;
  toaNha?: string;
  trangThai?: string;
}): Promise<PhongResponse[]> {
  const query = buildQuery(filters);
  return readResponse<PhongResponse[]>(
    await fetch(`${ROOMS_BEDS_BASE}/rooms${query}`),
    "Không thể tải danh sách phòng.",
  );
}

export async function themPhong(payload: TaoPhongPayload): Promise<PhongResponse> {
  return readResponse<PhongResponse>(
    await fetch(`${ROOMS_BEDS_BASE}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể tạo phòng.",
  );
}

export async function capNhatPhong(maPhong: string, payload: PhongPayload): Promise<PhongResponse> {
  return readResponse<PhongResponse>(
    await fetch(`${ROOMS_BEDS_BASE}/rooms/${encodeURIComponent(maPhong)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể cập nhật phòng.",
  );
}

export async function xoaPhong(maPhong: string): Promise<void> {
  return readNoContent(
    await fetch(`${ROOMS_BEDS_BASE}/rooms/${encodeURIComponent(maPhong)}`, { method: "DELETE" }),
    "Không thể xóa phòng.",
  );
}

// ---- Giuong ----

export async function layDanhSachGiuong(filters: {
  text?: string;
  maPhong?: string;
  trangThai?: string;
}): Promise<GiuongResponse[]> {
  const query = buildQuery(filters);
  return readResponse<GiuongResponse[]>(
    await fetch(`${ROOMS_BEDS_BASE}/beds${query}`),
    "Không thể tải danh sách giường.",
  );
}

export async function themGiuong(payload: TaoGiuongPayload): Promise<GiuongResponse> {
  return readResponse<GiuongResponse>(
    await fetch(`${ROOMS_BEDS_BASE}/beds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể tạo giường.",
  );
}

export async function capNhatGiuong(
  maGiuong: string,
  payload: GiuongPayload,
): Promise<GiuongResponse> {
  return readResponse<GiuongResponse>(
    await fetch(`${ROOMS_BEDS_BASE}/beds/${encodeURIComponent(maGiuong)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể cập nhật giường.",
  );
}

export async function xoaGiuong(maGiuong: string): Promise<void> {
  return readNoContent(
    await fetch(`${ROOMS_BEDS_BASE}/beds/${encodeURIComponent(maGiuong)}`, { method: "DELETE" }),
    "Không thể xóa giường.",
  );
}

// ---- Danh muc phu tro ----

export async function layDanhSachLoaiPhong(): Promise<LoaiPhongResponse[]> {
  return readResponse<LoaiPhongResponse[]>(
    await fetch(`${ROOMS_BEDS_BASE}/room-types`),
    "Không thể tải danh sách loại phòng.",
  );
}

export async function layDanhSachChiNhanh(): Promise<ChiNhanhResponse[]> {
  return readResponse<ChiNhanhResponse[]>(
    await fetch(`${ROOMS_BEDS_BASE}/branches`),
    "Không thể tải danh sách chi nhánh.",
  );
}
