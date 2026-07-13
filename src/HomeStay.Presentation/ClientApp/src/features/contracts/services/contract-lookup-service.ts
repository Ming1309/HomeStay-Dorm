export type ContractLookupItem = {
  maHD: string;
  hoTenKhachHang: string;
  sdt: string | null;
  soGiayTo: string | null;
  maPhong: string;
  soPhong: string;
  toaNha: string | null;
  tenLoaiPhong: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  kyThanhToan: number | null;
  giaThue: number;
  tienCoc: number;
  trangThai: string;
};

export type ContractMember = {
  maKH: string;
  hoTen: string;
  sdt: string | null;
  gioiTinh: string | null;
  ngaySinh: string | null;
  loaiGiayTo: string | null;
  soGiayTo: string | null;
  quocTich: string | null;
  diaChiThuongTru: string | null;
  soGiuong: string;
  trangThaiThue: string;
};

export type ContractService = {
  maDV: string;
  tenDV: string;
  donGiaKyKet: number;
  donViTinh: string | null;
};

export type ContractLookupDetail = ContractLookupItem & {
  ngayKy: string | null;
  dieuKhoan: string | null;
  maPhieuCoc: string;
  email: string | null;
  diaChiThuongTru: string | null;
  gioiTinh: string | null;
  quocTich: string | null;
  ngaySinh: string | null;
  loaiGiayTo: string | null;
  sucChua: number;
  giaThueLoaiPhong: number;
  tang: string | null;
  thanhViens: ContractMember[];
  dichVus: ContractService[];
};

export type ContractLookupCriteria = {
  tuKhoa?: string;
  trangThai?: string;
};

export type LookupStatus =
  | "pending_sign"
  | "pending_payment"
  | "pending_handover"
  | "active"
  | "liquidated"
  | "cancelled";

export const BACKEND_TO_FRONTEND_STATUS: Record<string, LookupStatus> = {
  ChoKy: "pending_sign",
  ChoThanhToan: "pending_payment",
  ChoBanGiao: "pending_handover",
  DangHieuLuc: "active",
  DaThanhLy: "liquidated",
  DaHuy: "cancelled",
};

export const FRONTEND_TO_BACKEND_STATUS: Record<LookupStatus, string> = {
  pending_sign: "ChoKy",
  pending_payment: "ChoThanhToan",
  pending_handover: "ChoBanGiao",
  active: "DangHieuLuc",
  liquidated: "DaThanhLy",
  cancelled: "DaHuy",
};

export const STATUS_LABEL: Record<LookupStatus, string> = {
  pending_sign: "Chờ ký",
  pending_payment: "Chờ thanh toán",
  pending_handover: "Chờ bàn giao",
  active: "Đang hiệu lực",
  liquidated: "Đã thanh lý",
  cancelled: "Đã hủy",
};

export function toLookupStatus(trangThai: string): LookupStatus {
  return BACKEND_TO_FRONTEND_STATUS[trangThai] ?? "pending_sign";
}

export function toBackendStatus(status: string | undefined): string | undefined {
  // "all" giữ nguyên để backend phân biệt với A2 (không nhập tiêu chí)
  if (!status) return undefined;
  if (status === "all") return "all";
  return FRONTEND_TO_BACKEND_STATUS[status as LookupStatus];
}

// Badge semantics theo .agent/RULES.md §5
export function statusBadgeClass(status: LookupStatus) {
  if (status === "active") return "bg-blue-100 text-blue-700";
  if (status === "pending_sign" || status === "pending_payment" || status === "pending_handover")
    return "bg-amber-100 text-amber-700";
  if (status === "liquidated") return "bg-purple-100 text-purple-700";
  return "bg-rose-100 text-rose-700";
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message ?? "Không thể xử lý yêu cầu tra cứu hợp đồng.");
}

export async function lookupContracts(criteria: ContractLookupCriteria, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (criteria.tuKhoa?.trim()) params.set("tuKhoa", criteria.tuKhoa.trim());
  if (criteria.trangThai?.trim()) params.set("trangThai", criteria.trangThai.trim());
  return readResponse<ContractLookupItem[]>(
    await fetch(`/api/contracts/lookup?${params.toString()}`, { signal }),
  );
}

export async function loadContractLookupDetail(id: string, signal?: AbortSignal) {
  return readResponse<ContractLookupDetail>(
    await fetch(`/api/contracts/${encodeURIComponent(id)}/lookup`, { signal }),
  );
}
