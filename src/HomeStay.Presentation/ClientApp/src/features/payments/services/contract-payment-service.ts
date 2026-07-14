export type HopDongChoThanhToanItem = {
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  giaThue: number;
  kyThanhToan: number;
  tongTienCanThu: number;
};

export type KhoanThuItem = {
  tenKhoanThu: string;
  soLuongKy: number;
  donGia: number;
  thanhTien: number;
};

export type ChiTietThanhToanItem = {
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  giaThue: number;
  kyThanhToan: number;
  tienThueKyDau: number;
  tienDichVu: number;
  tongCong: number;
  khoanThus: KhoanThuItem[];
};

export type CollectPaymentRequest = {
  maHD: string;
  phuongThucThanhToan: "TienMat" | "ChuyenKhoan";
  anhMinhChung?: string | null;
};

export type CollectPaymentResponse = {
  maPT: string;
  soTienThu: number;
  phuongThucThanhToan: string;
  thoiGian: string;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? "Không thể xử lý yêu cầu.");
}

export async function fetchContractPaymentQueue(signal?: AbortSignal): Promise<HopDongChoThanhToanItem[]> {
  return readResponse<HopDongChoThanhToanItem[]>(
    await fetch("/api/contract-payments/queue", { signal }),
  );
}

export async function fetchContractPaymentDetail(
  maHD: string,
  signal?: AbortSignal,
): Promise<ChiTietThanhToanItem> {
  return readResponse<ChiTietThanhToanItem>(
    await fetch(`/api/contract-payments/${encodeURIComponent(maHD)}`, { signal }),
  );
}

export async function submitContractPayment(
  data: CollectPaymentRequest,
  signal?: AbortSignal,
): Promise<CollectPaymentResponse> {
  return readResponse<CollectPaymentResponse>(
    await fetch("/api/contract-payments/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal,
    }),
  );
}
