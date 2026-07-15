import type { TrangThaiDanhMuc } from "./service-catalog-service";

export type LoaiTaiSan = "NoiThat" | "ThietBiDien" | "TienIchBanGiao";

export type TaiSanResponse = {
  maTS: string;
  tenTaiSan: string;
  loaiTaiSan: LoaiTaiSan;
  giaTri: number;
  moTa: string | null;
  trangThai: TrangThaiDanhMuc;
};

export type TaiSanPayload = Omit<TaiSanResponse, "maTS">;

const BASE_URL = "/api/admin/assets";

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? fallback);
}

async function readNoContent(response: Response, fallback: string): Promise<void> {
  if (response.ok) return;
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? fallback);
}

export async function layDanhSachTaiSan(): Promise<TaiSanResponse[]> {
  return readResponse<TaiSanResponse[]>(await fetch(BASE_URL), "Không thể tải danh sách tài sản.");
}

export async function themTaiSan(payload: TaiSanPayload): Promise<TaiSanResponse> {
  return readResponse<TaiSanResponse>(
    await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể tạo tài sản.",
  );
}

export async function capNhatTaiSan(maTS: string, payload: TaiSanPayload): Promise<TaiSanResponse> {
  return readResponse<TaiSanResponse>(
    await fetch(`${BASE_URL}/${encodeURIComponent(maTS)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể cập nhật tài sản.",
  );
}

export async function xoaTaiSan(maTS: string): Promise<void> {
  return readNoContent(
    await fetch(`${BASE_URL}/${encodeURIComponent(maTS)}`, { method: "DELETE" }),
    "Không thể xóa tài sản.",
  );
}
