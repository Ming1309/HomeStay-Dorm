# Doi chieu literal: Thong bao noi bo

## Nguyen tac da trien khai

- Thong bao hanh dong moi duoc gui vao hop thu dung `MaCN + VaiTro`; phan hoi cho Sale uu tien `MaNVNhan` va van rang buoc chi nhanh.
- `MaCN`, vai tro va nhan vien nhan khong lay tu HTTP request. Service doc lai `NhanVien` va cac use case suy ra chi nhanh tu root record.
- Trang thai `DaDoc` la rieng tung nhan vien trong `ThongBao_NguoiDoc`; trang thai `DangMo/DaXuLy` la vong doi chung cua tac vu.
- `KhoaChongTrung` bien viec phat lai cung su kien thanh upsert, khong tao nhieu dong khi retry.
- Khi nhan vien duoc chi dinh khong con tai khoan hoat dong o dung vai tro/chi nhanh, task dang mo duoc fallback ve hop thu vai tro cua chi nhanh.
- Deep-link chi dua nguoi dung den queue/ho so. API dich van kiem tra role va scope chi nhanh, nen lien ket khong tao duong vuot quyen.

## Su kien nghiep vu co thong bao

- Cọc: lập phiếu, có kết quả tính cọc, gửi minh chứng, yêu cầu bổ sung, xác nhận cọc, tự/manual hủy phiếu đã thu tiền.
- Hồ sơ và hợp đồng: nhập hồ sơ lưu trú, duyệt/từ chối, lập và xác nhận hợp đồng, thu kỳ đầu, bàn giao.
- Trả phòng: lịch trả phòng, thu hồi tài sản, lập hóa đơn bồi thường, lập/xác nhận đối soát, thu thêm, thanh lý và hoàn cọc.
- Sự kiện thuần tra cứu, lưu nháp, tìm kiếm và thay đổi không tạo bàn giao công việc không phát thông báo.

## Bao ve du lieu

- Truy vấn danh sách, đánh dấu đã đọc và mở chi tiết đều áp dụng cùng predicate người nhận theo chi nhánh.
- Đọc hoặc đánh dấu thông báo ngoài phạm vi trả về không tìm thấy thay vì tiết lộ mã tồn tại.
- Tạo/đóng thông báo dùng cùng session/transaction với use case nguồn; rollback nghiệp vụ cũng rollback thông báo.
- Chỉ tác vụ đang mở và thông tin chưa đọc gần đây được tính vào badge; lịch sử vẫn xem tại `/notifications`.

## Gioi han chu dich

- Đây là thông báo nội bộ trong ứng dụng, không gửi SMS/email và không thay thế bước nhân viên liên hệ khách hàng.
- Contribution không triển khai cơ chế phân công độc quyền/claim task. Nhân viên cùng vai trò trong một chi nhánh cùng nhìn thấy task; người hoàn tất nghiệp vụ được ghi vào `MaNVXuLy`.
- Database demo cần khởi tạo lại từ `01_InitTables.sql` vì schema `ThongBao` được hợp nhất trực tiếp vào init.
