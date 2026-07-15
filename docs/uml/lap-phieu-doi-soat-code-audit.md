# Đối chiếu code: Lập phiếu đối soát

PĐS mới được tạo ở trạng thái `ChoXacNhan`. Kết quả chỉ được đưa sang hàng đợi thu thêm, hoàn cọc hoặc thanh lý sau use case Quản lý xác nhận khách hàng đồng ý.

## Luồng kiến trúc

- `LapPhieuDoiSoat` chỉ điều phối các business entity; control không gọi `*DB` trực tiếp.
- Hàng đợi dùng duy nhất truy vấn `DaHuy + đã thực thu + chưa có hợp đồng + chưa có PĐS`; số tiền hiển thị là `PhieuThu.SoTienThu`, ngày yêu cầu là `ThoiDiemHuy`.
- API xem tính toán và API tạo PĐS cùng gọi lại `LayPhieuCocDaHuyChoDoiSoat`, nên không tin dữ liệu hàng đợi hoặc chỉ báo `loaiHoSo` từ client.
- Phiếu cọc hủy dùng chính sách có hiệu lực tại ngày lập đối soát và `TiLe_ChuaKy`; tiền hoàn được tính từ số tiền thực thu.

## Ràng buộc và tranh chấp

- `UX_PhieuDoiSoat_PhieuCocChuaKy` là filtered unique index trên `MaPhieuCoc` khi `MaHD IS NULL` và được tạo trực tiếp trong `01_InitTables.sql`.
- Lệnh insert PĐS trước hợp đồng dùng khóa `UPDLOCK, HOLDLOCK` và điều kiện không tồn tại để hai request đồng thời chỉ tạo được một chứng từ.
- Trạng thái hoặc dữ liệu không còn hợp lệ được ném dưới dạng `InvalidOperationException`; controller trả HTTP 409 để UI xóa lựa chọn và tải lại hàng đợi.

## Giao diện và kiểm thử

- Màn hình khóa thao tác bằng `isSubmitting`, không cho double-submit và reload queue khi gặp 409.
- Unit test bao phủ điều kiện phiếu cọc hủy, khớp tiền thực thu và phép tính `SoTienThu × TiLe_ChuaKy`; unique index và câu lệnh insert bảo vệ concurrency ở tầng dữ liệu.
