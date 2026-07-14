export type DepositPaymentMethod = "ChuyenKhoan" | "TienMat";

export type PendingDeposit = {
  maPhieuCoc: string;
  hoTenKhachHang: string;
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
  tongTien: number;
  hanThanhToan: string | null;
  lyDoYeuCauBoSung: string | null;
};

export type DepositPaymentDetail = PendingDeposit & {
  sdt: string | null;
  hinhThucThue: "OGhep" | "NguyenCan";
  soGiuongThue: number;
  trangThai: string;
  phuongThucThanhToan: DepositPaymentMethod | null;
  anhMinhChung: string | null;
};

export class DepositPaymentApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "DepositPaymentApiError";
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (!response.ok) {
    throw new DepositPaymentApiError(
      payload && typeof payload === "object" && "message" in payload && payload.message
        ? payload.message
        : "Không thể xử lý yêu cầu. Vui lòng thử lại.",
      response.status,
    );
  }
  return payload as T;
}

export async function loadPendingDeposits(text = "", signal?: AbortSignal) {
  const query = text.trim() ? `?text=${encodeURIComponent(text.trim())}` : "";
  return readResponse<PendingDeposit[]>(
    await fetch(`/api/deposits/cho-thanh-toan${query}`, { signal }),
  );
}

export async function loadDepositPaymentDetail(id: string, signal?: AbortSignal) {
  return readResponse<DepositPaymentDetail>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/ghi-nhan-thanh-toan`, { signal }),
  );
}

export async function submitDepositPayment(
  id: string,
  paymentMethod: DepositPaymentMethod,
  proof: File,
) {
  const form = new FormData();
  form.append("PhuongThucThanhToan", paymentMethod);
  form.append("ChungTu", proof);
  return readResponse<DepositPaymentDetail>(
    await fetch(`/api/deposits/${encodeURIComponent(id)}/ghi-nhan-thanh-toan`, {
      method: "POST",
      body: form,
    }),
  );
}
