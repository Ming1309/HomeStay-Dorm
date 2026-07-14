# Code Audit – UC 1.4.30 Quản lý tài sản

## Ánh xạ 3 tầng

| Thành phần | Code |
|---|---|
| `MHQuanLyTaiSan` | `AdminAssetsPage.tsx`, `asset-catalog-service.ts` |
| `QuanLyTaiSan` | `BusinessLogic/QuanLyTaiSan.cs` |
| `TaiSan` | `BusinessLogic/TaiSan.cs` |
| `TaiSanDB` | `DataAccess/DBs/TaiSanDB.cs` |

## Luồng nghiệp vụ

- Danh sách được tải từ `GET /api/admin/assets`; giao diện lọc theo từ khóa, phân loại và trạng thái.
- Entity kiểm tra tên, ba mã phân loại, giá trị bồi thường, mô tả và trạng thái trước khi ghi.
- Tên tài sản duy nhất được kiểm tra trong control và bảo vệ thêm bằng unique constraint.
- Xóa bị chặn nếu tài sản xuất hiện trong `Phong_TaiSan`, `ChiTietGiaoNhan` hoặc `ChiTietHoaDon`; có thể dùng `NgungApDung` thay cho xóa.
- Phân loại nội bộ gồm `NoiThat`, `ThietBiDien`, `TienIchBanGiao`; UI ánh xạ sang nhãn tiếng Việt.

## HTTP

| Method | Endpoint | Kết quả |
|---|---|---|
| GET, POST | `/api/admin/assets` | Danh sách / tạo tài sản |
| PUT, DELETE | `/api/admin/assets/{id}` | Sửa / xóa tài sản |

Tất cả endpoint yêu cầu role `QuanTri`; validation trả 400, không tìm thấy trả 404, trùng tên hoặc tham chiếu trả 409.
