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
  { value: "CN-A", label: "Chi nhánh A" },
  { value: "CN-B", label: "Chi nhánh B" },
  { value: "CN-C", label: "Chi nhánh C" },
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
  list(): Promise<AppointmentRecord[]>;
  save(appointments: AppointmentRecord[]): Promise<void>;
}

export const mockAppointmentService: AppointmentService = {
  async list() {
    seedMockAppointments();
    return loadAppointments();
  },
  async save(appointments) {
    saveAppointments(appointments);
  },
};
