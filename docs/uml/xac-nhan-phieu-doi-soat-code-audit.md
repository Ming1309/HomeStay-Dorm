# Code Audit Sheet - Xác nhận phiếu đối soát

| Hành vi | Code | Ràng buộc |
|---|---|---|
| Tải hàng đợi | `XacNhanPhieuDoiSoat.LayDanhSachChoXacNhan()` | Chỉ lấy PĐS `ChoXacNhan`; response summary có khách, phòng, SĐT, loại kết quả và số tiền. |
| Tải chi tiết | `XacNhanPhieuDoiSoat.LayChiTiet()` | Mỗi lần chọn đều đọc PĐS, phiếu cọc và hóa đơn; trả công thức, liên hệ, khấu trừ và điều kiện xác nhận. |
| Kiểm tra liên hệ | `KhachHang.CoKenhLienHe()` | Có ít nhất SĐT hoặc email. Hồ sơ thiếu cả hai vẫn xem được nhưng bị khóa xác nhận. |
| Kiểm tra dữ liệu nền | `XacNhanPhieuDoiSoat.DocPhieuCocVaKiemTraDuLieuNen()` | Phiếu cọc phải có khách, phòng và số tiền cọc dương; dữ liệu thiếu trả 409. |
| Phân loại kết quả | `PhieuDoiSoat.XacDinhKetQua()` | Chuẩn hóa `Hoan`, `ThuThem`, `HoaVon` và số tiền tương ứng cho queue/detail. |
| Xác nhận | `XacNhanPhieuDoiSoat.XacNhan()` | Khóa PĐS, đọc lại phiếu cọc trong transaction và kiểm tra liên hệ; không tin dữ liệu queue/detail từ client. |
| Ghi nhận xác nhận | `PhieuDoiSoat.XacNhanKhachHangDongY()` | Lưu người và thời điểm; optimistic update trả 409 khi tranh chấp. Không yêu cầu ghi chú xác nhận. |
| Chuyển trạng thái | `PhieuDoiSoatDB.XacNhan()` | `ChoXacNhan -> DaChot`; hòa vốn chuyển thẳng `DaTatToan`. |
| Phân luồng | `XacNhanPhieuDoiSoat.XacNhan()` | Thông báo Kế toán thu thêm hoặc hoàn trước hợp đồng sau khi Quản lý xác nhận. |

Frontend tách queue/detail, kiểm tra response bằng Zod và không render form nếu contract thiếu trường hoặc chứa số tiền không hữu hạn. POST chỉ gửi `khachHangDongY`.

Schema tiếp tục giữ cột nullable `GhiChuXacNhan` để tương thích dữ liệu cũ, nhưng luồng mới không còn nhập hoặc ghi trường này. Audit xác nhận dùng `KhachHangDongY`, `MaNVChot` và `ThoiDiemChot`.
