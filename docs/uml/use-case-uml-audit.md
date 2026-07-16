# Đối chiếu UML các Use Case hệ thống

`lap-phieu-coc-class.puml` và `lap-phieu-coc-sequence.puml` là cặp chuẩn về bố cục, màu và mức độ chi tiết. Bảng này dùng để bảo đảm mỗi Use Case trong mục 1.4 có đúng một class diagram và một sequence diagram, đồng thời chỉ ra lớp đang thực sự điều phối trong code.

| UC | Use Case | Tác nhân | Màn hình | Lớp điều phối chính | DB gốc | Trạng thái |
|---|---|---|---|---|---|---|
| 1.4.1 | Lập phiếu đăng ký | Sale | `MHLapPhieuDangKy` | `LapPhieuDangKy` | `PhieuDangKyDB` | Khớp code |
| 1.4.2 | Tra cứu phiếu đăng ký | Sale | `MHTraCuuPhieuDangKy` | `PhieuDangKy` | `PhieuDangKyDB` | Khớp code; không có use-case control riêng |
| 1.4.3 | Tạo lịch hẹn | Sale | `MHTaoLichHen` | `TaoLichHen` | `LichHenDB` | Khớp code |
| 1.4.4 | Tra cứu phòng/giường | Sale | `MHTraCuuPhongGiuong` | `Phong` | `PhongDB` | Khớp code; các entity tra cứu trực tiếp |
| 1.4.5 | Lập phiếu cọc | Sale | `MHLapPhieuCoc` | `LapPhieuCoc` | `PhieuCocDB` | Đã đối chiếu React/C#/DB; có tìm kiếm lịch hẹn và tạo thành viên đại diện |
| 1.4.6 | Tính toán tiền cọc | Kế toán | `MHTinhTienCoc` | `TinhTienCoc` | `PhieuCocDB` | Đã đối chiếu công thức, phạm vi chi nhánh và chữ ký cập nhật |
| 1.4.7 | Ghi nhận thanh toán cọc | Sale | `MHGhiNhanThanhToanCoc` | `GhiNhanThanhToanCoc` | `PhieuCocDB` | Đã đối chiếu queue/detail, đổi-xóa-xem file và file storage |
| 1.4.8 | Xác nhận khoản tiền cọc | Quản lý | `MHXacNhanKhoanTienCoc` | `XacNhanKhoanTienCoc` | `PhieuCocDB` | Đã đối chiếu chứng từ, hai dialog xác nhận và tạo Phiếu thu |
| 1.4.9 | Tra cứu thông tin đặt cọc | Người dùng nghiệp vụ | `MHTraCuuPhieuCoc` | `TraCuuPhieuCoc` | `PhieuCocDB` | Đã đối chiếu đủ tiêu chí, kết quả và detail theo chi nhánh |
| 1.4.10 | Huỷ phiếu cọc | Sale | `MHHuyPhieuCoc` | `TraCuuPhieuCoc` (đọc), `HuyPhieuCoc` (ghi) | `PhieuCocDB` | Đã bổ sung queue/detail và đúng thứ tự hủy → giải phóng; worker quá hạn tách khỏi UC |
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

## Nguồn giao diện dùng để đối chiếu

Boundary `MH...` không được suy ra từ đặc tả hoặc DTO. Thuộc tính màn hình được đối chiếu trực tiếp với React theo các nhóm:

- UC 1.4.1–1.4.4: `features/registrations`, `features/appointments`, `features/rooms`.
- UC 1.4.5–1.4.10: `features/deposits` và các route Sale/Kế toán/Quản lý tương ứng.
- UC 1.4.11–1.4.17: `features/residence`, `features/contracts`, `features/handovers`.
- UC 1.4.18–1.4.24: `features/settlements`, `features/payments` và route hoàn cọc.
- UC 1.4.25–1.4.31: `features/auth`, `features/administration`.

Chỉ đưa vào boundary các control nhập liệu, dữ liệu nghiệp vụ đang hiển thị, bảng/queue, nút và dialog có hành vi. Không đưa icon, layout container thuần trang trí, toast, loading state, hook hoặc HTTP DTO vào UML.

## Quy ước self-call và mức trừu tượng

- Sequence diagram mô tả sự phối hợp trách nhiệm, không chép lại toàn bộ chuỗi wrapper trong source.
- Giữ self-call của boundary để thể hiện handler được kích hoạt bởi thao tác người dùng.
- Chỉ giữ self-call nghiệp vụ cho kiểm tra điều kiện, tính toán, chuyển trạng thái, giữ/giải phóng tài nguyên hoặc một bước điều phối đáng kể.
- Wrapper chỉ đổi tên hoặc chuyển tiếp xuống DB được rút gọn thành lời gọi từ method nghiệp vụ hiện tại xuống entity DB; wrapper đó không xuất hiện trong class diagram của UC.
- `NhanVien.DocPhamVi(maNV)` được biểu diễn thống nhất bằng `UseCase -> NhanVien -> NhanVienDB.DocChiTiet`; không vẽ self-call `NhanVien.DocChiTiet`.
- Validator ánh xạ alias sequence về đúng class nhận message. Method trùng tên trên DB không thể thay thế method còn thiếu trên BUS/entity.
- Với sáu UC phiếu cọc 1.4.5–1.4.10, validator còn so khớp số tham số của từng message với đúng chữ ký trên class nhận message.

## Kết quả kiểm tra ngày 16/07/2026

- Đủ 31 cặp class/sequence cho UC 1.4.1–1.4.31; cặp `thong-bao-*` là sơ đồ kỹ thuật riêng và không tính vào bộ Use Case.
- Đã bổ sung thuộc tính GUI còn thiếu cho toàn bộ 31 boundary; bốn màn hình từng không có thuộc tính là Lập PĐS, Lập PHC, Tạo lịch hẹn và Xác nhận PĐS đã được đối chiếu lại từ React.
- `MHGhiNhanThanhToanCoc` đã được bổ sung toàn bộ phần chi tiết phiếu, hạn thanh toán, file preview và action; đồng thời sửa phạm vi chi nhánh, đọc khóa cập nhật và file storage trong class/sequence.
- Sáu UC phiếu cọc đã được audit lại theo `React → boundary → BUS/entity → DB/file storage`: bổ sung tìm kiếm lịch hẹn, các số đếm queue/kết quả, khóa `MaCN/MaPhong/MaNV`, quan hệ khách–phòng–giường, dialog chứng từ và luồng đọc queue/detail của màn Hủy phiếu cọc.
- Sequence Hủy phiếu cọc đã sửa đúng thứ tự source: kiểm tra hợp đồng, đọc phòng, chuyển phiếu sang `DaHuy`, giải phóng từng giường, rồi mới lưu phiếu và phòng.
- Không còn phương thức chỉ xuất hiện ở class hoặc chỉ xuất hiện ở sequence trên đúng receiver theo `scripts/validate-uml-consistency.sh`.
- Các self-call wrapper của `NhanVien`, `HopDong`, `PhieuCoc` và `ThanhVienHopDong` đã được loại bỏ; các self-call validation, tính toán và chuyển trạng thái được giữ có chủ đích.
- Tất cả phương thức BUS/DB trong 31 class diagram đều tồn tại trong source C# đúng lớp sở hữu.
- Các message từ GUI xuống BUS/DB đều là lời gọi phương thức; câu mô tả bằng lời chỉ còn ở tương tác tác nhân với giao diện.
- Không còn return arrow, `note`, controller, `PhienDuLieu` hoặc chi tiết transaction trong 31 sequence diagram.
- Bộ hiện tại có 67 file PlantUML: 31 cặp Use Case, một cặp kỹ thuật thông báo, một cặp dashboard và sơ đồ tổng quan Use Case; toàn bộ phải qua `plantuml -checkonly` và render PNG/SVG cục bộ trước khi bàn giao.
