export type PhieuCocChoDuyet = {
  maPhieuCoc: string;
  hoTenKhachHang: string;
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
  hinhThucThue: string;
  soGiuongThue: number;
  tongTien: number;
  thoiDiemCoc: string;
};

export type GiuongDoiChieu = {
  maGiuong: string;
  soGiuong: string;
  trangThai: string;
};

export type ThanhVienDuyet = {
  maKH: string;
  hoTen: string;
  ngaySinh: string | null;
  gioiTinh: string | null;
  quocTich: string | null;
  loaiGiayTo: string | null;
  soGiayTo: string | null;
  sdt: string | null;
  email: string | null;
  diaChiThuongTru: string | null;
  vaiTro: string;
  trangThaiDuyet: string;
};

export type ChiTietXetDuyet = {
  maPhieuCoc: string;
  hoTenKhachHang: string;
  sdt: string | null;
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
  hinhThucThue: string;
  soGiuongThue: number;
  tongTien: number;
  trangThai: string;
  maNVSale: string | null;
  giuongs: GiuongDoiChieu[];
  thanhViens: ThanhVienDuyet[];
};

async function readResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    throw new Error(
      payload?.message ?? payload?.Message ?? "Không thể xử lý yêu cầu. Vui lòng thử lại."
    );
  }
  return payload as T;
}

export async function loadPendingApprovals(text = "", signal?: AbortSignal) {
  const query = text.trim() ? "?text=" + encodeURIComponent(text.trim()) : "";
  return readResponse<PhieuCocChoDuyet[]>(
    await fetch("/api/deposits/cho-duyet" + query, { signal }),
  );
}

export async function loadApprovalDetail(id: string, signal?: AbortSignal) {
  return readResponse<ChiTietXetDuyet>(
    await fetch("/api/deposits/" + encodeURIComponent(id) + "/xet-duyet", { signal }),
  );
}

export async function approveAll(id: string) {
  return readResponse<ChiTietXetDuyet>(
    await fetch("/api/deposits/" + encodeURIComponent(id) + "/xet-duyet/duyet-toan-bo", {
      method: "POST",
    }),
  );
}

export async function rejectMember(id: string, maKH: string) {
  return readResponse<{ message: string }>(
    await fetch("/api/deposits/" + encodeURIComponent(id) + "/xet-duyet/tu-choi-thanh-vien", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maKH }),
    }),
  );
}

export async function approveRemaining(id: string) {
  return readResponse<ChiTietXetDuyet>(
    await fetch("/api/deposits/" + encodeURIComponent(id) + "/xet-duyet/duyet-con-lai", {
      method: "POST",
    }),
  );
}

export async function rejectProfile(id: string) {
  return readResponse<{ message: string }>(
    await fetch("/api/deposits/" + encodeURIComponent(id) + "/xet-duyet/tu-choi-ho-so", {
      method: "POST",
    }),
  );
}

export async function undoRejectMember(id: string, maKH: string) {
  return readResponse<ChiTietXetDuyet>(
    await fetch("/api/deposits/" + encodeURIComponent(id) + "/xet-duyet/hoan-tac-thanh-vien", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maKH }),
    }),
  );
}

