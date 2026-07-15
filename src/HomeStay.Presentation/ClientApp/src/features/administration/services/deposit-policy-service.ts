// UC 1.4.28 – Quan ly chinh sach hoan coc.
// Ty le su dung don vi thap phan 0..1 (nhat quan voi API va domain).
// Tang UI nhan x100 khi hien thi va chia /100 truoc khi goi API.

export type ChinhSachHoanCocResponse = {
  maChinhSach: string;
  tenChinhSach: string;
  /** Tỷ lệ thập phân 0..1 */
  tiLe_ChuaKy: number;
  /** Tỷ lệ thập phân 0..1 */
  tiLe_TruocHan_NganHan: number;
  /** Tỷ lệ thập phân 0..1 */
  tiLe_TruocHan_DaiHan: number;
  /** Tỷ lệ thập phân 0..1 */
  tiLe_DungHan: number;
  mocLuuTru: number;
  ngayApDung: string;
  ngayKetThuc: string | null;
  trangThai: "ChuaApDung" | "DangApDung" | "HetHieuLuc";
};

export type TaoPhienBanChinhSachPayload = {
  tenChinhSach: string;
  tiLe_ChuaKy: number;
  tiLe_TruocHan_NganHan: number;
  tiLe_TruocHan_DaiHan: number;
  tiLe_DungHan: number;
  mocLuuTru: number;
  ngayApDung: string;
  ngayKetThuc: string | null;
};

const BASE_URL = "/api/admin/deposit-policy";

async function docPhanHoi<T>(response: Response, fallback: string): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? fallback);
}

export async function layChinhSachHienHanh(): Promise<ChinhSachHoanCocResponse> {
  return docPhanHoi<ChinhSachHoanCocResponse>(
    await fetch(`${BASE_URL}/current`),
    "Không thể tải chính sách hoàn cọc.",
  );
}

export async function layDanhSachChinhSach(): Promise<ChinhSachHoanCocResponse[]> {
  return docPhanHoi<ChinhSachHoanCocResponse[]>(
    await fetch(BASE_URL),
    "Không thể tải lịch sử chính sách hoàn cọc.",
  );
}

export async function taoPhienBanChinhSach(
  payload: TaoPhienBanChinhSachPayload,
): Promise<ChinhSachHoanCocResponse> {
  return docPhanHoi<ChinhSachHoanCocResponse>(
    await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        TenChinhSach: payload.tenChinhSach,
        TiLe_ChuaKy: payload.tiLe_ChuaKy,
        TiLe_TruocHan_NganHan: payload.tiLe_TruocHan_NganHan,
        TiLe_TruocHan_DaiHan: payload.tiLe_TruocHan_DaiHan,
        TiLe_DungHan: payload.tiLe_DungHan,
        MocLuuTru: payload.mocLuuTru,
        NgayApDung: payload.ngayApDung,
        NgayKetThuc: payload.ngayKetThuc,
      }),
    }),
    "Không thể tạo phiên bản chính sách hoàn cọc.",
  );
}
