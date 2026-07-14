# Đối chiếu code: Tra cứu và Hủy phiếu cọc

## Luồng kiến trúc

- `MHTraCuuPhieuCoc` chỉ gọi API của `TraCuuPhieuCoc`; màn hình không có thao tác thay đổi dữ liệu.
- `MHHuyPhieuCoc` dùng `TraCuuPhieuCoc` để tải danh sách/chi tiết và dùng `HuyPhieuCoc` cho thao tác hủy.
- `HuyPhieuCoc` điều phối `HopDong`, `PhieuCoc`, `Phong` và `DichVuThongBao`; mỗi business entity tự gọi DB class tương ứng.
- Phiên dữ liệu bao trọn kiểm tra hợp đồng, đổi trạng thái phiếu, giải phóng giường/phòng và tạo thông báo bằng isolation `Serializable`.

## Trạng thái và dữ liệu

- Phiếu được cập nhật thành `DaHuy`, đồng thời lưu `ThoiDiemHuy` và `MaNVHuy`.
- Chỉ giường thuộc chi tiết phiếu và đang `GiuCho`/`DaCoc` được chuyển về `Trong`.
- Phòng trở thành `Trong` khi mọi giường đều trống; trường hợp còn giường bận là `ConGiuongTrong`.
- Nếu phiếu đã có `PhieuThu`, thao tác hủy tạo thông báo cho vai trò `KeToan`, liên kết `/accountant/doi-soat`; lỗi ghi thông báo rollback toàn bộ thao tác hủy.
- Hàng đợi Kế toán chỉ đọc phiếu `DaHuy`, có thời điểm hủy, chưa có hợp đồng, có `PhieuThu.SoTienThu > 0` khớp `PhieuCoc.TongTien` và chưa có `PhieuDoiSoat` trước hợp đồng.
- Phiếu chưa thu tiền vẫn được hủy và giải phóng chỗ nhưng không có thông báo đối soát và không lọt hàng đợi.

## Tu dong huy qua han

- Worker quet theo `DepositExpiry.ScanIntervalSeconds`, lay tung batch phiếu `ChoThanhToan` da den `HanThanhToan`, chua co `PhieuThu` va chua co `HopDong`.
- Tung phiếu duoc doc lai voi khoa cap nhat va kiem tra dieu kien trong mot transaction rieng. Mot phiếu loi khong lam rollback cac phiếu da xu ly trong cung luot quet.
- He thong dat `DaHuy`, `ThoiDiemHuy`, de `MaNVHuy=NULL`, giai phong giuong/phong va gui thong bao cho vai tro `Sale`. Tra cuu hien `He thong (qua han thanh toan)` khi khong co nhan vien huy.
- Tu dong huy khong tao `PhieuDoiSoat` hay thong bao Ke toan vi phiếu chua co `PhieuThu`.

## Ranh giới HTTP

- Tra cứu cho `Sale`, `QuanLy`, `KeToan`; hủy chỉ cho `Sale` và lấy `MaNV` từ claim đăng nhập.
- Tranh chấp trạng thái hoặc hợp đồng được trả về HTTP 409 để giao diện tải lại danh sách.
