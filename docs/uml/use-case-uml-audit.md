# Đối chiếu UML các Use Case hệ thống

`lap-phieu-coc-class.puml` và `lap-phieu-coc-sequence.puml` là cặp chuẩn về bố cục, màu và mức độ chi tiết. Bảng này dùng để bảo đảm mỗi Use Case trong mục 1.4 có đúng một class diagram và một sequence diagram, đồng thời chỉ ra lớp đang thực sự điều phối trong code.

| UC | Use Case | Tác nhân | Màn hình | Lớp điều phối chính | DB gốc | Trạng thái |
|---|---|---|---|---|---|---|
| 1.4.1 | Lập phiếu đăng ký | Sale | `MHLapPhieuDangKy` | `LapPhieuDangKy` | `PhieuDangKyDB` | Khớp code |
| 1.4.2 | Tra cứu phiếu đăng ký | Sale | `MHTraCuuPhieuDangKy` | `PhieuDangKy` | `PhieuDangKyDB` | Khớp code; không có use-case control riêng |
| 1.4.3 | Tạo lịch hẹn | Sale | `MHTaoLichHen` | `TaoLichHen` | `LichHenDB` | Khớp code |
| 1.4.4 | Tra cứu phòng/giường | Sale | `MHTraCuuPhongGiuong` | `Phong` | `PhongDB` | Khớp code; các entity tra cứu trực tiếp |
| 1.4.5 | Lập phiếu cọc | Sale | `MHLapPhieuCoc` | `LapPhieuCoc` | `PhieuCocDB` | Cặp UML chuẩn |
| 1.4.6 | Tính toán tiền cọc | Kế toán | `MHTinhTienCoc` | `TinhTienCoc` | `PhieuCocDB` | Khớp code |
| 1.4.7 | Ghi nhận thanh toán cọc | Sale | `MHGhiNhanThanhToanCoc` | `GhiNhanThanhToanCoc` | `PhieuCocDB` | Khớp code |
| 1.4.8 | Xác nhận khoản tiền cọc | Quản lý | `MHXacNhanKhoanTienCoc` | `XacNhanKhoanTienCoc` | `PhieuCocDB` | Khớp code |
| 1.4.9 | Tra cứu thông tin đặt cọc | Người dùng nghiệp vụ | `MHTraCuuPhieuCoc` | `TraCuuPhieuCoc` | `PhieuCocDB` | Khớp code |
| 1.4.10 | Huỷ phiếu cọc | Sale | `MHHuyPhieuCoc` | `HuyPhieuCoc` | `PhieuCocDB` | Chỉ mô tả huỷ thủ công; worker quá hạn tách khỏi UC |
| 1.4.11 | Nhập hồ sơ lưu trú | Sale | `MHNhapHoSoLuuTru` | `NhapHoSoLuuTru` | `PhieuCocDB` | Khớp code |
| 1.4.12 | Xét duyệt hồ sơ nhận phòng | Quản lý | `MHXetDuyetHoSo` | `XetDuyetHoSo` | `PhieuCocDB` | Đã thay luồng cũ gọi entity trực tiếp bằng use-case control thật |
| 1.4.13 | Lập hợp đồng thuê | Sale | `MHLapHopDongThue` | `LapHopDongThue` | `HopDongDB` | Khớp code |
| 1.4.14 | Xử lý thanh toán hợp đồng | Kế toán | `MHXuLyThanhToanHopDong` | `XuLyThanhToanHopDong` | `HopDongDB` | Đã thay sequence cũ bằng luồng thực tế tạo hóa đơn và phiếu thu |
| 1.4.15 | Lập biên bản bàn giao | Quản lý | `MHLapBienBanBanGiao` | `LapBienBanBanGiao` | `BienBanGiaoNhanDB` | Khớp code |
| 1.4.16 | Tra cứu hợp đồng | Người dùng nghiệp vụ | `MHTraCuuHopDong` | `TraCuuHopDong` | `HopDongDB` | Khớp code |
| 1.4.17 | Lập biên bản thu hồi tài sản | Quản lý | `MHLapBienBanThuHoiTaiSan` | `LapBienBanThuHoiTaiSan` | `BienBanGiaoNhanDB` | Đã bỏ control giả và dùng đúng BLL hiện tại |
| 1.4.18 | Lập phiếu đối soát | Kế toán | `MHLapPhieuDoiSoat` | `LapPhieuDoiSoat` | `PhieuDoiSoatDB` | Khớp code; bỏ thông báo khỏi luồng lõi |
| 1.4.19 | Xác nhận kết quả đối soát | Quản lý | `MHXacNhanPhieuDoiSoat` | `XacNhanPhieuDoiSoat` | `PhieuDoiSoatDB` | Khớp code |
| 1.4.20 | Xử lý thanh toán trả phòng | Kế toán | `MHThanhToanTraPhong` | `ThanhToanTraPhong` | `PhieuDoiSoatDB` | Khớp code |
| 1.4.21 | Lập hóa đơn bồi thường | Kế toán | `MHLapHoaDonBoiThuong` | `BienBanGiaoNhan`, `HoaDon` | `BienBanGiaoNhanDB` | Code chưa có use-case control riêng |
| 1.4.22 | Lập phiếu thu | Kế toán | `MHLapPhieuThu` | `PhieuDoiSoat`, `PhieuThu` | `PhieuThuDB` | Code chưa có use-case control riêng |
| 1.4.23 | Lập phiếu hoàn cọc | Kế toán | `MHHoanCoc` | `LapPhieuHoanCoc` | `PhieuHoanCocDB` | Khớp code |
| 1.4.24 | Thanh lý hợp đồng | Quản lý | `MHThanhLyHopDong` | `HopDong`, `PhieuDoiSoat` | `HopDongDB` | Controller hiện điều phối trực tiếp, chưa có use-case control riêng |
| 1.4.25 | Đăng nhập | Người dùng | `MHDangNhap` | `XacThucNguoiDung` | `TaiKhoanDB` | Khớp code |
| 1.4.26 | Quản lý phòng/giường | Quản trị | `MHQuanLyPhongGiuong` | `QuanLyPhongGiuong` | `PhongDB`, `GiuongDB` | Khớp code |
| 1.4.27 | Quản lý dịch vụ | Quản trị | `MHQuanLyDichVu` | `QuanLyDichVu` | `DichVuDB` | Khớp code |
| 1.4.28 | Quản trị người dùng | Quản trị | `MHQuanLyNguoiDung` | `QuanLyNguoiDung` | `TaiKhoanDB` | Khớp code |
| 1.4.29 | Quản lý chính sách hoàn cọc | Quản trị | `MHQuanLyChinhSachHoanCoc` | `QuanLyChinhSachHoanCoc` | `ChinhSachHoanCocDB` | Khớp code |
| 1.4.30 | Quản lý quy định | Quản trị | `MHQuanLyQuyDinh` | `QuanLyQuyDinh` | `QuyDinhDB` | Khớp code |
| 1.4.31 | Quản lý danh mục tài sản | Quản trị | `MHQuanLyTaiSan` | `QuanLyTaiSan` | `TaiSanDB` | Khớp code |

## Quy ước kiểm tra

- Mọi sequence lifeline phải có class tương ứng trong class diagram cùng tên.
- Mọi message có dấu ngoặc phải có phương thức cùng tên trong class diagram.
- Notification, transaction, HTTP controller/DTO và worker nền không thuộc sơ đồ Use Case lõi.
- Những dòng “không có use-case control riêng” phản ánh đúng code hiện tại, không phải đề xuất tạo thêm lớp giả trong UML.
