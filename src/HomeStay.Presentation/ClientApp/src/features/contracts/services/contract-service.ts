export type PhieuCocDaDuyet = {
  maPhieuCoc: string;
  hoTenKhachHang: string;
  sdt: string | null;
  soPhong: string;
  toaNha: string | null;
  tenLoaiPhong: string;
  hinhThucThue: string;
  soGiuongThue: number;
  tongTien: number;
  tienCocDaThu: number;
  soThanhVienHopLe: number;
  thoiDiemCoc: string;
};

export type HopDongDaTao = {
  maHD: string;
  maPhieuCoc: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  kyThanhToan: number | null;
  giaThue: number;
  trangThai: string;
};

export type ChiTietPhieuCocResponse = {
  phieuCoc: {
    maPhieuCoc: string;
    maKH: string;
    maPhong: string;
    hinhThucThue: string;
    soGiuongThue: number;
    tongTien: number;
    trangThai: string;
    khachHang: {
      maKH: string;
      hoTen: string;
      sdt: string | null;
      email: string | null;
      gioiTinh: string | null;
      ngaySinh: string | null;
      quocTich: string | null;
      loaiGiayTo: string | null;
      soGiayTo: string | null;
      diaChiThuongTru: string | null;
    };
    phong: {
      maPhong: string;
      soPhong: string;
      toaNha: string | null;
      loaiPhong: {
        maLP: string;
        tenLoaiPhong: string;
        sucChua: number;
        giaThue: number;
      };
    };
    giuongs: Array<{
      maGiuong: string;
      soGiuong: string;
      trangThai: string;
    }>;
  };
  thanhViens: Array<{
    maPhieuCoc: string;
    maKH: string;
    vaiTro: string;
    trangThaiDuyet: string;
  }>;
  dichVus: Array<{
    maDV: string;
    tenDV: string;
    donGia: number;
    donViTinh: string | null;
  }>;
  quyDinhs: Array<{
    maQD: string;
    tenQD: string;
    duongDanFile: string | null;
  }>;
  chinhSachHoanCoc: {
    maChinhSach: string;
    tenChinhSach: string;
    tiLe_ChuaKy: number;
    tiLe_TruocHan_NganHan: number;
    tiLe_TruocHan_DaiHan: number;
    tiLe_DungHan: number;
    mocLuuTru: number;
  } | null;
};

async function readResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function layPhieuCocDaDuyet(
  text?: string,
  signal?: AbortSignal,
): Promise<PhieuCocDaDuyet[]> {
  const params = new URLSearchParams();
  if (text) params.set("text", text);
  const qs = params.toString();
  return readResponse<PhieuCocDaDuyet[]>(
    await fetch(`/api/contracts/approved-deposits${qs ? `?${qs}` : ""}`, { signal }),
  );
}

export async function layChiTietPhieuCoc(
  id: string,
  signal?: AbortSignal,
): Promise<ChiTietPhieuCocResponse> {
  return readResponse<ChiTietPhieuCocResponse>(
    await fetch(`/api/contracts/approved-deposits/${id}`, { signal }),
  );
}

export async function taoHopDong(
  data: {
    maPhieuCoc: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    kyThanhToan: number | null;
    giaThue: number;
    maQD: string | null;
    maDichVus: string[];
  },
  signal?: AbortSignal,
): Promise<HopDongDaTao> {
  return readResponse<HopDongDaTao>(
    await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal,
    }),
  );
}

export async function xacNhanDaKy(id: string, signal?: AbortSignal): Promise<{ maHD: string }> {
  return readResponse<{ maHD: string }>(
    await fetch(`/api/contracts/${id}/confirm-signed`, {
      method: "POST",
      signal,
    }),
  );
}

export async function huyHopDong(id: string, signal?: AbortSignal): Promise<void> {
  await fetch(`/api/contracts/${id}/cancel`, { method: "POST", signal });
}
