USE HomeStay;
GO

-- ============================================================
-- SCRIPT SEED DATA (DỮ LIỆU MẪU BAN ĐẦU)
-- Dùng để khởi tạo các danh mục cơ bản cho hệ thống
-- ============================================================

-- 1. Chi Nhánh
INSERT INTO ChiNhanh (MaCN, TenChiNhanh, DiaChi, SDT)
VALUES 
('CN01', N'Chi nhánh Trung Tâm', N'123 Đường A, Quận 1, TP.HCM', '0901234567'),
('CN02', N'Chi nhánh Làng Đại Học', N'456 Đường B, TP. Thủ Đức, TP.HCM', '0909876543');
GO

-- 2. Nhân Viên
-- VaiTro: Sale, KeToan, QuanLy
INSERT INTO NhanVien (MaNV, HoTen, SDT, VaiTro, MaCN)
VALUES 
('NV01', N'Nguyễn Văn Quản Lý', '0911111111', N'QuanLy', 'CN01'),
('NV02', N'Trần Thị Kế Toán', '0922222222', N'KeToan', 'CN01'),
('NV03', N'Lê Văn Sale', '0933333333', N'Sale', 'CN01'),
('NV04', N'Phạm Sale Hai', '0944444444', N'Sale', 'CN02'),
('NV05', N'Võ Minh Quản Lý', '0955555555', N'QuanLy', 'CN02'),
('NV06', N'Đặng Thu Kế Toán', '0966666666', N'KeToan', 'CN02');
GO

-- 3. Loại Phòng
INSERT INTO LoaiPhong (MaLP, TenLoaiPhong, SucChua, GiaThue)
VALUES 
('LP01', N'Phòng 8 sinh viên', 8, 230000),
('LP02', N'Phòng 6 sinh viên', 6, 310000),
('LP03', N'Phòng dịch vụ 6 sinh viên có máy lạnh, rèm', 6, 310000),
('LP04', N'Phòng dịch vụ 4 sinh viên', 4, 950000),
('LP05', N'Phòng dịch vụ 4 sinh viên: có máy lạnh, rèm', 4, 950000),
('LP06', N'Phòng dịch vụ 4 sinh viên: có máy lạnh, rèm, tủ lạnh, máy giặt', 4, 950000),
('LP07', N'Phòng dịch vụ 4 sinh viên: có máy lạnh, rèm, tủ lạnh, máy giặt, máy nước nóng, kệ dép', 4, 950000),
('LP08', N'Phòng dịch vụ 2 sinh viên', 2, 1900000),
('LP09', N'Phòng dịch vụ 2 sinh viên: có máy lạnh, rèm', 2, 1900000),
('LP10', N'Phòng dịch vụ 2 sinh viên: có máy lạnh, rèm, tủ lạnh, máy giặt', 2, 1900000),
('LP11', N'Phòng dịch vụ 2 sinh viên: có máy lạnh, rèm, tủ lạnh, máy giặt, máy nước nóng, kệ dép, nệm, tủ, bàn, ghế', 2, 1900000);
GO

-- 4. Phòng
-- TrangThai: Trong, GiuCho, DaCoc, DangSuDung, DangBaoTri, NgungSuDung
INSERT INTO Phong (MaPhong, SoPhong, ToaNha, Tang, GioiTinhChoPhep, TrangThai, MaLP, MaCN)
VALUES 
('P001', '101', N'Tòa A', N'Tầng 1', N'Nam', N'Trong', 'LP07', 'CN01'),
('P002', '102', N'Tòa A', N'Tầng 1', N'Nữ', N'Trong', 'LP06', 'CN01'),
('P003', '201', N'Tòa B', N'Tầng 2', N'Nam', N'Trong', 'LP02', 'CN02');
GO

-- 5. Giường
-- Dành cho phòng 101 (4 giường)
INSERT INTO Giuong (MaGiuong, SoGiuong, TrangThai, MaPhong)
VALUES 
('G001', N'Giường A', N'Trong', 'P001'),
('G002', N'Giường B', N'Trong', 'P001'),
('G003', N'Giường C', N'Trong', 'P001'),
('G004', N'Giường D', N'Trong', 'P001'),

-- Dành cho phòng 102 (4 giường)
('G005', N'Giường A', N'Trong', 'P002'),
('G006', N'Giường B', N'Trong', 'P002'),
('G007', N'Giường C', N'Trong', 'P002'),
('G008', N'Giường D', N'Trong', 'P002'),

-- Dành cho phòng 201 (6 giường, khớp LP02)
('G009', N'Giường A', N'Trong', 'P003'),
('G010', N'Giường B', N'Trong', 'P003'),
('G011', N'Giường C', N'Trong', 'P003'),
('G012', N'Giường D', N'Trong', 'P003'),
('G013', N'Giường E', N'Trong', 'P003'),
('G014', N'Giường F', N'Trong', 'P003');
GO

-- 6. Dịch Vụ
INSERT INTO DichVu (MaDV, TenDV, DonGia, DonViTinh, TrangThai)
VALUES 
('DV01', N'Tiền Điện', 3500, N'kWh', N'DangApDung'),
('DV02', N'Tiền Nước', 20000, N'Khối', N'DangApDung'),
('DV03', N'Phí Quản Lý Chung', 100000, N'Tháng/Người', N'DangApDung'),
('DV04', N'Gửi xe máy', 150000, N'Tháng/Chiếc', N'DangApDung'),
('DV05', N'Tiền Wifi/Internet', 50000, N'Tháng/Người', N'DangApDung');
GO

-- 7. Tài Sản
INSERT INTO TaiSan (MaTS, TenTaiSan, LoaiTaiSan, GiaTri, MoTa, TrangThai)
VALUES 
('TS01', N'Máy Lạnh', N'ThietBiDien', 8000000, NULL, N'DangApDung'),
('TS02', N'Tủ lạnh', N'ThietBiDien', 5000000, NULL, N'DangApDung'),
('TS03', N'Giường tầng sắt 2 chỗ', N'NoiThat', 2500000, NULL, N'DangApDung'),
('TS04', N'Tủ quần áo cá nhân', N'NoiThat', 1500000, NULL, N'DangApDung'),
('TS05', N'Rèm cửa chống nắng', N'NoiThat', 800000, NULL, N'DangApDung'),
('TS06', N'Máy giặt', N'ThietBiDien', 4500000, NULL, N'DangApDung'),
('TS07', N'Máy nước nóng', N'ThietBiDien', 2500000, NULL, N'DangApDung'),
('TS08', N'Kệ để dép 4 tầng', N'NoiThat', 250000, NULL, N'DangApDung'),
('TS09', N'Nệm cao su non', N'NoiThat', 1200000, NULL, N'DangApDung'),
('TS10', N'Bàn học gỗ', N'NoiThat', 600000, NULL, N'DangApDung'),
('TS11', N'Ghế xoay', N'NoiThat', 450000, NULL, N'DangApDung'),
('TS12', N'Chìa khóa phòng', N'TienIchBanGiao', 50000, NULL, N'DangApDung'),
('TS13', N'Thẻ từ ra vào cổng', N'TienIchBanGiao', 100000, NULL, N'DangApDung');
GO

-- 8. Phòng - Tài Sản
INSERT INTO Phong_TaiSan (MaPhong, MaTS, SoLuongTieuChuan)
VALUES 
-- Phòng 101 (P001) - Dùng LP07: có máy lạnh, rèm, tủ lạnh, máy giặt, máy nước nóng, kệ dép
('P001', 'TS01', 1), -- 1 Máy lạnh
('P001', 'TS05', 2), -- 2 Rèm cửa
('P001', 'TS02', 1), -- 1 Tủ lạnh
('P001', 'TS06', 1), -- 1 Máy giặt
('P001', 'TS07', 1), -- 1 Máy nước nóng
('P001', 'TS08', 1), -- 1 Kệ dép
('P001', 'TS03', 2), -- 2 Giường tầng (4 chỗ ngủ)
('P001', 'TS04', 4), -- 4 Tủ cá nhân
('P001', 'TS12', 4), -- 4 Chìa khóa phòng
('P001', 'TS13', 4), -- 4 Thẻ từ ra vào cổng

-- Phòng 102 (P002) - Dùng LP06: có máy lạnh, rèm, tủ lạnh, máy giặt
('P002', 'TS01', 1), -- 1 Máy lạnh
('P002', 'TS05', 2), -- 2 Rèm cửa
('P002', 'TS02', 1), -- 1 Tủ lạnh
('P002', 'TS06', 1), -- 1 Máy giặt
('P002', 'TS03', 2), -- 2 Giường tầng (4 chỗ ngủ)
('P002', 'TS04', 4), -- 4 Tủ cá nhân
('P002', 'TS12', 4), -- 4 Chìa khóa phòng
('P002', 'TS13', 4); -- 4 Thẻ từ ra vào cổng
-- Lưu ý: tài sản P007 (phòng demo UC thu hồi) được seed trong 04_DemoScenarios.sql
-- vì P007 chỉ được tạo ở script kịch bản.
GO

-- 9. Quy Định
INSERT INTO QuyDinh (MaQD, TenQD, LoaiQD, DuongDanFile, NgayApDung, NgayKetThuc)
VALUES 
('QD01', N'Nội quy Ký túc xá / Homestay Năm 2024', N'NoiQuySinhHoat',
 '/api/admin/regulations/documents/noi-quy-2024.pdf', '2024-01-01', NULL),
('QD02', N'Điều khoản thuê v1.0', N'DieuKienLuuTru',
 '/api/admin/regulations/documents/dieu-khoan-thue-v1.pdf', '2024-01-01', NULL),
('QD03', N'Quy định xử lý vi phạm v1.1', N'ViPhamBoiThuong',
 '/api/admin/regulations/documents/quy-dinh-xu-ly-vi-pham-v1-1.pdf', '2024-01-01', NULL);
GO

-- 10. Chính Sách Hoàn Cọc
-- TiLe_ChuaKy: Hoàn cọc nếu khách hủy trước khi ký hợp đồng
-- MocLuuTru: Số tháng quy định để phân biệt NganHan (trước hạn ngắn hạn) và DaiHan
INSERT INTO ChinhSachHoanCoc (MaChinhSach, TenChinhSach, TiLe_ChuaKy, TiLe_TruocHan_NganHan, TiLe_TruocHan_DaiHan, TiLe_DungHan, MocLuuTru, NgayApDung, NgayKetThuc)
VALUES 
('CS01', N'Chính sách Tiêu Chuẩn 2024', 0.8000, 0.5000, 0.7000, 1.0000, 6, '2024-01-01', NULL);
GO

-- Khách hàng và các chứng từ giao dịch chỉ được tạo trong 04_DemoScenarios.sql.
-- Database vẫn dùng được nếu chỉ chạy init + seed cơ bản, chưa nạp demo scenarios.
ALTER SEQUENCE dbo.Seq_KhachHang RESTART WITH 1;
ALTER SEQUENCE dbo.Seq_NhanVien RESTART WITH 7;
ALTER SEQUENCE dbo.Seq_Phong RESTART WITH 4;
ALTER SEQUENCE dbo.Seq_Giuong RESTART WITH 15;
ALTER SEQUENCE dbo.Seq_DichVu RESTART WITH 6;
ALTER SEQUENCE dbo.Seq_TaiSan RESTART WITH 14;
ALTER SEQUENCE dbo.Seq_QuyDinh RESTART WITH 4;
ALTER SEQUENCE dbo.Seq_ChinhSachHoanCoc RESTART WITH 2;
GO

PRINT N'✅ Đã chèn dữ liệu mẫu (Seed Data) thành công!';
GO
