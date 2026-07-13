# Đối chiếu code: Tra cứu và Hủy phiếu cọc

## Luồng kiến trúc

- `MHTraCuuPhieuCoc` chỉ gọi API của `TraCuuPhieuCoc`; màn hình không có thao tác thay đổi dữ liệu.
- `MHHuyPhieuCoc` dùng `TraCuuPhieuCoc` để tải danh sách/chi tiết và dùng `HuyPhieuCoc` cho thao tác hủy.
- `HuyPhieuCoc` điều phối `HopDong`, `PhieuCoc`, `Phong`; mỗi business entity tự gọi DB class tương ứng.
- Phiên dữ liệu bao trọn kiểm tra hợp đồng, đổi trạng thái phiếu và giải phóng giường/phòng bằng isolation `Serializable`.

## Trạng thái và dữ liệu

- Phiếu được cập nhật thành `DaHuy`, đồng thời lưu `ThoiDiemHuy` và `MaNVHuy`.
- Chỉ giường thuộc chi tiết phiếu và đang `GiuCho`/`DaCoc` được chuyển về `Trong`.
- Phòng trở thành `Trong` khi mọi giường đều trống; trường hợp còn giường bận là `ConGiuongTrong`.
- Hàng đợi Kế toán chỉ đọc phiếu đã hủy có `PhieuThu` và chưa có `PhieuDoiSoat`; hủy không tạo chứng từ đối soát rỗng.

## Ranh giới HTTP

- Tra cứu cho `Sale`, `QuanLy`, `KeToan`; hủy chỉ cho `Sale` và lấy `MaNV` từ claim đăng nhập.
- Tranh chấp trạng thái hoặc hợp đồng được trả về HTTP 409 để giao diện tải lại danh sách.
