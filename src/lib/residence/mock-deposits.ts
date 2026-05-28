export type Deposit = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email: string;
  gender: "male" | "female";
  room: string;
  time: string;
  rentalType: "whole" | "shared";
  bedsRented: number;
};

export const mockDeposits: Deposit[] = [
  {
    id: "1",
    code: "PC001",
    customerName: "Nguyễn Văn An",
    phone: "0901234567",
    email: "an.nguyen@example.com",
    gender: "male",
    room: "P.101",
    time: "14:00",
    rentalType: "shared",
    bedsRented: 1,
  },
  {
    id: "2",
    code: "PC002",
    customerName: "Trần Thị Bình",
    phone: "0912345678",
    email: "binh.tran@example.com",
    gender: "female",
    room: "P.203",
    time: "14:30",
    rentalType: "whole",
    bedsRented: 4,
  },
  {
    id: "3",
    code: "PC003",
    customerName: "Lê Hoàng Cường",
    phone: "0987654321",
    email: "cuong.le@example.com",
    gender: "male",
    room: "P.305",
    time: "15:00",
    rentalType: "whole",
    bedsRented: 3,
  },
  {
    id: "4",
    code: "PC004",
    customerName: "Phạm Thu Dung",
    phone: "0978123456",
    email: "dung.pham@example.com",
    gender: "female",
    room: "P.102",
    time: "15:30",
    rentalType: "shared",
    bedsRented: 1,
  },
  {
    id: "5",
    code: "PC005",
    customerName: "Đỗ Minh Khang",
    phone: "0934567812",
    email: "khang.do@example.com",
    gender: "male",
    room: "P.401",
    time: "16:00",
    rentalType: "shared",
    bedsRented: 2,
  },
];
