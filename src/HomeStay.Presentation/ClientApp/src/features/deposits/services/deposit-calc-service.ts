export type DepositInitialSummary = {
  maPhieuCoc: string;
  maKH: string;
  hoTenKhachHang: string;
  maPhong: string;
  soPhong: string;
  toaNha?: string | null;
  hinhThucThue: "OGhep" | "NguyenCan";
  thoiDiemCoc: string;
};

export type DepositCalculation = DepositInitialSummary & {
  sdt?: string | null;
  email?: string | null;
  giaThue: number;
  sucChua: number;
  soGiuongTinhTien: number;
  tongTien: number;
  trangThai: string;
  giuongs: Array<{ maGiuong: string; soGiuong: string; trangThai: string }>;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    Message?: string;
  } | null;
  throw new Error(body?.message ?? body?.Message ?? "Không thể xử lý phiếu cọc.");
}

export async function layDanhSachKhoiTao(text = "") {
  const query = text.trim() ? `?text=${encodeURIComponent(text.trim())}` : "";
  return readResponse<DepositInitialSummary[]>(await fetch(`/api/deposits/initial${query}`));
}

export async function layChiTietTinhTien(id: string) {
  return readResponse<DepositCalculation>(await fetch(`/api/deposits/${encodeURIComponent(id)}`));
}

export async function xacNhanTinhTien(id: string) {
  return readResponse<DepositCalculation>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/xac-nhan-tinh-tien`, { method: "POST" }),
  );
}
