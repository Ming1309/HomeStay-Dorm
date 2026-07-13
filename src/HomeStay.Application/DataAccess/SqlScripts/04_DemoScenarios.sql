-- Bộ dữ liệu mẫu theo vòng đời nghiệp vụ.
-- Chạy sau 01_InitTables.sql, 02_Seeds.sql và 03_Auth.sql trên database mới.
-- Mã nghiệp vụ dùng số thứ tự, không mã hóa trạng thái.
USE HomeStay;
GO

-- ============================================================
-- 1. Khách hàng
-- ============================================================
INSERT INTO KhachHang (MaKH, HoTen, NgaySinh, GioiTinh, QuocTich, LoaiGiayTo, SoGiayTo, DiaChiThuongTru, SDT, Email)
VALUES
('KH0001', N'Đặng Minh An', '2001-01-12', N'Nam', N'Việt Nam', N'CCCD', '079201000001', N'TP.HCM', '0900000001', 'kh0001@example.com'),
('KH0002', N'Nguyễn Thu Bình', '2002-02-23', N'Nữ', N'Việt Nam', N'CCCD', '079201000002', N'TP.HCM', '0900000002', 'kh0002@example.com'),
('KH0003', N'Lê Quốc Cường', '2000-03-14', N'Nam', N'Việt Nam', N'CCCD', '079201000003', N'Đồng Nai', '0900000003', 'kh0003@example.com'),
('KH0004', N'Phạm Hoàng Dũng', '2001-04-25', N'Nam', N'Việt Nam', N'CCCD', '079201000004', N'Bình Dương', '0900000004', 'kh0004@example.com'),
('KH0005', N'Trần Ngọc Hà', '2002-05-16', N'Nữ', N'Việt Nam', N'CCCD', '079201000005', N'Long An', '0900000005', 'kh0005@example.com'),
('KH0006', N'Vũ Minh Khang', '2000-06-27', N'Nam', N'Việt Nam', N'CCCD', '079201000006', N'TP.HCM', '0900000006', 'kh0006@example.com'),
('KH0007', N'Bùi Thanh Lam', '2001-07-18', N'Nữ', N'Việt Nam', N'CCCD', '079201000007', N'Tây Ninh', '0900000007', 'kh0007@example.com'),
('KH0008', N'Đỗ Gia Minh', '2002-08-09', N'Nam', N'Việt Nam', N'CCCD', '079201000008', N'TP.HCM', '0900000008', 'kh0008@example.com'),
('KH0009', N'Hoàng Thảo Nhi', '2001-09-20', N'Nữ', N'Việt Nam', N'CCCD', '079201000009', N'Bình Phước', '0900000009', 'kh0009@example.com'),
('KH0010', N'Phan Nhật Oanh', '2000-10-11', N'Nữ', N'Việt Nam', N'CCCD', '079201000010', N'TP.HCM', '0900000010', 'kh0010@example.com'),
('KH0011', N'Nguyễn Phúc Quân', '2002-11-02', N'Nam', N'Việt Nam', N'CCCD', '079201000011', N'Bà Rịa', '0900000011', 'kh0011@example.com'),
('KH0012', N'Trịnh Khánh Vy', '2001-12-13', N'Nữ', N'Việt Nam', N'CCCD', '079201000012', N'TP.HCM', '0900000012', 'kh0012@example.com'),
('KH0013', N'Đinh Hoài Sơn', '2000-01-24', N'Nam', N'Việt Nam', N'CCCD', '079201000013', N'Vĩnh Long', '0900000013', 'kh0013@example.com'),
('KH0014', N'Nguyễn Mai Trang', '2002-02-15', N'Nữ', N'Việt Nam', N'CCCD', '079201000014', N'TP.HCM', '0900000014', 'kh0014@example.com'),
('KH0015', N'Lý Anh Tú', '2001-03-26', N'Nam', N'Việt Nam', N'CCCD', '079201000015', N'Bình Dương', '0900000015', 'kh0015@example.com');
GO

-- ============================================================
-- 2. Phòng và giường cho các trạng thái cần kiểm thử
-- ============================================================
INSERT INTO Phong (MaPhong, SoPhong, ToaNha, Tang, GioiTinhChoPhep, TrangThai, MaLP, MaCN)
VALUES
('P004', '202', N'Tòa A', N'Tầng 2', N'Nam', N'ConGiuongTrong', 'LP04', 'CN01'),
('P005', '203', N'Tòa A', N'Tầng 2', N'Nữ', N'GiuCho', 'LP04', 'CN01'),
('P006', '204', N'Tòa A', N'Tầng 2', N'Nam', N'DaCoc', 'LP04', 'CN01'),
('P007', '205', N'Tòa A', N'Tầng 2', N'Nữ', N'DangSuDung', 'LP08', 'CN01'),
('P008', '206', N'Tòa B', N'Tầng 2', N'Nam', N'DangBaoTri', 'LP04', 'CN02'),
('P009', '207', N'Tòa B', N'Tầng 2', N'Nữ', N'NgungSuDung', 'LP08', 'CN02'),
('P010', '208', N'Tòa B', N'Tầng 2', N'Nam', N'GiuCho', 'LP02', 'CN02'),
('P011', '209', N'Tòa B', N'Tầng 2', N'Nữ', N'Trong', 'LP08', 'CN02');
GO

INSERT INTO Giuong (MaGiuong, SoGiuong, TrangThai, MaPhong)
VALUES
('G015', N'Giường A', N'GiuCho', 'P004'),
('G016', N'Giường B', N'GiuCho', 'P004'),
('G017', N'Giường C', N'Trong', 'P004'),
('G018', N'Giường D', N'Trong', 'P004'),
('G019', N'Giường A', N'GiuCho', 'P005'),
('G020', N'Giường B', N'GiuCho', 'P005'),
('G021', N'Giường C', N'GiuCho', 'P005'),
('G022', N'Giường D', N'GiuCho', 'P005'),
('G023', N'Giường A', N'DaCoc', 'P006'),
('G024', N'Giường B', N'DaCoc', 'P006'),
('G025', N'Giường C', N'DaCoc', 'P006'),
('G026', N'Giường D', N'DaCoc', 'P006'),
('G027', N'Giường A', N'DangSuDung', 'P007'),
('G028', N'Giường B', N'DangSuDung', 'P007'),
('G029', N'Giường A', N'DangBaoTri', 'P008'),
('G030', N'Giường B', N'DangBaoTri', 'P008'),
('G031', N'Giường C', N'DangBaoTri', 'P008'),
('G032', N'Giường D', N'DangBaoTri', 'P008'),
('G033', N'Giường A', N'NgungSuDung', 'P009'),
('G034', N'Giường B', N'NgungSuDung', 'P009'),
('G035', N'Giường A', N'GiuCho', 'P010'),
('G036', N'Giường B', N'GiuCho', 'P010'),
('G037', N'Giường C', N'GiuCho', 'P010'),
('G038', N'Giường D', N'GiuCho', 'P010'),
('G039', N'Giường E', N'GiuCho', 'P010'),
('G040', N'Giường F', N'GiuCho', 'P010'),
('G041', N'Giường A', N'Trong', 'P011'),
('G042', N'Giường B', N'Trong', 'P011');
GO

-- ============================================================
-- 3. Phiếu đăng ký
-- ============================================================
INSERT INTO PhieuDangKy (MaPDK, KhuVuc, SoLuongNguoi, LoaiDichVu, MucGia, ThoiGianDuKienVao, ThoiHanThue, YeuCauKhac, TrangThai, MaKH, MaNV)
VALUES
('PDK0001', N'Quận 1', 1, N'Phòng dịch vụ', 950000, '2026-07-20', 6, N'Cần tư vấn phòng', N'DangXuLy', 'KH0001', 'NV03'),
('PDK0002', N'Thủ Đức', 1, N'Phòng dịch vụ', 950000, '2026-07-21', 6, N'Ưu tiên gần cổng', N'DaHenXemPhong', 'KH0002', 'NV03'),
('PDK0003', N'Quận 7', 1, N'Phòng dịch vụ', 950000, '2026-07-22', 6, N'Khách hủy yêu cầu', N'DaHuy', 'KH0003', 'NV03'),
('PDK0004', N'Quận 1', 1, N'Phòng dịch vụ', 950000, '2026-07-23', 6, N'Xem phòng trước khi cọc', N'DaHenXemPhong', 'KH0004', 'NV03'),
('PDK0005', N'Thủ Đức', 2, N'Phòng dịch vụ', 1900000, '2026-07-24', 6, N'Ở ghép hai người', N'DaHenXemPhong', 'KH0005', 'NV04'),
('PDK0006', N'Quận 1', 2, N'Phòng dịch vụ', 1900000, '2026-07-25', 6, N'Đăng ký cùng nhóm', N'DaHenXemPhong', 'KH0006', 'NV03'),
('PDK0007', N'Thủ Đức', 2, N'Phòng dịch vụ', 1900000, '2026-07-26', 6, N'Đã xác nhận phòng', N'DaHenXemPhong', 'KH0007', 'NV04'),
('PDK0008', N'Quận 1', 6, N'Phòng dịch vụ', 1860000, '2026-07-27', 6, N'Thuê nguyên căn', N'DaHenXemPhong', 'KH0008', 'NV03'),
('PDK0009', N'Thủ Đức', 2, N'Phòng dịch vụ', 1900000, '2026-07-28', 6, N'Đã nhận phòng', N'DaHenXemPhong', 'KH0009', 'NV04'),
('PDK0010', N'Quận 1', 2, N'Phòng dịch vụ', 1900000, '2026-07-29', 6, N'Đã hoàn tất đặt phòng', N'DaHenXemPhong', 'KH0010', 'NV03');
GO

-- ============================================================
-- 4. Phiếu cọc và thành viên đăng ký
-- ============================================================
INSERT INTO PhieuCoc (MaPhieuCoc, HanThanhToan, HinhThucThue, SoGiuongThue, TongTien, ThoiDiemCoc, AnhMinhChung, PhuongThucThanhToan, LyDoYeuCauBoSung, ThoiDiemHuy, MaNVHuy, TrangThai, MaKH, MaPhong, MaNV)
VALUES
('PC0001', NULL, N'OGhep', 1, 0, '2026-07-23T10:00:00', NULL, NULL, NULL, NULL, NULL, N'KhoiTao', 'KH0004', 'P004', 'NV03'),
('PC0002', '2026-07-25T10:00:00', N'OGhep', 2, 3800000, '2026-07-24T10:00:00', NULL, NULL, NULL, NULL, NULL, N'ChoThanhToan', 'KH0005', 'P005', 'NV04'),
('PC0003', '2026-07-26T10:00:00', N'OGhep', 2, 3800000, '2026-07-25T10:00:00', N'/files/pc0003.png', N'ChuyenKhoan', NULL, NULL, NULL, N'DaThanhToan', 'KH0006', 'P006', 'NV03'),
('PC0004', '2026-07-27T10:00:00', N'NguyenCan', 2, 7600000, '2026-07-26T10:00:00', N'/files/pc0004.png', N'ChuyenKhoan', NULL, NULL, NULL, N'DaThanhToan', 'KH0007', 'P007', 'NV03'),
('PC0005', '2026-07-28T10:00:00', N'NguyenCan', 6, 3720000, '2026-07-27T10:00:00', N'/files/pc0005.png', N'ChuyenKhoan', NULL, NULL, NULL, N'ChoDuyet', 'KH0008', 'P010', 'NV03'),
('PC0006', '2026-07-29T10:00:00', N'NguyenCan', 2, 7600000, '2026-07-28T10:00:00', N'/files/pc0006.png', N'TienMat', NULL, NULL, NULL, N'DaDuyet', 'KH0009', 'P011', 'NV04'),
('PC0007', NULL, N'OGhep', 1, 1900000, '2026-07-20T10:00:00', NULL, NULL, NULL, '2026-07-21T09:00:00', 'NV03', N'DaHuy', 'KH0010', 'P002', 'NV03'),
('PC0008', '2026-07-30T10:00:00', N'OGhep', 2, 1240000, '2026-07-29T10:00:00', N'/files/pc0008.png', N'ChuyenKhoan', NULL, NULL, NULL, N'DaThanhToan', 'KH0011', 'P003', 'NV04'),
('PC0009', '2026-07-31T10:00:00', N'OGhep', 1, 1900000, '2026-07-30T10:00:00', N'/files/pc0009.png', N'ChuyenKhoan', NULL, NULL, NULL, N'ChoDoiChieu', 'KH0001', 'P004', 'NV03');
GO

INSERT INTO ThanhVienDangKy (MaPhieuCoc, MaKH, VaiTro, TrangThaiDuyet)
VALUES
('PC0001', 'KH0004', N'DaiDien', N'ChoDuyet'),
('PC0002', 'KH0005', N'DaiDien', N'ChoDuyet'),
('PC0002', 'KH0012', N'ThanhVien', N'ChoDuyet'),
('PC0003', 'KH0006', N'DaiDien', N'ChoDuyet'),
('PC0003', 'KH0013', N'ThanhVien', N'TuChoi'),
('PC0004', 'KH0007', N'DaiDien', N'HopLe'),
('PC0004', 'KH0014', N'ThanhVien', N'HopLe'),
('PC0005', 'KH0008', N'DaiDien', N'ChoDuyet'),
('PC0005', 'KH0009', N'ThanhVien', N'HopLe'),
('PC0005', 'KH0011', N'ThanhVien', N'HopLe'),
('PC0005', 'KH0012', N'ThanhVien', N'HopLe'),
('PC0005', 'KH0013', N'ThanhVien', N'HopLe'),
('PC0005', 'KH0014', N'ThanhVien', N'HopLe'),
('PC0006', 'KH0009', N'DaiDien', N'HopLe'),
('PC0006', 'KH0015', N'ThanhVien', N'HopLe'),
('PC0007', 'KH0010', N'DaiDien', N'TuChoi'),
('PC0008', 'KH0011', N'DaiDien', N'HopLe'),
('PC0008', 'KH0015', N'ThanhVien', N'HopLe'),
('PC0009', 'KH0001', N'DaiDien', N'ChoDuyet');
GO

INSERT INTO ChiTietPhieuCoc (MaPhieuCoc, MaGiuong)
VALUES
('PC0001', 'G015'),
('PC0002', 'G019'), ('PC0002', 'G020'),
('PC0003', 'G023'), ('PC0003', 'G024'),
('PC0004', 'G027'), ('PC0004', 'G028'),
('PC0005', 'G035'), ('PC0005', 'G036'), ('PC0005', 'G037'), ('PC0005', 'G038'), ('PC0005', 'G039'), ('PC0005', 'G040'),
('PC0006', 'G041'), ('PC0006', 'G042'),
('PC0007', 'G005'),
('PC0008', 'G009'), ('PC0008', 'G010'),
('PC0009', 'G016');
GO

-- ============================================================
-- 5. Hợp đồng, lịch hẹn và chi tiết hợp đồng
-- ============================================================
INSERT INTO HopDong (MaHD, NgayKy, NgayBatDau, NgayKetThuc, KyThanhToan, GiaThue, DieuKhoan, TrangThai, MaNV, MaPhieuCoc, MaChinhSach, MaQD, MaQLDuyet)
VALUES
('HD0001', NULL, '2026-08-01', '2027-01-31', 1, 950000, N'Chờ ký hợp đồng', N'ChoKy', 'NV03', 'PC0001', 'CS01', 'QD01', NULL),
('HD0002', '2026-07-26', '2026-08-01', '2027-01-31', 1, 1900000, N'Chờ thanh toán kỳ đầu', N'ChoThanhToan', 'NV03', 'PC0002', 'CS01', 'QD01', 'NV01'),
('HD0003', '2026-07-27', '2026-08-01', '2027-01-31', 1, 1900000, N'Đã thanh toán, chờ bàn giao', N'ChoBanGiao', 'NV03', 'PC0003', 'CS01', 'QD01', 'NV01'),
('HD0004', '2026-07-28', '2026-08-01', '2027-01-31', 1, 1900000, N'Đang lưu trú', N'DangHieuLuc', 'NV04', 'PC0004', 'CS01', 'QD01', 'NV01'),
('HD0005', '2026-07-29', '2026-02-01', '2026-07-31', 1, 1860000, N'Đã thanh lý, chờ hoàn tất đối soát', N'DaThanhLy', 'NV03', 'PC0005', 'CS01', 'QD01', 'NV01'),
('HD0006', '2026-07-29', '2026-08-01', '2027-01-31', 1, 3800000, N'Hợp đồng bị hủy', N'DaHuy', 'NV04', 'PC0006', 'CS01', 'QD01', 'NV01');
GO

INSERT INTO LichHen (MaLH, NgayHen, GioHen, LoaiLichHen, TrangThai, MaPDK, MaPhieuCoc, MaHD, MaNV, MaCN)
VALUES
('LH0001', '2026-07-20', '09:00:00', N'XemPhong', N'DaXacNhan', 'PDK0001', NULL, NULL, 'NV03', 'CN01'),
('LH0002', '2026-07-21', '09:30:00', N'XemPhong', N'DaHuy', 'PDK0002', NULL, NULL, 'NV03', 'CN01'),
('LH0003', '2026-07-22', '10:00:00', N'XemPhong', N'VangMat', 'PDK0003', NULL, NULL, 'NV03', 'CN01'),
('LH0004', '2026-07-23', '10:30:00', N'XemPhong', N'DaHoanThanh', 'PDK0004', 'PC0001', 'HD0001', 'NV03', 'CN01'),
('LH0005', '2026-07-24', '11:00:00', N'NhanPhong', N'DaCheckin', 'PDK0005', 'PC0002', 'HD0002', 'NV04', 'CN02'),
('LH0006', '2026-07-25', '11:30:00', N'XemPhong', N'DaHoanThanh', 'PDK0006', 'PC0003', 'HD0003', 'NV03', 'CN01'),
('LH0007', '2026-07-26', '13:00:00', N'NhanPhong', N'DaCheckin', 'PDK0007', 'PC0004', 'HD0004', 'NV03', 'CN01'),
('LH0008', '2026-07-27', '14:00:00', N'TraPhong', N'DaHoanThanh', 'PDK0008', 'PC0005', 'HD0005', 'NV03', 'CN01'),
('LH0009', '2026-07-28', '14:30:00', N'TraPhong', N'DaHoanThanh', 'PDK0009', 'PC0006', 'HD0006', 'NV04', 'CN02');
GO

INSERT INTO ChiTietHopDong (MaHD, MaGiuong, MaKH, TrangThaiThue, NgayTra)
VALUES
('HD0001', 'G015', 'KH0004', N'DangThue', NULL),
('HD0002', 'G019', 'KH0005', N'DangThue', NULL),
('HD0002', 'G020', 'KH0012', N'DangThue', NULL),
('HD0003', 'G023', 'KH0006', N'DangThue', NULL),
('HD0003', 'G024', 'KH0013', N'DangThue', NULL),
('HD0004', 'G027', 'KH0007', N'DangThue', NULL),
('HD0004', 'G028', 'KH0014', N'DangThue', NULL),
('HD0005', 'G035', 'KH0008', N'DaTra', '2026-07-31'),
('HD0005', 'G036', 'KH0009', N'DaTra', '2026-07-31'),
('HD0005', 'G037', 'KH0011', N'DaTra', '2026-07-31'),
('HD0005', 'G038', 'KH0012', N'DaTra', '2026-07-31'),
('HD0005', 'G039', 'KH0013', N'DaTra', '2026-07-31'),
('HD0005', 'G040', 'KH0014', N'DaTra', '2026-07-31'),
('HD0006', 'G041', 'KH0009', N'DaTra', '2026-07-29'),
('HD0006', 'G042', 'KH0015', N'DaTra', '2026-07-29');
GO

INSERT INTO HopDong_DichVu (MaHD, MaDV, DonGiaKyKet)
VALUES
('HD0002', 'DV03', 100000),
('HD0004', 'DV01', 3500),
('HD0004', 'DV05', 50000),
('HD0005', 'DV03', 100000);
GO

-- ============================================================
-- 6. Bàn giao, thu hồi và hóa đơn
-- ============================================================
INSERT INTO BienBanGiaoNhan (MaBienBan, NgayBanGiao, LoaiBienBan, MaHD, MaNV)
VALUES
('BBGN0001', '2026-08-01', N'BanGiao', 'HD0003', 'NV01'),
('BBGN0002', '2026-08-01', N'BanGiao', 'HD0004', 'NV01'),
('BBGN0003', '2026-07-31', N'ThuHoi', 'HD0005', 'NV01');
GO

INSERT INTO ChiTietGiaoNhan (MaBienBan, MaTS, TinhTrang, SoLuong, GhiChu, MinhChung)
VALUES
('BBGN0001', 'TS01', N'Tốt', 1, N'Bàn giao nguyên trạng', NULL),
('BBGN0001', 'TS03', N'Tốt', 2, N'Đủ giường tầng', NULL),
('BBGN0002', 'TS01', N'Tốt', 1, N'Bàn giao nguyên trạng', NULL),
('BBGN0002', 'TS06', N'Tốt', 1, N'Máy giặt hoạt động', NULL),
('BBGN0003', 'TS01', N'Trầy nhẹ', 1, N'Cần khấu trừ khi đối soát', N'/files/bbgn0003-ts01.png'),
('BBGN0003', 'TS03', N'Đủ', 2, N'Đã thu hồi', NULL);
GO

INSERT INTO HoaDon (MaHoaDon, NgayLap, HanThanhToan, LoaiHoaDon, TongTien, TrangThai, GhiChu, MaHD, MaNV)
VALUES
('HDON0001', '2026-07-26', '2026-07-30', N'KyDau', 1900000, N'ChuaThanhToan', N'Hóa đơn kỳ đầu', 'HD0002', 'NV02'),
('HDON0002', '2026-07-28', '2026-08-05', N'TienThue', 1900000, N'ThanhToanMotPhan', N'Còn công nợ', 'HD0004', 'NV02'),
('HDON0003', '2026-07-29', '2026-07-31', N'TienThue', 1860000, N'DaThanhToan', N'Đã thanh toán đủ', 'HD0005', 'NV02'),
('HDON0004', '2026-07-31', NULL, N'BoiThuong', 800000, N'ChuaThanhToan', N'Khấu trừ tài sản hư hỏng', 'HD0005', 'NV02');
GO

INSERT INTO ChiTietHoaDon (MaHoaDon, STT, LoaiKhoanThu, MaDV, MaTS, MaGiuong, SoLuong, DonViTinh, DonGia)
VALUES
('HDON0001', 1, N'TienThue', NULL, NULL, 'G019', 2, N'giường', 950000),
('HDON0002', 1, N'TienThue', NULL, NULL, 'G027', 2, N'giường', 950000),
('HDON0003', 1, N'TienThue', NULL, NULL, 'G035', 6, N'giường', 310000),
('HDON0004', 1, N'BoiThuong', NULL, 'TS01', NULL, 1, N'món', 800000);
GO

-- ============================================================
-- 7. Đối soát, phiếu thu và hoàn cọc
-- ============================================================
INSERT INTO PhieuDoiSoat (MaPDS, NgayDoiSoat, TyLeHoanCoc, TongKhauTru, TienHoan, TienThuThem, TrangThai, GhiChu, MaHD, MaNV, MaPhieuCoc, MaGiuong)
VALUES
('PDS0001', '2026-07-31', 1.0000, 800000, 1060000, 0, N'DaChot', N'Đối soát đã chốt', 'HD0005', 'NV02', 'PC0005', 'G035'),
('PDS0002', '2026-08-01', 0.8000, 0, 3040000, 0, N'DaTatToan', N'Đã tất toán hoàn cọc', 'HD0006', 'NV02', 'PC0006', 'G041');
GO

INSERT INTO ChiTietDoiSoat (MaPDS, MaHoaDon)
VALUES
('PDS0001', 'HDON0003'),
('PDS0001', 'HDON0004');
GO

INSERT INTO PhieuThu (MaPT, SoTienThu, ThoiGian, PhuongThucThanhToan, AnhMinhChung, MaHoaDon, MaPhieuCoc, MaPDS, MaNV)
VALUES
('PT0001', 1900000, '2026-07-25T15:00:00', N'ChuyenKhoan', N'/files/pt0001.png', NULL, 'PC0003', NULL, 'NV02'),
('PT0002', 950000, '2026-07-29T16:00:00', N'TienMat', NULL, 'HDON0002', NULL, NULL, 'NV02'),
('PT0003', 1860000, '2026-07-31T17:00:00', N'ChuyenKhoan', N'/files/pt0003.png', NULL, NULL, 'PDS0001', 'NV02');
GO

INSERT INTO PhieuHoanCoc (MaPHC, SoTienHoan, PhuongThucHoan, ThongTinNhanTien, ThoiGian, MaPDS, MaNV)
VALUES
('PHC0001', 1060000, N'ChuyenKhoan', N'Tài khoản nhận của KH0008', '2026-08-01T09:00:00', 'PDS0001', 'NV02'),
('PHC0002', 3040000, N'TienMat', N'Khách nhận tại quầy', '2026-08-01T10:00:00', 'PDS0002', 'NV02');
GO

PRINT N'Đã chèn dữ liệu kịch bản nghiệp vụ thành công.';
GO
