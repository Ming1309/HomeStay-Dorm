// Mock data for the Profile Approval screen (Manager role)

export type ApprovalMember = {
  id: string;
  fullName: string;
  gender: "male" | "female";
  dob: string;
  docType: "cccd" | "passport";
  docId: string;
  phone?: string;
  diaChiThuongTru: string;
  nationality?: string;
};

export type ApprovalProfile = {
  id: string;
  code: string; // e.g. PC001
  representative: {
    fullName: string;
    phone: string;
    dob: string;
    gender: "male" | "female";
    nationality: string;
    docType: "cccd" | "passport";
    docId: string;
    email: string;
    diaChiThuongTru: string;
  };
  room: string;
  rentalType: "whole" | "shared";
  bedsRented: number;
  submittedAt: string; // ISO timestamp
  submittedBy: string;
  members: ApprovalMember[];
};

export const mockApprovalProfiles: ApprovalProfile[] = [
  {
    id: "1",
    code: "PC002",
    room: "P.203",
    rentalType: "whole",
    bedsRented: 4,
    submittedAt: "2026-05-27T07:42:00Z",
    submittedBy: "NV. Lan",
    representative: {
      fullName: "Trần Thị Bình",
      phone: "0912345678",
      email: "binh.tran@example.com",
      gender: "female",
      dob: "15/03/1998",
      nationality: "Việt Nam",
      docType: "cccd",
      docId: "036098012345",
      diaChiThuongTru: "45 Đường Lý Thường Kiệt, P.7, Q.10, TP.HCM",
    },
    members: [
      {
        id: "m1",
        fullName: "Nguyễn Minh Tuấn",
        gender: "male",
        dob: "20/07/2000",
        docType: "cccd",
        docId: "038200456789",
        phone: "0901112233",
        diaChiThuongTru: "12 Nguyễn Trãi, P.2, Q.5, TP.HCM",
      },
      {
        id: "m2",
        fullName: "Phạm Lê Hương",
        gender: "female",
        dob: "05/11/1999",
        docType: "cccd",
        docId: "079099234567",
        phone: "0933445566",
        diaChiThuongTru: "88 Võ Văn Tần, P.6, Q.3, TP.HCM",
      },
      {
        id: "m3",
        fullName: "Đặng Quốc Hùng",
        gender: "male",
        dob: "12/01/2001",
        docType: "passport",
        docId: "B2345678",
        phone: "0977889900",
        diaChiThuongTru: "23 Trần Hưng Đạo, P.1, Q.1, TP.HCM",
      },
    ],
  },
  {
    id: "2",
    code: "PC003",
    room: "P.305",
    rentalType: "whole",
    bedsRented: 3,
    submittedAt: "2026-05-27T08:15:00Z",
    submittedBy: "NV. Hùng",
    representative: {
      fullName: "Lê Hoàng Cường",
      phone: "0987654321",
      email: "cuong.le@example.com",
      gender: "male",
      dob: "28/09/1995",
      nationality: "Việt Nam",
      docType: "cccd",
      docId: "040095876543",
      diaChiThuongTru: "156 Phan Đăng Lưu, P.3, Q. Bình Thạnh, TP.HCM",
    },
    members: [
      {
        id: "m4",
        fullName: "Vũ Thị Mai",
        gender: "female",
        dob: "14/06/1997",
        docType: "cccd",
        docId: "001097345678",
        phone: "0908765432",
        diaChiThuongTru: "9 Đinh Tiên Hoàng, P.1, Q. Bình Thạnh, TP.HCM",
      },
      {
        id: "m5",
        fullName: "Bùi Thanh Long",
        gender: "male",
        dob: "03/03/1998",
        docType: "passport",
        docId: "C1234567",
        phone: "0966554433",
        diaChiThuongTru: "71 Ngô Thị Thu Minh, P.2, Q. Tân Bình, TP.HCM",
      },
    ],
  },
  {
    id: "3",
    code: "PC005",
    room: "P.401",
    rentalType: "shared",
    bedsRented: 2,
    submittedAt: "2026-05-27T09:00:00Z",
    submittedBy: "NV. Sale",
    representative: {
      fullName: "Đỗ Minh Khang",
      phone: "0934567812",
      email: "khang.do@example.com",
      gender: "male",
      dob: "10/10/2000",
      nationality: "Việt Nam",
      docType: "cccd",
      docId: "052000987654",
      diaChiThuongTru: "34 Cộng Hòa, P.12, Q. Tân Bình, TP.HCM",
    },
    members: [
      {
        id: "m6",
        fullName: "Trịnh Ngọc Ánh",
        gender: "female",
        dob: "22/08/1999",
        docType: "cccd",
        docId: "070099765432",
        phone: "0911223344",
        diaChiThuongTru: "101 Hoàng Hoa Thám, P.6, Q. Bình Thạnh, TP.HCM",
      },
    ],
  },
  {
    id: "4",
    code: "PC007",
    room: "P.102",
    rentalType: "shared",
    bedsRented: 2,
    submittedAt: "2026-05-27T09:30:00Z",
    submittedBy: "NV. Lan",
    representative: {
      fullName: "Hoàng Văn Nam",
      phone: "0945678901",
      email: "nam.hoang@example.com",
      gender: "male",
      dob: "05/05/1996",
      nationality: "Việt Nam",
      docType: "cccd",
      docId: "033096111222",
      diaChiThuongTru: "28 Nguyễn Đình Chiểu, P.6, Q.3, TP.HCM",
    },
    members: [
      {
        id: "m7",
        fullName: "Cao Thị Thu",
        gender: "female",
        dob: "17/12/2002",
        docType: "cccd",
        docId: "056002654321",
        phone: "0922334455",
        diaChiThuongTru: "5 Bùi Thị Xuân, P.1, Q.1, TP.HCM",
      },
    ],
  },
];
