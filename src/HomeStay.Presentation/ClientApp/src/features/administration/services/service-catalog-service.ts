export type TrangThaiDanhMuc = "DangApDung" | "NgungApDung";

export type DichVuResponse = {
  maDV: string;
  tenDV: string;
  donViTinh: string;
  donGia: number;
  trangThai: TrangThaiDanhMuc;
};

export type DichVuPayload = Omit<DichVuResponse, "maDV">;

const BASE_URL = "/api/admin/services";

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

export async function layDanhSachDichVu(): Promise<DichVuResponse[]> {
  return readResponse<DichVuResponse[]>(await fetch(BASE_URL), "Không thể tải danh sách dịch vụ.");
}

export async function themDichVu(payload: DichVuPayload): Promise<DichVuResponse> {
  return readResponse<DichVuResponse>(
    await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể tạo dịch vụ.",
  );
}

export async function capNhatDichVu(maDV: string, payload: DichVuPayload): Promise<DichVuResponse> {
  return readResponse<DichVuResponse>(
    await fetch(`${BASE_URL}/${encodeURIComponent(maDV)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
    "Không thể cập nhật dịch vụ.",
  );
}

export async function xoaDichVu(maDV: string): Promise<void> {
  return readNoContent(
    await fetch(`${BASE_URL}/${encodeURIComponent(maDV)}`, { method: "DELETE" }),
    "Không thể xóa dịch vụ.",
  );
}
