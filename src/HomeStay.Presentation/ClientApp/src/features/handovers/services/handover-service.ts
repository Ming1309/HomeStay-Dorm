export type HandoverListItem = {
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
};

export type HandoverAsset = {
  maTS: string;
  tenTaiSan: string;
  soLuongTieuChuan: number;
};

export type HandoverDetail = {
  maHD: string;
  tenKhachHang: string;
  soPhong: string;
  toaNha: string | null;
  maPhong: string;
  taiSan: HandoverAsset[];
};

export type HandoverAssetInput = {
  maTS: string;
  soLuong: number;
  tinhTrang: string;
  ghiChu?: string;
};

export type LapBienBanBanGiaoResult = {
  maBienBan: string;
  ngayBanGiao: string;
  maHD: string;
  loaiBienBan: string;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    Message?: string;
  } | null;
  throw new Error(body?.message ?? body?.Message ?? "Không thể xử lý yêu cầu biên bản bàn giao.");
}

export async function loadHandoverContracts(tuKhoa?: string, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (tuKhoa?.trim()) params.set("tuKhoa", tuKhoa.trim());
  const query = params.toString();
  return readResponse<HandoverListItem[]>(
    await fetch(`/api/handover/contracts${query ? `?${query}` : ""}`, { signal }),
  );
}

export async function loadHandoverDetail(maHD: string, signal?: AbortSignal) {
  return readResponse<HandoverDetail>(
    await fetch(`/api/handover/contracts/${encodeURIComponent(maHD)}`, { signal }),
  );
}

export async function saveHandoverReport(maHD: string, assets: HandoverAssetInput[]) {
  return readResponse<LapBienBanBanGiaoResult>(
    await fetch(`/api/handover/contracts/${encodeURIComponent(maHD)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assets }),
    }),
  );
}

export async function cancelHandover(maHD: string) {
  return readResponse<{ message: string; maHD: string }>(
    await fetch(`/api/handover/contracts/${encodeURIComponent(maHD)}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }),
  );
}
