import type { DepositPaymentMethod } from "./deposit-payment-service";

export type ReconciliationDeposit = {
  maPhieuCoc: string;
  hoTenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  tongTien: number;
  phuongThucThanhToan: DepositPaymentMethod | null;
  anhMinhChung: string | null;
};

export type ReconciliationBed = {
  maGiuong: string;
  soGiuong: string;
  trangThai: string;
};

export type ReconciliationDetail = ReconciliationDeposit & {
  sdt: string | null;
  maPhong: string;
  hinhThucThue: "OGhep" | "NguyenCan";
  soGiuongThue: number;
  trangThai: string;
  maNVSale: string | null;
  giuongs: ReconciliationBed[];
};

export type DepositApprovalResult = {
  phieuCoc: ReconciliationDetail;
  maPhieuThu: string;
  soTienThu: number;
  thoiGian: string;
  maNVQuanLy: string;
};

async function readResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "message" in payload && payload.message
        ? payload.message
        : "Không thể xử lý yêu cầu. Vui lòng thử lại.",
    );
  }
  return payload as T;
}

export async function loadReconciliationDeposits(text = "", signal?: AbortSignal) {
  const query = text.trim() ? `?text=${encodeURIComponent(text.trim())}` : "";
  return readResponse<ReconciliationDeposit[]>(
    await fetch(`/api/deposits/cho-doi-chieu${query}`, { signal }),
  );
}

export async function loadReconciliationDetail(id: string, signal?: AbortSignal) {
  return readResponse<ReconciliationDetail>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/xac-nhan-tien-coc`, { signal }),
  );
}

export async function approveDeposit(id: string) {
  return readResponse<DepositApprovalResult>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/xac-nhan-tien-coc`, {
      method: "POST",
    }),
  );
}

export async function requestDepositSupplement(id: string, reason: string) {
  return readResponse<ReconciliationDetail>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/yeu-cau-bo-sung`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyDo: reason }),
    }),
  );
}
