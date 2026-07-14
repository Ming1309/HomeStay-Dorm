export type AppointmentType = "view-room" | "checkin" | "checkout";

export type AppointmentRecord = {
  id: string;
  appointmentType: AppointmentType;
  referenceLabel: string;
  branch: string;
  date: string;
  time: string;
  status: string;
};

export const APPOINTMENT_TYPES = [
  { value: "view-room", label: "Xem phòng", helper: "Cho phép tìm kiếm Phiếu đăng ký." },
  { value: "checkin", label: "Nhận phòng", helper: "Cho phép tìm kiếm Phiếu cọc đã duyệt." },
  { value: "checkout", label: "Trả phòng", helper: "Cho phép tìm kiếm Hợp đồng đang hiệu lực." },
] as const;

export const BRANCHES = [
  { value: "CN01", label: "Chi nhánh Trung Tâm" },
  { value: "CN02", label: "Chi nhánh Làng Đại Học" },
] as const;

export const MOCK_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "appt-001",
    appointmentType: "view-room",
    referenceLabel: "KH-001 - Nguyễn Văn A",
    branch: "CN-A",
    date: "2026-06-05",
    time: "09:00",
    status: "Chờ xác nhận",
  },
  {
    id: "appt-002",
    appointmentType: "checkin",
    referenceLabel: "KH-002 - Trần Thị B",
    branch: "CN-B",
    date: "2026-06-06",
    time: "14:30",
    status: "Đã xác nhận",
  },
  {
    id: "appt-003",
    appointmentType: "checkout",
    referenceLabel: "KH-003 - Lê Văn C",
    branch: "CN-C",
    date: "2026-06-10",
    time: "10:00",
    status: "Đã hủy",
  },
  {
    id: "appt-004",
    appointmentType: "view-room",
    referenceLabel: "KH-004 - Phạm Thị D",
    branch: "CN-A",
    date: "2026-06-12",
    time: "16:00",
    status: "Đã xác nhận",
  },
  {
    id: "appt-005",
    appointmentType: "checkin",
    referenceLabel: "KH-005 - Hoàng Văn E",
    branch: "CN-B",
    date: "2026-06-14",
    time: "08:30",
    status: "Đang chờ",
  },
] as const;

export function seedMockAppointments() {
  if (typeof window === "undefined") return;

  const existing = loadAppointments();
  if (existing.length > 0) return;

  saveAppointments(MOCK_APPOINTMENTS);
}

const APPOINTMENT_STORAGE_KEY = "homestay-appointments-v1";

export function loadAppointments(): AppointmentRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(APPOINTMENT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppointmentRecord[];
  } catch {
    return [];
  }
}

export function saveAppointments(appointments: AppointmentRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(APPOINTMENT_STORAGE_KEY, JSON.stringify(appointments));
}

export interface AppointmentService {
  list(keyword?: string, date?: string, time?: string): Promise<AppointmentRecord[]>;
  create(data: {
    loaiLichHen: string;
    maChungTu: string;
    maCN: string;
    ngayHen: string;
    gioHen: string;
    maNV: string;
  }): Promise<AppointmentRecord>;
  getBranches(): Promise<{value: string, label: string}[]>;
  fetchDocuments(type: string, keyword?: string): Promise<any[]>;
  update(id: string, data: {
    ngayHen: string;
    gioHen: string;
    maNV: string;
    trangThai: string;
  }): Promise<AppointmentRecord>;
}

export const appointmentService: AppointmentService = {
  async list(keyword?: string, date?: string, time?: string) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (date) params.append('date', date);
    if (time) params.append('time', time);
    
    const res = await fetch(`/api/appointments/all?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.maLH || item.maLichHen,
      appointmentType: item.loaiLichHen === 'NhanPhong' ? 'checkin' : item.loaiLichHen === 'TraPhong' ? 'checkout' : 'view-room',
      referenceLabel: item.khachHang ? `${item.khachHang.hoTen} - ${item.khachHang.soGiayTo}` : item.chiTiet || item.maLH || item.maLichHen,
      branch: item.maCN,
      date: item.ngayHen ? item.ngayHen.split('T')[0] : '',
      time: item.gioHen || '',
      status: item.trangThai || 'Chờ xác nhận',
    }));
  },
  async create(data) {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi tạo lịch hẹn');
    }
    const item = await res.json();
    return {
      id: item.maLH || item.maLichHen,
      appointmentType: item.loaiLichHen === 'NhanPhong' ? 'checkin' : item.loaiLichHen === 'TraPhong' ? 'checkout' : 'view-room',
      referenceLabel: item.khachHang ? `${item.khachHang.hoTen} - ${item.khachHang.soGiayTo}` : item.chiTiet || item.maLH || item.maLichHen,
      branch: item.maCN,
      date: item.ngayHen ? item.ngayHen.split('T')[0] : '',
      time: item.gioHen || '',
      status: item.trangThai || 'Chờ xác nhận',
    };
  },
  async fetchDocuments(type: string, keyword: string = '') {
    const res = await fetch(`/api/appointments/documents?type=${type}&keyword=${encodeURIComponent(keyword)}`);
    if (!res.ok) return [];
    return await res.json();
  },
  async getBranches() {
    try {
      const res = await fetch('/api/branches');
      if (!res.ok) return Array.from(BRANCHES);
      const data = await res.json();
      return data.map((b: any) => ({
        value: b.maCN || b.MaCN,
        label: b.tenChiNhanh || b.TenChiNhanh
      }));
    } catch {
      return Array.from(BRANCHES);
    }
  },
  async update(id, data) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi cập nhật lịch hẹn');
    }
    const item = await res.json();
    return {
      id: item.maLH || item.maLichHen,
      appointmentType: item.loaiLichHen === 'NhanPhong' ? 'checkin' : item.loaiLichHen === 'TraPhong' ? 'checkout' : 'view-room',
      referenceLabel: item.khachHang ? `${item.khachHang.hoTen} - ${item.khachHang.soGiayTo}` : item.chiTiet || item.maLH || item.maLichHen,
      branch: item.maCN,
      date: item.ngayHen ? item.ngayHen.split('T')[0] : '',
      time: item.gioHen || '',
      status: item.trangThai || 'Chờ xác nhận',
    };
  }
};

