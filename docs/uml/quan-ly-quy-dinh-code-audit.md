# UC 1.4.29 - Quản lý quy định lưu trú

## Phạm vi

- Tác nhân: `QuanTri`.
- Chức năng: xem, thêm, sửa, xóa và đọc văn bản PDF của quy định lưu trú.
- Trạng thái `ChuaApDung`, `DangApDung`, `HetHieuLuc` được tính từ ngày hiện tại; không lưu trong DB.

## Đối chiếu luồng

| Thao tác | Boundary | Control | Entity | Data access / schema |
|---|---|---|---|---|
| Xem danh sách | `AdminRegulationsPage` | `LayDanhSach` | `QuyDinh.LayDanhSach` | `QuyDinhDB.LayDanhSach` |
| Thêm | Form multipart | `Them` | Chuẩn hóa, kiểm tra, sinh mã, `Them` | `QuyDinhDB.Them`, `QuyDinhFileStorage.Luu` |
| Sửa | Form multipart | `CapNhat` | `Doc`, kiểm tra, `CapNhat` | `QuyDinhDB.CapNhat`, thay PDF khi có |
| Xóa | Dialog xác nhận | `Xoa` | `DangDuocThamChieu`, `Xoa` | Kiểm tra `HopDong.MaQD`, xóa DB rồi dọn PDF |
| Xem PDF | Nút `PDF` | `DocVanBan` | Không thay đổi nghiệp vụ | `QuyDinhFileStorage.Doc` |

## Quy tắc dữ liệu

- `LoaiQD` chỉ nhận sáu mã được mô tả trong tài liệu nghiệp vụ và CHECK constraint.
- PDF bắt buộc khi tạo, tối đa 10 MB, đúng phần mở rộng `.pdf` và chữ ký `%PDF-`.
- `NgayKetThuc` phải lớn hơn `NgayApDung`; ngày kết thúc vẫn được tính là còn hiệu lực.
- Không xóa bất kỳ quy định nào đã được `HopDong` tham chiếu để bảo toàn lịch sử hợp đồng.
- Tạo mới sinh mã tuần tự dưới khóa `UPDLOCK, HOLDLOCK` trong transaction.
