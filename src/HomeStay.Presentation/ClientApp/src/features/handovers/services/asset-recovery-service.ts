export type AssetRecoveryListItem = {
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  ngayTraPhong: string;
  gioTraPhong: string;
  maLH: string;
};

export type AssetRecoveryAsset = {
  maTS: string;
  tenTaiSan: string;
  soLuongTieuChuan: number;
  giaTri: number | null;
};

export type AssetRecoveryDetail = {
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  maPhong: string;
  taiSan: AssetRecoveryAsset[];
};

export type AssetRecoveryInput = {
  maTS: string;
  soLuong: number;
  tinhTrang: string;
  ghiChu?: string;
  minhChung?: string;
};

export type LapBienBanThuHoiResult = {
  maBienBan: string;
  ngayBanGiao: string;
  maHD: string;
  loaiBienBan: string;
};

export type UploadProofResult = {
  duongDan: string;
  tenTep: string;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const body = (await response.json().catch(() => null)) as { message?: string; Message?: string } | null;
  throw new Error(body?.message ?? body?.Message ?? "Không thể xử lý yêu cầu thu hồi tài sản.");
}

export async function loadRecoveryContracts(tuKhoa?: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (tuKhoa?.trim()) params.set("tuKhoa", tuKhoa.trim());
  const query = params.toString();
  return readResponse<AssetRecoveryListItem[]>(
    await fetch(`/api/asset-recovery/contracts${query ? `?${query}` : ""}`, { signal }),
  );
}

export async function loadRecoveryContractDetail(maHD: string, signal?: AbortSignal) {
  return readResponse<AssetRecoveryDetail>(
    await fetch(`/api/asset-recovery/contracts/${encodeURIComponent(maHD)}`, { signal }),
  );
}

export async function uploadRecoveryProof(file: File, signal?: AbortSignal) {
  const formData = new FormData();
  formData.append("file", file);
  return readResponse<UploadProofResult>(
    await fetch("/api/asset-recovery/proofs", {
      method: "POST",
      body: formData,
      signal,
    }),
  );
}

export async function saveRecoveryReport(maHD: string, assets: AssetRecoveryInput[]) {
  return readResponse<LapBienBanThuHoiResult>(
    await fetch(`/api/asset-recovery/contracts/${encodeURIComponent(maHD)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assets }),
    }),
  );
}

export function formatReturnDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}
