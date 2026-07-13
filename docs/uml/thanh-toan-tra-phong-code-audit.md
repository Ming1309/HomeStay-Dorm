# Code Audit Sheet - Thanh toán trả phòng (Thu hồi khoản nợ)

Bảng đối chiếu khớp chữ literal (literal string matching) giữa sơ đồ lớp UML, sơ đồ tuần tự và mã nguồn thực tế của tính năng **Thanh toán trả phòng / Thu hồi khoản nợ**.

## 1. Lớp Giao Diện (Presentation)

| Ký hiệu UML lớp / tuần tự | Mã nguồn thực tế | Đường dẫn file mã nguồn |
| :--- | :--- | :--- |
| `MHThanhToanTraPhong` | `CheckoutSettlementPage` / `CheckoutSettlementScreen` | [CheckoutSettlementPage.tsx](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Presentation/ClientApp/src/features/settlements/pages/CheckoutSettlementPage.tsx) |
| `grvDSPhieuDoiSoat` | Component `QueuePanel` | [CheckoutSettlementPage.tsx](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Presentation/ClientApp/src/features/settlements/pages/CheckoutSettlementPage.tsx) |
| `btnTienHanhThuTien_Click()` | Nút bấm `"Tiến hành thu tiền"` | [CheckoutSettlementPage.tsx](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Presentation/ClientApp/src/features/settlements/pages/CheckoutSettlementPage.tsx) |
| `hienThiDialogLapPhieuThu()` | Component `ReceiptCollectionDialog` | [ReceiptCollectionDialog.tsx](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Presentation/ClientApp/src/features/payments/components/ReceiptCollectionDialog.tsx) |
| `btnXacNhanThuTien_Click()` | `handleCreateReceipt` gọi API `POST /api/payments/phieu-thu` | [CheckoutSettlementPage.tsx](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Presentation/ClientApp/src/features/settlements/pages/CheckoutSettlementPage.tsx) |

---

## 2. Lớp Nghiệp Vụ (Application - Business Logic)

| Ký hiệu UML lớp / tuần tự | Mã nguồn thực tế | Đường dẫn file mã nguồn |
| :--- | :--- | :--- |
| `PhieuDoiSoat.layDSPhieuDoiSoatDaChot()` | `PhieuDoiSoat.LayDSPhieuDoiSoatDaChot()` | [PhieuDoiSoat.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/PhieuDoiSoat.cs) |
| `PhieuDoiSoat.layChiTietPhieuDoiSoat()` | `PhieuDoiSoat.LayChiTietPhieuDoiSoat(maPDS)` | [PhieuDoiSoat.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/PhieuDoiSoat.cs) |
| `PhieuDoiSoat.tinhToanKetQua()` | `PhieuDoiSoat.TinhToanKetQua(maPDS)` | [PhieuDoiSoat.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/PhieuDoiSoat.cs) |
| `PhieuDoiSoat.capNhatTrangThai()` | `PhieuDoiSoat.CapNhatTrangThai(maPDS, trangThai)` | [PhieuDoiSoat.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/PhieuDoiSoat.cs) |
| `HoaDon.layDSHoaDonTheoPhieuDoiSoat()` | `HoaDon.LayDSHoaDonTheoPhieuDoiSoat(maPDS)` | [HoaDon.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/HoaDon.cs) |
| `HoaDon.tinhTongKhauTru()` | `HoaDon.TinhTongKhauTru(maPDS)` | [HoaDon.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/HoaDon.cs) |
| `PhieuThu.taoPhieuThu()` | `PhieuThu.TaoPhieuThu(maPDS, soTien, phuongThuc, anhMinhChung, maNV)` | [PhieuThu.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/PhieuThu.cs) |
| `ChiTietDoiSoat.layDSHoaDonThuocPhieuDoiSoat()`| `ChiTietDoiSoat.LayDSHoaDonThuocPhieuDoiSoat(maPDS)`| [ChiTietDoiSoat.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/ChiTietDoiSoat.cs) |

---

## 3. Lớp Truy Xuất Dữ Liệu (Application - Data Access)

| Ký hiệu UML lớp / tuần tự | Mã nguồn thực tế | Đường dẫn file mã nguồn |
| :--- | :--- | :--- |
| `PhieuDoiSoatDB.getDSPhieuDoiSoatDaChot()` | `PhieuDoiSoatDB.GetDSPhieuDoiSoatDaChot()` | [PhieuDoiSoatDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/PhieuDoiSoatDB.cs) |
| `PhieuDoiSoatDB.getPhieuDoiSoatTheoMaPDS()` | `PhieuDoiSoatDB.GetPhieuDoiSoatTheoMaPDS(maPDS)` | [PhieuDoiSoatDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/PhieuDoiSoatDB.cs) |
| `PhieuDoiSoatDB.updateTrangThai()` | `PhieuDoiSoatDB.UpdateTrangThai(maPDS, trangThai)` | [PhieuDoiSoatDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/PhieuDoiSoatDB.cs) |
| `HoaDonDB.getDSHoaDonTheoMaPDS()` | `HoaDonDB.GetDSHoaDonTheoMaPDS(maPDS)` | [HoaDonDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/HoaDonDB.cs) |
| `HoaDonDB.tinhTongKhauTru()` | `HoaDonDB.TinhTongKhauTru(maPDS)` | [HoaDonDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/HoaDonDB.cs) |
| `PhieuThuDB.insertPhieuThu()` | `PhieuThuDB.InsertPhieuThu(phieuThu)` | [PhieuThuDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/PhieuThuDB.cs) |
| `ChiTietDoiSoatDB.getDSHoaDonThuocPhieuDoiSoat()`| `ChiTietDoiSoatDB.GetDSHoaDonThuocPhieuDoiSoat(maPDS)`| [ChiTietDoiSoatDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/ChiTietDoiSoatDB.cs) |
