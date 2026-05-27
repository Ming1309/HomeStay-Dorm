export type ContractDeposit = {
  id: string;
  code: string; // e.g., PC008
  room: string;
  representativeName: string;
  representativePhone: string;
  representativeAddress: string;
  membersCount: number;
  approvedAt: string; // ISO string
  baseRent: number;
  depositPaid: number;
};

export const mockApprovedDeposits: ContractDeposit[] = [
  {
    id: "c1",
    code: "PC012",
    room: "P.201",
    representativeName: "Trần Anh Tuấn",
    representativePhone: "0901234567",
    representativeAddress: "123 Đường Võ Thị Sáu, P.8, Q.3, TP.HCM",
    membersCount: 2,
    approvedAt: "2026-05-27T08:15:00Z",
    baseRent: 4000000,
    depositPaid: 8000000,
  },
  {
    id: "c2",
    code: "PC015",
    room: "P.304",
    representativeName: "Lê Thị Bích",
    representativePhone: "0987654321",
    representativeAddress: "57 Trần Quốc Thảo, P.7, Q.3, TP.HCM",
    membersCount: 1,
    approvedAt: "2026-05-27T09:30:00Z",
    baseRent: 3500000,
    depositPaid: 3500000,
  },
  {
    id: "c3",
    code: "PC018",
    room: "P.405",
    representativeName: "Phạm Văn Minh",
    representativePhone: "0911223344",
    representativeAddress: "299 Lê Văn Sỹ, P.14, Q.3, TP.HCM",
    membersCount: 3,
    approvedAt: "2026-05-27T10:00:00Z",
    baseRent: 5000000,
    depositPaid: 5000000,
  },
];
