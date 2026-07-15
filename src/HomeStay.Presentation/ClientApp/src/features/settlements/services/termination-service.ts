export type HopDongChoThanhLy = {
  maHD: string;
  tenKhachHang: string;
  sdt: string | null;
  soPhong: string;
  toaNha: string | null;
  ngayBatDau: string;
  ngayKetThuc: string;
  tienCoc: number;
  maPDS: string;
  tienHoan: number;
  tienThuThem: number;
  tongKhauTru: number;
  trangThaiPDS: string;
  coTheThanhLy: boolean;
};

export type GiuongThanhLy = {
  maGiuong: string;
  soGiuong: string;
  trangThaiThue: string;
};

export type ChiTietThanhLyHopDong = {
  maHD: string;
  trangThai: string;
  tenKhachHang: string;
  sdt: string | null;
  soPhong: string;
  toaNha: string | null;
  ngayBatDau: string;
  ngayKetThuc: string;
  tienCoc: number;
  maPDS: string;
  ngayDoiSoat: string;
  tyLeHoanCoc: number;
  tongKhauTru: number;
  tienHoan: number;
  tienThuThem: number;
  trangThaiPDS: string;
  coTheThanhLy: boolean;
  lyDoChan: string | null;
  giuongs: GiuongThanhLy[];
};

export type ThanhLyConfirmations = {
  liquidationSigned: boolean;
  keysRecovered: boolean;
};

export type ThanhLyHopDongResult = {
  maHD: string;
  trangThai: string;
  ngayThanhLy: string;
  maPDS: string;
  tienHoan: number;
  tienThuThem: number;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const body = (await response.json().catch(() => null)) as
    | { message?: string; Message?: string }
    | null;
  throw new Error(
    body?.message ?? body?.Message ?? "Không thể xử lý yêu cầu thanh lý hợp đồng.",
  );
}

export async function loadDanhSachChoThanhLy(text?: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (text?.trim()) params.set("text", text.trim());
  const query = params.toString();
  return readResponse<HopDongChoThanhLy[]>(
    await fetch(`/api/terminations/cho-thanh-ly${query ? `?${query}` : ""}`, { signal }),
  );
}

export async function loadChiTietThanhLy(maHD: string, signal?: AbortSignal) {
  return readResponse<ChiTietThanhLyHopDong>(
    await fetch(`/api/terminations/${encodeURIComponent(maHD)}`, { signal }),
  );
}

export async function thanhLyHopDong(
  maHD: string,
  confirmations: ThanhLyConfirmations,
  ghiChu?: string,
) {
  return readResponse<ThanhLyHopDongResult>(
    await fetch("/api/terminations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maHD,
        ghiChu: ghiChu?.trim() || null,
        confirmations,
      }),
    }),
  );
}

export function formatCurrencyVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

export function formatDateVi(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export function formatPhong(toaNha: string | null | undefined, soPhong: string): string {
  return toaNha ? `${toaNha} - ${soPhong}` : soPhong;
}
