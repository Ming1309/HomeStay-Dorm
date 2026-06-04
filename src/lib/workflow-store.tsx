import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { mockAppointments } from "@/lib/residence/mock-appointments";
import { mockRooms } from "@/lib/residence/mock-rooms";

export type UserRole = "accountant" | "manager" | "sale" | "admin";
export type ContractStatus =
  | "pending_payment"
  | "partial_payment"
  | "pending_handover"
  | "handed_over";
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

type WorkflowStore = {
  role: UserRole | null;
  isHydrated: boolean;
  contracts: ContractItem[];
  paymentLogs: PaymentLog[];
  rooms: Room[];
  appointments: Appointment[];
  depositRequests: DepositRequest[];
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
  recordDepositPayment: (depositId: string, method: PaymentMethod, proof: string) => void;
  rejectDepositPayment: (depositId: string, reason: string) => void;
  cancelDepositRequest: (depositId: string) => void;
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

const WorkflowContext = createContext<WorkflowStore | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [contracts, setContracts] = useState<ContractItem[]>(initialContracts);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(initialDepositRequests);

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
    let nextContract: ContractItem | null = null;
    let paymentLog: any = null;
    let paidThisTimeForLog = 0;
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
        nextContract = { ...item, paidAmount, status };
        paymentLog = {
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
        return nextContract;
      }),
    );

    if (paymentLog) {
      setPaymentLogs((current) => [paymentLog, ...current]);
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
        setRole,
        recordPayment,
        rejectMember,
        undoRejectMember,
        approveHandover,
        createDepositRequest,
        updateDepositAmount,
        confirmDepositPayment,
        recordDepositPayment,
        rejectDepositPayment,
        cancelDepositRequest,
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
