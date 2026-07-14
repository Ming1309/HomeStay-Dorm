# Code audit — Lập phiếu đăng ký

- UI gọi API thật và kiểm tra response bằng Zod; không dùng mock/localStorage làm dữ liệu nghiệp vụ.
- `PhieuDangKyController` chỉ cho role `Sale` và lấy `MaNV` từ JWT claim, không nhận mã nhân viên từ client.
- `LapPhieuDangKy` dùng một transaction cho khách hàng và phiếu đăng ký; mọi lỗi đều rollback.
- Ngày dự kiến vào ở trước ngày hiện tại bị từ chối bằng thời gian lấy từ `TimeProvider`.
- Mã phiếu được tạo theo timestamp millisecond. Đây là cơ chế hiện có; nếu triển khai nhiều instance với tải lớn nên thay bằng sequence/ULID do database bảo đảm duy nhất.
