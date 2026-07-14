# Code Audit – UC 1.4.26 Quản lý dịch vụ

## Ánh xạ 3 tầng

| Thành phần | Code |
|---|---|
| `MHQuanLyDichVu` | `AdminServicesPage.tsx`, `service-catalog-service.ts` |
| `QuanLyDichVu` | `BusinessLogic/QuanLyDichVu.cs` |
| `DichVu` | `BusinessLogic/DichVu.cs` |
| `DichVuDB` | `DataAccess/DBs/DichVuDB.cs` |

## Luồng nghiệp vụ

- Danh sách được tải từ `GET /api/admin/services`; tìm kiếm và lọc trạng thái thực hiện trên dữ liệu đã tải.
- Thêm/sửa chuẩn hóa tên và đơn vị, kiểm tra đơn giá cùng trạng thái rồi ghi trong transaction.
- Mã mới sinh tuần tự với khóa `UPDLOCK, HOLDLOCK`.
- Xóa bị chặn khi dịch vụ đã xuất hiện trong `HopDong_DichVu` hoặc `ChiTietHoaDon`; quản trị chuyển trạng thái sang `NgungApDung` để ngừng dùng.
- Cập nhật đơn giá danh mục không cập nhật `HopDong_DichVu.DonGiaKyKet` hoặc `ChiTietHoaDon.DonGia`.

## HTTP

| Method | Endpoint | Kết quả |
|---|---|---|
| GET, POST | `/api/admin/services` | Danh sách / tạo dịch vụ |
| PUT, DELETE | `/api/admin/services/{id}` | Sửa / xóa dịch vụ |

Tất cả endpoint yêu cầu role `QuanTri`; validation trả 400, không tìm thấy trả 404, xung đột tham chiếu trả 409.
