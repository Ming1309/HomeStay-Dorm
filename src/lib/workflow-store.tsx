import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type UserRole = "accountant" | "manager" | "sale" | "admin";
export type ContractStatus =
  | "pending_payment"
  | "partial_payment"
  | "pending_handover"
  | "handed_over";
export type MemberStatus = "pending" | "rejected";

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
  };
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
  contracts: ContractItem[];
  paymentLogs: PaymentLog[];
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
};

const STORAGE_KEY = "homestay-workflow-store-v1";
const ROLE_KEY = "homestay-current-role-v1";

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
        address: {
          street: "102 Hai Bà Trưng",
          ward: "Phường Đa Kao",
          district: "Quận 1",
          province: "TP. Hồ Chí Minh",
        },
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
  const [contracts, setContracts] = useState<ContractItem[]>(initialContracts);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);

  useEffect(() => {
    const savedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;
    const savedStore = localStorage.getItem(STORAGE_KEY);
    if (savedRole) setRoleState(savedRole);
    if (savedStore) {
      const parsed = JSON.parse(savedStore) as {
        contracts: ContractItem[];
        paymentLogs: PaymentLog[];
      };
      const parsedContracts = parsed.contracts ?? initialContracts;
      const hasPendingHandover = parsedContracts.some((c) => c.status === "pending_handover");
      // Keep demo queue non-empty even with stale localStorage snapshots.
      setContracts(hasPendingHandover ? parsedContracts : initialContracts);
      setPaymentLogs(parsed.paymentLogs ?? []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ contracts, paymentLogs }));
  }, [contracts, paymentLogs]);

  const setRole = (nextRole: UserRole | null) => {
    setRoleState(nextRole);
    if (nextRole) localStorage.setItem(ROLE_KEY, nextRole);
    else localStorage.removeItem(ROLE_KEY);
  };

  const recordPayment: WorkflowStore["recordPayment"] = (contractId, amount, method) => {
    const now = new Date().toISOString();
    let scenario: "partial" | "full" = "partial";
    let nextContract: ContractItem | null = null;

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
        return nextContract;
      }),
    );

    if (nextContract) {
      setPaymentLogs((current) => [
        {
          id: `${contractId}-${Date.now()}`,
          contractId: nextContract.id,
          customerName: nextContract.customerName,
          room: nextContract.room,
          amount,
          method,
          time: now,
        },
        ...current,
      ]);
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
        contracts,
        paymentLogs,
        setRole,
        recordPayment,
        rejectMember,
        undoRejectMember,
        approveHandover,
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
