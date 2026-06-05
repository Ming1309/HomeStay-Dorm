import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { mockAppointments } from "@/lib/residence/mock-appointments";
import { mockRooms } from "@/lib/residence/mock-rooms";

export type UserRole = "accountant" | "manager" | "sale" | "admin";
export type ContractStatus =
  | "pending_payment"
  | "partial_payment"
  | "pending_handover"
  | "handed_over"
  | "pending_settlement"
  | "liquidated";
export type MemberStatus = "pending" | "rejected";

// --- Room / Bed types (UC 1.4.4) ---
export type RoomStatus = "available" | "partially_available" | "full" | "maintenance";
export type BedStatus = "available" | "deposited" | "occupied" | "maintenance";

export type Asset = {
  id: string;
  name: string;
  quantity: number;
  condition: string;
};

export type Bed = {
  id: string;
  code: string;
  status: BedStatus;
};

export type Room = {
  id: string;
  code: string;
  area: string;
  type: string;
  maxCapacity: number;
  basePrice: number;
  beds: Bed[];
  assets: Asset[];
  status: RoomStatus;
};

// --- Appointment types (UC 1.4.5) ---
export type Appointment = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email: string;
  gender: "male" | "female";
  nationality?: string;
  docType?: "CCCD" | "Hộ chiếu";
  docNumber?: string;
  roomId?: string;
  room?: string;
  type: "viewing";
  status: "success" | "pending" | "cancelled";
  createdAt: string;
};

// --- Deposit Request types (UC 1.4.5-1.4.8) ---
export type DepositRequestStatus =
  | "init"
  | "pending_payment"
  | "pending_reconciliation"
  | "supplement_required"
  | "pending_settlement"
  | "paid"
  | "cancelled";

export type PaymentMethod = "bank-transfer" | "cash";

export type DepositRequest = {
  id: string;
  code: string;
  appointmentId: string;
  customerName: string;
  phone: string;
  email: string;
  gender: "male" | "female";
  roomId: string;
  room: string;
  rentalType: "shared" | "whole";
  selectedBedIds: string[];
  basePrice: number;
  depositAmount: number | null;
  status: DepositRequestStatus;
  paymentMethod: PaymentMethod | null;
  paymentProof: string | null; // base64 or URL
  supplementReason: string | null;
  reconciliationItems?: Array<{ id: string; description: string; amount: number }>;
  createdAt: string;
  updatedAt: string;
  groupId: string | null; // MaNhom for group registration
};

export type ContractMember = {
  id: string;
  fullName: string;
  gender: "male" | "female";
  birthYear: number;
  nationality: string;
  docType: "CCCD" | "Hộ chiếu";
  docNumber: string;
  phone: string;
  address: {
    street: string;
    ward: string;
    district: string;
    province: string;
  } | null;
  status: MemberStatus;
};

export type ContractItem = {
  id: string;
  customerName: string;
  room: string;
  phone: string;
  rentalPeriod: string;
  createdAt: string;
  invoiceTotal: number;
  paidAmount: number;
  status: ContractStatus;
  members: ContractMember[];
  lines: Array<{
    id: string;
    description: string;
    cycle: string;
    amount: number;
  }>;
};

export type PaymentLog = {
  id: string;
  contractId: string;
  customerName: string;
  room: string;
  amount: number;
  method: "bank-transfer" | "cash";
  time: string;
};

// --- Deposit refund policy (lifted from admin.deposit-policy) ---
export type DepositPolicyVersion = {
  maChinhSach: string;
  tenChinhSach: string;
  tiLeChuaKy: number;
  tiLeTruocHanNganHan: number;
  tiLeTruocHanDaiHan: number;
  tiLeDungHan: number;
  mocLuuTru: number;
  ngayApDung: string;
  ngayKetThuc: string | null;
};

// --- Settlement phase types (UC 1.4.20-1.4.23) ---
export type AssetRecoveryItem = {
  id: string;
  assetName: string;
  violation: "damaged" | "lost";
  quantity: number;
  unitPrice: number;
};

export type AssetRecovery = {
  id: string;
  code: string;
  contractId: string;
  recordedAt: string;
  items: AssetRecoveryItem[];
};

export type ReconciliationResult = {
  contractId: string;
  initialDeposit: number;
  refundRate: number;
  policyCode: string;
  baseRefund: number;
  deductions: number;
  netRefund: number;
  additionalDue: number;
};

export type CompensationInvoice = {
  id: string;
  code: string;
  contractId: string;
  customerName: string;
  room: string;
  items: AssetRecoveryItem[];
  total: number;
  note: string;
  status: "draft" | "issued";
  createdAt: string;
};

export type ReceiptVoucher = {
  id: string;
  code: string;
  contractId: string;
  customerName: string;
  amount: number;
  paymentMethod: "cash" | "bank-transfer";
  collector: string;
  date: string;
  note?: string;
};

export type RefundVoucher = {
  id: string;
  code: string;
  contractId: string;
  customerName: string;
  amount: number;
  method: "cash" | "bank-transfer";
  bankAccount?: string;
  executor: string;
  date: string;
  note?: string;
};

export type TerminationRecord = {
  id: string;
  code: string;
  contractId: string;
  customerName: string;
  date: string;
  executor: string;
  note: string;
  confirmations: {
    customerReturned: boolean;
    keysRecovered: boolean;
    financialSettled: boolean;
    roomUpdated: boolean;
  };
};

type WorkflowStore = {
  role: UserRole | null;
  isHydrated: boolean;
  contracts: ContractItem[];
  paymentLogs: PaymentLog[];
  rooms: Room[];
  appointments: Appointment[];
  depositRequests: DepositRequest[];
  depositPolicies: DepositPolicyVersion[];
  assetRecoveries: AssetRecovery[];
  compensationInvoices: CompensationInvoice[];
  receiptVouchers: ReceiptVoucher[];
  refundVouchers: RefundVoucher[];
  terminationRecords: TerminationRecord[];
  setRole: (role: UserRole | null) => void;
  recordPayment: (
    contractId: string,
    amount: number,
    method: "bank-transfer" | "cash",
  ) => { scenario: "partial" | "full" };
  rejectMember: (contractId: string, memberId: string) => void;
  undoRejectMember: (contractId: string, memberId: string) => void;
  approveHandover: (contractId: string) => void;
  todayCollected: number;
  outstandingDebt: number;
  partialContractsCount: number;
  pendingHandoverCount: number;
  // Deposit workflow actions (UC 1.4.5-1.4.8)
  createDepositRequest: (data: {
    appointmentId: string;
    customerName: string;
    phone: string;
    email: string;
    gender: "male" | "female";
    roomId: string;
    room: string;
    rentalType: "shared" | "whole";
    selectedBedIds: string[];
    basePrice: number;
    groupId: string | null;
  }) => void;
  updateDepositAmount: (depositId: string, amount: number) => void;
  confirmDepositPayment: (depositId: string) => void;
  settleDepositReconciliation: (depositId: string) => void;
  recordDepositPayment: (depositId: string, method: PaymentMethod, proof: string) => void;
  rejectDepositPayment: (depositId: string, reason: string) => void;
  cancelDepositRequest: (depositId: string) => void;
  // Settlement phase actions (UC 1.4.20-1.4.23)
  getActivePolicy: () => DepositPolicyVersion | null;
  getReconciliation: (contractId: string) => ReconciliationResult | null;
  createCompensationInvoice: (input: {
    contractId: string;
    customerName: string;
    room: string;
    items: AssetRecoveryItem[];
    note: string;
  }) => CompensationInvoice;
  createReceiptVoucher: (input: {
    contractId: string;
    customerName: string;
    amount: number;
    paymentMethod: "cash" | "bank-transfer";
    collector: string;
    date: string;
    note?: string;
  }) => ReceiptVoucher;
  createRefundVoucher: (input: {
    contractId: string;
    customerName: string;
    amount: number;
    method: "cash" | "bank-transfer";
    bankAccount?: string;
    executor: string;
    date: string;
    note?: string;
  }) => RefundVoucher;
  terminateContract: (input: {
    contractId: string;
    customerName: string;
    executor: string;
    note: string;
    confirmations: TerminationRecord["confirmations"];
  }) => TerminationRecord;
};

const STORAGE_KEY = "homestay-workflow-store-v1";
const ROLE_KEY = "homestay-current-role-v1";

const initialDepositRequests: DepositRequest[] = [
  {
    id: "DR001",
    code: "PC006",
    appointmentId: "apt-1",
    customerName: "Nguyễn Thị Hồng",
    phone: "0901122334",
    email: "hong.nguyen@example.com",
    gender: "female",
    roomId: "room-2",
    room: "P.102",
    rentalType: "shared",
    selectedBedIds: ["bed-102-1"],
    basePrice: 4200000,
    depositAmount: null,
    status: "init",
    paymentMethod: null,
    paymentProof: null,
    supplementReason: null,
    createdAt: "2026-05-28T08:00:00.000Z",
    updatedAt: "2026-05-28T08:00:00.000Z",
    groupId: null,
  },
  {
    id: "DR002",
    code: "PC007",
    appointmentId: "apt-2",
    customerName: "Trần Văn Hùng",
    phone: "0911223344",
    email: "hung.tran@example.com",
    gender: "male",
    roomId: "room-5",
    room: "P.305",
    rentalType: "whole",
    selectedBedIds: ["bed-305-1", "bed-305-2", "bed-305-3", "bed-305-4", "bed-305-5", "bed-305-6"],
    basePrice: 4500000,
    depositAmount: 54000000,
    status: "pending_payment",
    paymentMethod: null,
    paymentProof: null,
    supplementReason: null,
    createdAt: "2026-05-28T09:00:00.000Z",
    updatedAt: "2026-05-28T09:00:00.000Z",
    groupId: null,
  },
  {
    id: "DR003",
    code: "PC008",
    appointmentId: "apt-3",
    customerName: "Lê Thị Mai",
    phone: "0933445566",
    email: "mai.le@example.com",
    gender: "female",
    roomId: "room-7",
    room: "P.401",
    rentalType: "whole",
    selectedBedIds: ["bed-401-1", "bed-401-2"],
    basePrice: 5500000,
    depositAmount: 11000000,
    status: "pending_reconciliation",
    paymentMethod: "bank-transfer",
    paymentProof: null,
    supplementReason: null,
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-28T10:30:00.000Z",
    groupId: null,
  },
  {
    id: "DR004",
    code: "PC009",
    appointmentId: "apt-4",
    customerName: "Phạm Quốc Bảo",
    phone: "0977889900",
    email: "bao.pham@example.com",
    gender: "male",
    roomId: "room-1",
    room: "P.101",
    rentalType: "shared",
    selectedBedIds: ["bed-101-1"],
    basePrice: 4000000,
    depositAmount: 24000000,
    status: "supplement_required",
    paymentMethod: "cash",
    paymentProof: null,
    supplementReason: "Hình ảnh biên nhận không rõ, vui lòng chụp lại.",
    createdAt: "2026-05-28T11:00:00.000Z",
    updatedAt: "2026-05-28T11:30:00.000Z",
    groupId: null,
  },
  {
    id: "DR005",
    code: "PC010",
    appointmentId: "apt-5",
    customerName: "Hoàng Minh Tâm",
    phone: "0909090909",
    email: "tam.hoang@example.com",
    gender: "male",
    roomId: "room-5",
    room: "P.305",
    rentalType: "shared",
    selectedBedIds: ["bed-305-1"],
    basePrice: 4500000,
    depositAmount: 54000000,
    status: "paid",
    paymentMethod: "bank-transfer",
    paymentProof: null,
    supplementReason: null,
    createdAt: "2026-05-27T14:00:00.000Z",
    updatedAt: "2026-05-27T15:00:00.000Z",
    groupId: null,
  },
  {
    id: "DR006",
    code: "PC011",
    appointmentId: "apt-6",
    customerName: "Võ Minh Quân",
    phone: "0912333445",
    email: "quan.vo@example.com",
    gender: "male",
    roomId: "room-2",
    room: "P.202",
    rentalType: "whole",
    selectedBedIds: ["bed-202-1", "bed-202-2"],
    basePrice: 4600000,
    depositAmount: 46000000,
    status: "pending_settlement",
    paymentMethod: "bank-transfer",
    paymentProof: "proof-settlement.jpg",
    supplementReason: null,
    reconciliationItems: [
      { id: "ri-1", description: "Tiền điện tháng 5", amount: 220000 },
      { id: "ri-2", description: "Tiền nước tháng 5", amount: 110000 },
      { id: "ri-3", description: "Phí vệ sinh cuối kỳ", amount: 150000 },
    ],
    createdAt: "2026-05-29T09:00:00.000Z",
    updatedAt: "2026-05-29T09:15:00.000Z",
    groupId: null,
  },
];

const initialContracts: ContractItem[] = [
  {
    id: "HD-PC012",
    customerName: "Nguyễn Minh Anh",
    room: "P.101",
    phone: "0901 234 567",
    rentalPeriod: "01/06/2026 - 31/05/2027",
    createdAt: "2026-05-28T08:00:00.000Z",
    invoiceTotal: 4650000,
    paidAmount: 0,
    status: "pending_payment",
    members: [
      {
        id: "m12-1",
        fullName: "Nguyễn Minh Anh",
        gender: "male",
        birthYear: 2000,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079200456789",
        phone: "0901234567",
        address: {
          street: "12 Nguyễn Huệ",
          ward: "Phường Bến Nghé",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
      {
        id: "m12-2",
        fullName: "Phạm Khánh Ly",
        gender: "female",
        birthYear: 2001,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079201239999",
        phone: "0912333444",
        address: {
          street: "88 Lê Lợi",
          ward: "Phường Bến Thành",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
    ],
    lines: [
      { id: "l1", description: "Tiền thuê phòng kỳ đầu", cycle: "1 tháng", amount: 4000000 },
      { id: "l2", description: "Phí gửi xe", cycle: "1 xe", amount: 150000 },
      { id: "l3", description: "Phí dọn phòng", cycle: "1 tháng", amount: 500000 },
    ],
  },
  {
    id: "HD-PC013",
    customerName: "Trần Hoàng Nam",
    room: "P.203",
    phone: "0938 456 789",
    rentalPeriod: "03/06/2026 - 02/06/2027",
    createdAt: "2026-05-28T08:15:00.000Z",
    invoiceTotal: 4400000,
    paidAmount: 4400000,
    status: "pending_handover",
    members: [
      {
        id: "m13-1",
        fullName: "Trần Hoàng Nam",
        gender: "male",
        birthYear: 1999,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "038200456789",
        phone: "0938456789",
        address: {
          street: "57 Trần Quốc Thảo",
          ward: "Phường Võ Thị Sáu",
          district: "Quận 3",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
      {
        id: "m13-2",
        fullName: "Lê Gia Hân",
        gender: "female",
        birthYear: 2000,
        nationality: "Singapore",
        docType: "Hộ chiếu",
        docNumber: "E12345678",
        phone: "0909001122",
        address: null,
        status: "pending",
      },
    ],
    lines: [
      { id: "l4", description: "Tiền thuê phòng kỳ đầu", cycle: "1 tháng", amount: 3800000 },
      { id: "l5", description: "Phí gửi xe", cycle: "1 xe", amount: 150000 },
      { id: "l6", description: "Phí dọn phòng", cycle: "1 tháng", amount: 450000 },
    ],
  },
  {
    id: "HD-PC014",
    customerName: "Lê Thảo Vy",
    room: "P.305",
    phone: "0977 888 111",
    rentalPeriod: "05/06/2026 - 04/06/2027",
    createdAt: "2026-05-28T08:30:00.000Z",
    invoiceTotal: 4950000,
    paidAmount: 4950000,
    status: "pending_handover",
    members: [
      {
        id: "m14-1",
        fullName: "Lê Thảo Vy",
        gender: "female",
        birthYear: 2002,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079202888777",
        phone: "0977888111",
        address: {
          street: "299 Lê Văn Sỹ",
          ward: "Phường 14",
          district: "Quận 3",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
      {
        id: "m14-2",
        fullName: "Đặng Quốc Bảo",
        gender: "male",
        birthYear: 1998,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079198222333",
        phone: "0911223344",
        address: {
          street: "45 Hoàng Sa",
          ward: "Phường Tân Định",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
    ],
    lines: [
      { id: "l7", description: "Tiền thuê phòng kỳ đầu", cycle: "1 tháng", amount: 4200000 },
      { id: "l8", description: "Phí gửi xe", cycle: "1 xe", amount: 150000 },
      { id: "l9", description: "Phí dọn phòng", cycle: "1 tháng", amount: 600000 },
    ],
  },
];

// --- Settlement phase mock data (UC 1.4.20-1.4.23) ---

const initialDepositPolicies: DepositPolicyVersion[] = [
  {
    maChinhSach: "CSHC_003",
    tenChinhSach: "Chính sách hoàn cọc chuẩn 2026",
    tiLeChuaKy: 80,
    tiLeTruocHanNganHan: 50,
    tiLeTruocHanDaiHan: 70,
    tiLeDungHan: 100,
    mocLuuTru: 6,
    ngayApDung: "2026-05-15",
    ngayKetThuc: null,
  },
  {
    maChinhSach: "CSHC_002",
    tenChinhSach: "Chính sách hoàn cọc điều chỉnh Q1/2026",
    tiLeChuaKy: 75,
    tiLeTruocHanNganHan: 45,
    tiLeTruocHanDaiHan: 65,
    tiLeDungHan: 100,
    mocLuuTru: 9,
    ngayApDung: "2026-01-10",
    ngayKetThuc: "2026-05-14",
  },
  {
    maChinhSach: "CSHC_004",
    tenChinhSach: "Chính sách hoàn cọc dự kiến 2027",
    tiLeChuaKy: 78,
    tiLeTruocHanNganHan: 48,
    tiLeTruocHanDaiHan: 68,
    tiLeDungHan: 100,
    mocLuuTru: 6,
    ngayApDung: "2027-01-01",
    ngayKetThuc: null,
  },
];

const initialAssetRecoveries: AssetRecovery[] = [
  {
    id: "BBTH-001",
    code: "BBTH001",
    contractId: "HD-PC015",
    recordedAt: "2026-06-01T09:30:00.000Z",
    items: [
      { id: "ar-1", assetName: "Ghế nhựa", violation: "damaged", quantity: 1, unitPrice: 250000 },
      { id: "ar-2", assetName: "Thẻ từ", violation: "lost", quantity: 1, unitPrice: 100000 },
    ],
  },
  {
    id: "BBTH-002",
    code: "BBTH002",
    contractId: "HD-PC016",
    recordedAt: "2026-06-02T10:00:00.000Z",
    items: [
      { id: "ar-3", assetName: "Điều hòa", violation: "damaged", quantity: 1, unitPrice: 1500000 },
      { id: "ar-4", assetName: "Rèm cửa", violation: "damaged", quantity: 1, unitPrice: 350000 },
      { id: "ar-5", assetName: "Chìa khóa phòng", violation: "lost", quantity: 2, unitPrice: 200000 },
    ],
  },
  {
    id: "BBTH-003",
    code: "BBTH003",
    contractId: "HD-PC017",
    recordedAt: "2026-05-30T14:00:00.000Z",
    items: [{ id: "ar-6", assetName: "Tủ quần áo", violation: "damaged", quantity: 1, unitPrice: 600000 }],
  },
  {
    id: "BBTH-004",
    code: "BBTH004",
    contractId: "HD-PC018",
    recordedAt: "2026-06-03T08:30:00.000Z",
    items: [
      { id: "ar-7", assetName: "Điều hòa", violation: "damaged", quantity: 1, unitPrice: 1800000 },
      { id: "ar-8", assetName: "Tủ quần áo", violation: "damaged", quantity: 1, unitPrice: 1500000 },
      { id: "ar-9", assetName: "Rèm cửa", violation: "damaged", quantity: 2, unitPrice: 350000 },
      { id: "ar-10", assetName: "Thẻ từ", violation: "lost", quantity: 3, unitPrice: 100000 },
    ],
  },
];

const initialSettlementContracts: ContractItem[] = [
  {
    id: "HD-PC015",
    customerName: "Lê Hoàng Anh",
    room: "A203",
    phone: "0935 112 233",
    rentalPeriod: "01/01/2026 - 31/05/2026",
    createdAt: "2026-01-02T08:00:00.000Z",
    invoiceTotal: 5000000,
    paidAmount: 5000000,
    status: "pending_settlement",
    members: [
      {
        id: "m15-1",
        fullName: "Lê Hoàng Anh",
        gender: "male",
        birthYear: 2000,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079200111222",
        phone: "0935112233",
        address: {
          street: "12 Nguyễn Trãi",
          ward: "Phường 2",
          district: "Quận 5",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
    ],
    lines: [
      { id: "l15-1", description: "Tiền thuê phòng kỳ đầu", cycle: "5 tháng", amount: 5000000 },
    ],
  },
  {
    id: "HD-PC016",
    customerName: "Phạm Thị Lan",
    room: "B105",
    phone: "0987 665 544",
    rentalPeriod: "15/01/2026 - 14/05/2026",
    createdAt: "2026-01-15T08:00:00.000Z",
    invoiceTotal: 4800000,
    paidAmount: 4800000,
    status: "pending_settlement",
    members: [
      {
        id: "m16-1",
        fullName: "Phạm Thị Lan",
        gender: "female",
        birthYear: 2001,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079201333444",
        phone: "0987665544",
        address: {
          street: "5 Trần Hưng Đạo",
          ward: "Phường Phan Chu Trinh",
          district: "Quận Hoàn Kiếm",
          province: "Hà Nội",
        },
        status: "pending",
      },
    ],
    lines: [
      { id: "l16-1", description: "Tiền thuê phòng kỳ đầu", cycle: "4 tháng", amount: 4800000 },
    ],
  },
  {
    id: "HD-PC017",
    customerName: "Trần Quốc Bình",
    room: "C302",
    phone: "0902 778 899",
    rentalPeriod: "01/02/2026 - 30/04/2026",
    createdAt: "2026-02-01T08:00:00.000Z",
    invoiceTotal: 4200000,
    paidAmount: 4200000,
    status: "liquidated",
    members: [
      {
        id: "m17-1",
        fullName: "Trần Quốc Bình",
        gender: "male",
        birthYear: 1998,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079198555666",
        phone: "0902778899",
        address: {
          street: "88 Hai Bà Trưng",
          ward: "Phường Bến Nghé",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
    ],
    lines: [
      { id: "l17-1", description: "Tiền thuê phòng kỳ đầu", cycle: "3 tháng", amount: 4200000 },
    ],
  },
  {
    id: "HD-PC018",
    customerName: "Phan Văn Cường",
    room: "D101",
    phone: "0912 345 678",
    rentalPeriod: "01/03/2026 - 31/05/2026",
    createdAt: "2026-03-01T08:00:00.000Z",
    invoiceTotal: 3000000,
    paidAmount: 3000000,
    status: "pending_settlement",
    members: [
      {
        id: "m18-1",
        fullName: "Phan Văn Cường",
        gender: "male",
        birthYear: 1997,
        nationality: "Việt Nam",
        docType: "CCCD",
        docNumber: "079197777888",
        phone: "0912345678",
        address: {
          street: "22 Bạch Đằng",
          ward: "Phường 2",
          district: "Quận Tân Bình",
          province: "TP. Hồ Chí Minh",
        },
        status: "pending",
      },
    ],
    lines: [
      { id: "l18-1", description: "Tiền thuê phòng kỳ đầu", cycle: "3 tháng", amount: 3000000 },
    ],
  },
];

const WorkflowContext = createContext<WorkflowStore | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [contracts, setContracts] = useState<ContractItem[]>([
    ...initialContracts,
    ...initialSettlementContracts,
  ]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(initialDepositRequests);
  const [depositPolicies] = useState<DepositPolicyVersion[]>(initialDepositPolicies);
  const [assetRecoveries] = useState<AssetRecovery[]>(initialAssetRecoveries);
  const [compensationInvoices, setCompensationInvoices] = useState<CompensationInvoice[]>([]);
  const [receiptVouchers, setReceiptVouchers] = useState<ReceiptVoucher[]>([]);
  const [refundVouchers, setRefundVouchers] = useState<RefundVoucher[]>([]);
  const [terminationRecords, setTerminationRecords] = useState<TerminationRecord[]>([]);

  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;
    if (savedRole) setRoleState(savedRole);
    setIsHydrated(true);
  }, []);

  const setRole = (nextRole: UserRole | null) => {
    setRoleState(nextRole);
    if (nextRole) localStorage.setItem(ROLE_KEY, nextRole);
    else localStorage.removeItem(ROLE_KEY);
  };

  const recordPayment: WorkflowStore["recordPayment"] = (contractId, amount, method) => {
    const now = new Date().toISOString();
    let scenario: "partial" | "full" = "partial";
    let logEntry: PaymentLog | null = null;

    setContracts((current) =>
      current.map((item) => {
        if (item.id !== contractId) return item;
        const remaining = Math.max(item.invoiceTotal - item.paidAmount, 0);
        const paidThisTime = Math.min(Math.max(amount, 0), remaining);
        const paidAmount = item.paidAmount + paidThisTime;
        const left = Math.max(item.invoiceTotal - paidAmount, 0);
        const status: ContractStatus = left === 0 ? "pending_handover" : "partial_payment";
        scenario = left === 0 ? "full" : "partial";
        const updated = { ...item, paidAmount, status };
        logEntry = {
          id: `${contractId}-${Date.now()}`,
          contractId: updated.id,
          customerName: updated.customerName,
          room: updated.room,
          amount: paidThisTime,
          method,
          time: now,
        };
        return updated;
      }),
    );

    if (logEntry) {
      setPaymentLogs((current) => [logEntry!, ...current]);
    }

    return { scenario };
  };

  const rejectMember = (contractId: string, memberId: string) => {
    setContracts((current) =>
      current.map((item) =>
        item.id !== contractId
          ? item
          : {
              ...item,
              members: item.members.map((m) =>
                m.id === memberId ? { ...m, status: "rejected" } : m,
              ),
            },
      ),
    );
  };

  const undoRejectMember = (contractId: string, memberId: string) => {
    setContracts((current) =>
      current.map((item) =>
        item.id !== contractId
          ? item
          : {
              ...item,
              members: item.members.map((m) =>
                m.id === memberId ? { ...m, status: "pending" } : m,
              ),
            },
      ),
    );
  };

  const approveHandover = (contractId: string) => {
    setContracts((current) =>
      current.map((item) =>
        item.id === contractId
          ? {
              ...item,
              status: "handed_over",
            }
          : item,
      ),
    );
  };

  // --- Deposit workflow actions (UC 1.4.5-1.4.8) ---

  const createDepositRequest: WorkflowStore["createDepositRequest"] = (data) => {
    const now = new Date().toISOString();
    const count = depositRequests.length + 1;
    const code = `PC${String(count).padStart(3, "0")}`;
    const newDeposit: DepositRequest = {
      id: `DR${code}`,
      code,
      appointmentId: data.appointmentId,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      roomId: data.roomId,
      room: data.room,
      rentalType: data.rentalType,
      selectedBedIds: data.selectedBedIds,
      basePrice: data.basePrice,
      depositAmount: null,
      status: "init",
      paymentMethod: null,
      paymentProof: null,
      supplementReason: null,
      createdAt: now,
      updatedAt: now,
      groupId: data.groupId,
    };
    setDepositRequests((current) => [newDeposit, ...current]);
    setRooms((current) =>
      current.map((room) =>
        room.id !== data.roomId
          ? room
          : {
              ...room,
              beds: room.beds.map((bed) =>
                data.selectedBedIds.includes(bed.id) ? { ...bed, status: "deposited" } : bed,
              ),
            },
      ),
    );
    setAppointments((current) => current.filter((apt) => apt.id !== data.appointmentId));
  };

  const updateDepositAmount: WorkflowStore["updateDepositAmount"] = (depositId, amount) => {
    setDepositRequests((current) =>
      current.map((d) =>
        d.id === depositId
          ? {
              ...d,
              depositAmount: amount,
              status: "pending_payment",
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    );
  };

  const confirmDepositPayment: WorkflowStore["confirmDepositPayment"] = (depositId) => {
    setDepositRequests((current) =>
      current.map((d) =>
        d.id === depositId ? { ...d, status: "paid", updatedAt: new Date().toISOString() } : d,
      ),
    );
  };

  const recordDepositPayment: WorkflowStore["recordDepositPayment"] = (
    depositId,
    method,
    proof,
  ) => {
    setDepositRequests((current) =>
      current.map((d) =>
        d.id === depositId
          ? {
              ...d,
              paymentMethod: method,
              paymentProof: proof,
              status: "pending_reconciliation",
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    );
  };

  const settleDepositReconciliation: WorkflowStore["settleDepositReconciliation"] = (depositId) => {
    setDepositRequests((current) =>
      current.map((d) =>
        d.id === depositId
          ? { ...d, status: "paid", updatedAt: new Date().toISOString() }
          : d,
      ),
    );
  };

  const rejectDepositPayment: WorkflowStore["rejectDepositPayment"] = (depositId, reason) => {
    setDepositRequests((current) =>
      current.map((d) =>
        d.id === depositId
          ? {
              ...d,
              supplementReason: reason,
              status: "supplement_required",
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    );
  };

  const cancelDepositRequest: WorkflowStore["cancelDepositRequest"] = (depositId) => {
    setDepositRequests((current) =>
      current.map((d) =>
        d.id === depositId ? { ...d, status: "cancelled", updatedAt: new Date().toISOString() } : d,
      ),
    );
  };

  // --- Settlement phase actions (UC 1.4.20-1.4.23) ---

  const getActivePolicy: WorkflowStore["getActivePolicy"] = () => {
    const today = new Date();
    const current = depositPolicies.find((p) => {
      const start = new Date(`${p.ngayApDung}T00:00:00`);
      const end = p.ngayKetThuc ? new Date(`${p.ngayKetThuc}T00:00:00`) : null;
      return start <= today && (!end || end >= today);
    });
    return current ?? depositPolicies[0] ?? null;
  };

  const getReconciliation: WorkflowStore["getReconciliation"] = (contractId) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return null;
    const policy = getActivePolicy();
    if (!policy) return null;
    const recovery = assetRecoveries.find((a) => a.contractId === contractId);
    const deductions = recovery ? recovery.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) : 0;
    const baseRefund = Math.round(contract.invoiceTotal * (policy.tiLeTruocHanDaiHan / 100));
    const netRefund = Math.max(baseRefund - deductions, 0);
    const additionalDue = Math.max(deductions - baseRefund, 0);
    return {
      contractId,
      initialDeposit: contract.invoiceTotal,
      refundRate: policy.tiLeTruocHanDaiHan,
      policyCode: policy.maChinhSach,
      baseRefund,
      deductions,
      netRefund,
      additionalDue,
    };
  };

  const createCompensationInvoice: WorkflowStore["createCompensationInvoice"] = (input) => {
    const now = new Date();
    const count = compensationInvoices.length + 1;
    const code = `HDBT${String(count).padStart(3, "0")}`;
    const total = input.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const invoice: CompensationInvoice = {
      id: `HDBT-${code}`,
      code,
      contractId: input.contractId,
      customerName: input.customerName,
      room: input.room,
      items: input.items,
      total,
      note: input.note,
      status: "issued",
      createdAt: now.toISOString(),
    };
    setCompensationInvoices((current) => [invoice, ...current]);
    return invoice;
  };

  const createReceiptVoucher: WorkflowStore["createReceiptVoucher"] = (input) => {
    const count = receiptVouchers.length + 1;
    const code = `PT${String(count).padStart(3, "0")}`;
    const voucher: ReceiptVoucher = {
      id: `PT-${code}`,
      code,
      contractId: input.contractId,
      customerName: input.customerName,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      collector: input.collector,
      date: input.date,
      note: input.note,
    };
    setReceiptVouchers((current) => [voucher, ...current]);
    return voucher;
  };

  const createRefundVoucher: WorkflowStore["createRefundVoucher"] = (input) => {
    const count = refundVouchers.length + 1;
    const code = `PHC${String(count).padStart(3, "0")}`;
    const voucher: RefundVoucher = {
      id: `PHC-${code}`,
      code,
      contractId: input.contractId,
      customerName: input.customerName,
      amount: input.amount,
      method: input.method,
      bankAccount: input.bankAccount,
      executor: input.executor,
      date: input.date,
      note: input.note,
    };
    setRefundVouchers((current) => [voucher, ...current]);
    return voucher;
  };

  const terminateContract: WorkflowStore["terminateContract"] = (input) => {
    const count = terminationRecords.length + 1;
    const code = `BBTL${String(count).padStart(3, "0")}`;
    const record: TerminationRecord = {
      id: `BBTL-${code}`,
      code,
      contractId: input.contractId,
      customerName: input.customerName,
      date: new Date().toISOString(),
      executor: input.executor,
      note: input.note,
      confirmations: input.confirmations,
    };
    setTerminationRecords((current) => [record, ...current]);
    setContracts((current) =>
      current.map((c) => (c.id === input.contractId ? { ...c, status: "liquidated" } : c)),
    );
    return record;
  };

  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    const todayCollected = paymentLogs
      .filter((log) => new Date(log.time).toDateString() === today)
      .reduce((sum, log) => sum + log.amount, 0);
    const outstandingDebt = contracts.reduce(
      (sum, c) => sum + Math.max(c.invoiceTotal - c.paidAmount, 0),
      0,
    );
    const partialContractsCount = contracts.filter((c) => c.status === "partial_payment").length;
    const pendingHandoverCount = contracts.filter((c) => c.status === "pending_handover").length;
    return { todayCollected, outstandingDebt, partialContractsCount, pendingHandoverCount };
  }, [contracts, paymentLogs]);

  return (
    <WorkflowContext.Provider
      value={{
        role,
        isHydrated,
        contracts,
        paymentLogs,
        rooms,
        appointments,
        depositRequests,
        depositPolicies,
        assetRecoveries,
        compensationInvoices,
        receiptVouchers,
        refundVouchers,
        terminationRecords,
        setRole,
        recordPayment,
        rejectMember,
        undoRejectMember,
        approveHandover,
        createDepositRequest,
        updateDepositAmount,
        confirmDepositPayment,
        settleDepositReconciliation,
        recordDepositPayment,
        rejectDepositPayment,
        cancelDepositRequest,
        getActivePolicy,
        getReconciliation,
        createCompensationInvoice,
        createReceiptVoucher,
        createRefundVoucher,
        terminateContract,
        ...metrics,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowStore() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflowStore must be used within WorkflowProvider");
  }
  return context;
}
