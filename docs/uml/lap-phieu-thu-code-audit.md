# Code Audit Sheet - Lập phiếu thu (LapPhieuThu)

Bảng đối chiếu khớp chữ literal (literal string matching) giữa sơ đồ lớp UML, sơ đồ tuần tự và mã nguồn thực tế của tính năng **Lập phiếu thu**.

## 1. Lớp Giao Diện (Presentation)

| Ký hiệu UML lớp / tuần tự | Mã nguồn thực tế | Đường dẫn file mã nguồn |
| :--- | :--- | :--- |
| `MHLapPhieuThu` | Component `ReceiptCollectionDialog` | [ReceiptCollectionDialog.tsx](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Presentation/ClientApp/src/features/payments/components/ReceiptCollectionDialog.tsx) |
| `lblSoTienThuTuMayChu` | Hiển thị `tienThuThem`; request không gửi số tiền | `CheckoutSettlementPage.tsx` |
| `radTienMat` / `radChuyenKhoan` | Ánh xạ API `TienMat` / `ChuyenKhoan` | `CheckoutSettlementPage.tsx` |
| `btnXacNhanThuTien_Click()` | Sự kiện xác nhận thanh toán gọi API `POST /api/payments/phieu-thu` | [CheckoutSettlementPage.tsx](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Presentation/ClientApp/src/features/settlements/pages/CheckoutSettlementPage.tsx) |

---

## 2. Lớp Nghiệp Vụ (Application - Business Logic)

| Ký hiệu UML lớp / tuần tự | Mã nguồn thực tế | Đường dẫn file mã nguồn |
| :--- | :--- | :--- |
| `PhieuDoiSoat.layChiTietPhieuDoiSoat()` | `PhieuDoiSoat.LayChiTietPhieuDoiSoat(maPDS)` | [PhieuDoiSoat.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/PhieuDoiSoat.cs) |
| `PhieuDoiSoat.chuyenSangDaTatToan()` | `PhieuDoiSoat.ChuyenSangDaTatToan(maPDS)` | `PhieuDoiSoat.cs` |
| `PhieuThu.daTonTaiChoPhieuDoiSoat()` | Chặn tạo trùng trước khi ghi | `PhieuThu.cs` |
| `HoaDon.layDSHoaDonCanThuTheoPDS()` | `HoaDon.LayDSHoaDonCanThuTheoPDS(maPDS)` | [HoaDon.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/HoaDon.cs) |
| `HoaDon.tinhTongCanThu()` | `HoaDon.TinhTongCanThu(maPDS)` | [HoaDon.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/HoaDon.cs) |
| `PhieuThu.taoPhieuThu()` | `PhieuThu.TaoPhieuThu(maPDS, soTien, phuongThuc, anhMinhChung, maNV)` | [PhieuThu.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/PhieuThu.cs) |
| `NhanVien.layThongTinNhanVien()` | `NhanVien.LayThongTinNhanVien(maNV)` | [NhanVien.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/BusinessLogic/NhanVien.cs) |

---

## 3. Lớp Truy Xuất Dữ Liệu (Application - Data Access)

| Ký hiệu UML lớp / tuần tự | Mã nguồn thực tế | Đường dẫn file mã nguồn |
| :--- | :--- | :--- |
| `PhieuDoiSoatDB.getPhieuDoiSoatTheoMaPDS()` | `PhieuDoiSoatDB.GetPhieuDoiSoatTheoMaPDS(maPDS)` | [PhieuDoiSoatDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/PhieuDoiSoatDB.cs) |
| `PhieuDoiSoatDB.updateTrangThai()` | Cập nhật có điều kiện `DaChot -> DaTatToan` | `PhieuDoiSoatDB.cs` |
| `PhieuThuDB.tonTaiTheoMaPhieuDoiSoat()` | Kiểm tra trùng theo `MaPDS`; schema có unique filtered index | `PhieuThuDB.cs`, `01_InitTables.sql` |
| `HoaDonDB.getDSHoaDonCanThuTheoPDS()` | `HoaDonDB.GetDSHoaDonCanThuTheoPDS(maPDS)` | [HoaDonDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/HoaDonDB.cs) |
| `HoaDonDB.tinhTongCanThu()` | `HoaDonDB.TinhTongCanThu(maPDS)` | [HoaDonDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/HoaDonDB.cs) |
| `PhieuThuDB.insertPhieuThu()` | `PhieuThuDB.InsertPhieuThu(phieuThu)` | [PhieuThuDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/PhieuThuDB.cs) |
| `NhanVienDB.getNhanVienTheoMaNV()` | `NhanVienDB.GetNhanVienTheoMaNV(maNV)` | [NhanVienDB.cs](file:///c:/Users/PC/Downloads/PTTK-HTTT/HomeStay-Dorm/src/HomeStay.Application/DataAccess/DBs/NhanVienDB.cs) |
