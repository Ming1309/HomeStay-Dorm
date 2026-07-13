export type DepositLookupItem = {
  maPhieuCoc: string;
  hoTenKhachHang: string;
  sdt: string | null;
  email: string | null;
  soGiayTo: string | null;
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
  hinhThucThue: string;
  soGiuongThue: number;
  tongTien: number;
  thoiDiemCoc: string;
  hanThanhToan: string | null;
  trangThai: string;
  daDongTien: boolean;
  thoiDiemHuy: string | null;
  maNVHuy: string | null;
};

export type DepositLookupDetail = DepositLookupItem & {
  loaiGiayTo: string | null;
  giuongs: Array<{ maGiuong: string; soGiuong: string; trangThai: string }>;
};

export type DepositLookupCriteria = {
  maPhieuCoc?: string;
  sdt?: string;
  email?: string;
  soGiayTo?: string;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? "Không thể xử lý yêu cầu phiếu cọc.");
}

export async function lookupDeposits(criteria: DepositLookupCriteria, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(criteria).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });
  return readResponse<DepositLookupItem[]>(
    await fetch(`/api/deposits/lookup?${params.toString()}`, { signal }),
  );
}

export async function loadDepositLookupDetail(id: string, signal?: AbortSignal) {
  return readResponse<DepositLookupDetail>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/lookup`, { signal }),
  );
}

export async function loadCancellableDeposits(text = "", signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (text.trim()) params.set("text", text.trim());
  return readResponse<DepositLookupItem[]>(
    await fetch(`/api/deposits/cancellable?${params.toString()}`, { signal }),
  );
}

export async function cancelDeposit(id: string) {
  return readResponse<DepositLookupDetail>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
  );
}
