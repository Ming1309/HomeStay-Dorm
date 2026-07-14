export type LoaiQuyDinh =
  | "DieuKienLuuTru"
  | "NoiQuySinhHoat"
  | "HoSoPhapLyCuTru"
  | "TaiChinhThanhToan"
  | "TaiSanTienIchAnToan"
  | "ViPhamBoiThuong";

export type TrangThaiQuyDinh = "ChuaApDung" | "DangApDung" | "HetHieuLuc";

export type QuyDinhResponse = {
  maQD: string;
  tenQD: string;
  loaiQD: LoaiQuyDinh;
  duongDanFile: string;
  ngayApDung: string;
  ngayKetThuc: string | null;
  trangThai: TrangThaiQuyDinh;
};

export type QuyDinhPayload = {
  tenQD: string;
  loaiQD: LoaiQuyDinh;
  ngayApDung: string;
  ngayKetThuc?: string;
  file?: File | null;
};

const BASE_URL = "/api/admin/regulations";

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

function taoFormData(payload: QuyDinhPayload): FormData {
  const data = new FormData();
  data.set("TenQD", payload.tenQD);
  data.set("LoaiQD", payload.loaiQD);
  data.set("NgayApDung", payload.ngayApDung);
  if (payload.ngayKetThuc) data.set("NgayKetThuc", payload.ngayKetThuc);
  if (payload.file) data.set("File", payload.file);
  return data;
}

export async function layDanhSachQuyDinh(): Promise<QuyDinhResponse[]> {
  return readResponse<QuyDinhResponse[]>(
    await fetch(BASE_URL),
    "Không thể tải danh sách quy định.",
  );
}

export async function themQuyDinh(payload: QuyDinhPayload): Promise<QuyDinhResponse> {
  return readResponse<QuyDinhResponse>(
    await fetch(BASE_URL, { method: "POST", body: taoFormData(payload) }),
    "Không thể tạo quy định.",
  );
}

export async function capNhatQuyDinh(
  maQD: string,
  payload: QuyDinhPayload,
): Promise<QuyDinhResponse> {
  return readResponse<QuyDinhResponse>(
    await fetch(`${BASE_URL}/${encodeURIComponent(maQD)}`, {
      method: "PUT",
      body: taoFormData(payload),
    }),
    "Không thể cập nhật quy định.",
  );
}

export async function xoaQuyDinh(maQD: string): Promise<void> {
  return readNoContent(
    await fetch(`${BASE_URL}/${encodeURIComponent(maQD)}`, { method: "DELETE" }),
    "Không thể xóa quy định.",
  );
}

export async function moVanBanQuyDinh(duongDan: string): Promise<void> {
  const preview = window.open("about:blank", "_blank");
  if (!preview) throw new Error("Trình duyệt đang chặn cửa sổ xem PDF.");
  preview.opener = null;
  try {
    const response = await fetch(duongDan);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(body?.message ?? "Không thể mở văn bản quy định.");
    }
    const url = URL.createObjectURL(await response.blob());
    preview.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    preview.close();
    throw error;
  }
}
