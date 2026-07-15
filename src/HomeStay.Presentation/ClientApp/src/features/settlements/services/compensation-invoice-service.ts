export type BienBanThuHoiChuaXuLy = {
  maBienBan: string;
  ngayBanGiao: string;
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  tenNguoiLap: string | null;
};

export type TaiSanHuHong = {
  maTS: string;
  tenTaiSan: string;
  tinhTrang: string;
  soLuong: number;
  ghiChu: string | null;
  minhChung: string | null;
  giaTriGoiY: number | null;
};

export type ChiTietBienBanThuHoi = {
  maBienBan: string;
  ngayBanGiao: string;
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  tenNguoiLap: string | null;
  maNV: string | null;
  taiSanHuHong: TaiSanHuHong[];
};

export type KhoanBoiThuongInput = {
  maTS: string;
  soLuong: number;
  donGia: number;
};

export type LapHoaDonBoiThuongResult = {
  maHoaDon: string;
  tongTien: number;
  trangThai: string;
  maBienBan: string;
  maHD: string;
  tenKhachHang: string;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const body = (await response.json().catch(() => null)) as
    | { message?: string; Message?: string }
    | null;
  throw new Error(
    body?.message ?? body?.Message ?? "Không thể xử lý yêu cầu lập hóa đơn bồi thường.",
  );
}

export async function loadBienBanChuaXuLy(text?: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (text?.trim()) params.set("text", text.trim());
  const query = params.toString();
  return readResponse<BienBanThuHoiChuaXuLy[]>(
    await fetch(`/api/compensation/bien-ban-chua-xu-ly${query ? `?${query}` : ""}`, {
      signal,
    }),
  );
}

export async function loadChiTietBienBan(maBienBan: string, signal?: AbortSignal) {
  return readResponse<ChiTietBienBanThuHoi>(
    await fetch(`/api/compensation/bien-ban/${encodeURIComponent(maBienBan)}`, { signal }),
  );
}

export async function createHoaDonBoiThuong(
  maBienBan: string,
  chiTiet: KhoanBoiThuongInput[],
  ghiChu?: string,
) {
  return readResponse<LapHoaDonBoiThuongResult>(
    await fetch("/api/compensation/hoa-don", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maBienBan,
        chiTiet,
        ghiChu: ghiChu || null,
      }),
    }),
  );
}

export function formatCurrencyVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

export function formatDateVi(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

/** Extract proof file name from stored path like `/api/asset-recovery/proofs/xxx.png`. */
export function proofFileName(minhChung: string | null | undefined): string | null {
  if (!minhChung?.trim()) return null;
  const parts = minhChung.trim().replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || null;
}
