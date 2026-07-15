export type PhieuCocSummary = {
  maPhieuCoc: string;
  maKH: string;
  hoTenKhachHang: string;
  sdt: string;
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
  hinhThucThue: "OGhep" | "NguyenCan";
  soGiuongThue: number;
  thoiDiemCoc: string;
};

export type PhieuCocDetail = PhieuCocSummary & {
  email: string | null;
  gioiTinh: string | null;
  ngaySinh: string | null;
  quocTich: string | null;
  loaiGiayTo: string | null;
  soGiayTo: string | null;
  diaChiThuongTru: string | null;
  sucChua: number;
};

export type NhapHoSoRequest = {
  diaChiThuongTru: string;
  danhSachThanhVien: Array<{
    hoTen: string;
    ngaySinh: string | null;
    gioiTinh: string | null;
    quocTich: string | null;
    loaiGiayTo: string | null;
    soGiayTo: string | null;
    diaChiThuongTru: string | null;
    sdt: string | null;
    email: string | null;
  }> | null;
};

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    Message?: string;
  } | null;
  throw new Error(body?.message ?? body?.Message ?? "Không thể xử lý hồ sơ lưu trú.");
}

export async function layDanhSachChoNhap(text = "") {
  const query = text.trim() ? `?text=${encodeURIComponent(text.trim())}` : "";
  return readResponse<PhieuCocSummary[]>(await fetch(`/api/residence-profiles/pending${query}`));
}

export async function layChiTiet(id: string) {
  return readResponse<PhieuCocDetail>(
    await fetch(`/api/residence-profiles/${encodeURIComponent(id)}`),
  );
}

export async function nhapHoSo(id: string, request: NhapHoSoRequest) {
  return readResponse<PhieuCocDetail>(
    await fetch(`/api/residence-profiles/${encodeURIComponent(id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }),
  );
}
