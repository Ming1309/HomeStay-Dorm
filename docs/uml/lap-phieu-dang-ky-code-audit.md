# Code audit — Lập phiếu đăng ký

- UI gọi API thật và kiểm tra response bằng Zod; không dùng mock/localStorage làm dữ liệu nghiệp vụ.
- `PhieuDangKyController` chỉ cho role `Sale` và lấy `MaNV` từ JWT claim, không nhận mã nhân viên từ client.
- `LapPhieuDangKy` đọc lại `NhanVien.MaCN` trong database và lưu snapshot `PhieuDangKy.MaCN`.
- Tra cứu và chi tiết phiếu đăng ký lọc theo snapshot chi nhánh ngay tại SQL.
- `LapPhieuDangKy` dùng một transaction cho khách hàng và phiếu đăng ký; mọi lỗi đều rollback.
- Ngày dự kiến vào ở trước ngày hiện tại bị từ chối bằng thời gian lấy từ `TimeProvider`.
- `PhieuDangKyDB.Them` cấp mã `PDK` bằng SQL sequence trước khi insert; factory không tự sinh mã.
