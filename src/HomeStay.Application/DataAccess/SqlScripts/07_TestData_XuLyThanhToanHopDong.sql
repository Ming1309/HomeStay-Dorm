-- ============================================================
-- Tạo dữ liệu test cho UC 1.4.14 Xử lý thanh toán hợp đồng
-- ============================================================
USE HomeStay;
GO

-- 1. Tạo chi nhánh
IF NOT EXISTS (SELECT 1 FROM ChiNhanh WHERE MaCN = 'CN001')
    INSERT INTO ChiNhanh (MaCN, TenChiNhanh, DiaChi, SDT)
    VALUES ('CN001', N'Chi nhánh Cơ sở A', N'123 Nguyễn Văn A', '0900000000');
GO

-- 2. Tạo nhân viên kế toán
IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE MaNV = 'NV001')
    INSERT INTO NhanVien (MaNV, HoTen, SDT, VaiTro, MaCN)
    VALUES ('NV001', N'Nguyễn Thị Thu - Kế toán', '0901111111', N'KeToan', 'CN001');
GO

-- 3. Tạo loại phòng
IF NOT EXISTS (SELECT 1 FROM LoaiPhong WHERE MaLP = 'LP001')
    INSERT INTO LoaiPhong (MaLP, TenLoaiPhong, SucChua, GiaThue)
    VALUES ('LP001', N'Phòng 4 người', 4, 4000000);
GO

-- 4. Tạo phòng
IF NOT EXISTS (SELECT 1 FROM Phong WHERE MaPhong = 'P001')
    INSERT INTO Phong (MaPhong, SoPhong, ToaNha, Tang, GioiTinhChoPhep, TrangThai, MaLP, MaCN)
    VALUES ('P001', N'101', N'A', N'1', N'Nam', N'DangSuDung', 'LP001', 'CN001');
GO

-- 5. Tạo giường
IF NOT EXISTS (SELECT 1 FROM Giuong WHERE MaGiuong = 'G001')
    INSERT INTO Giuong (MaGiuong, SoGiuong, TrangThai, MaPhong)
    VALUES ('G001', N'01', N'DangSuDung', 'P001');
GO

-- 6. Tạo khách hàng
IF NOT EXISTS (SELECT 1 FROM KhachHang WHERE MaKH = 'KH001')
    INSERT INTO KhachHang (MaKH, HoTen, NgaySinh, GioiTinh, QuocTich, LoaiGiayTo, SoGiayTo, SDT, Email)
    VALUES ('KH001', N'Phạm Quang Minh', '2005-01-01', N'Nam', N'Việt Nam', N'CCCD', '079205000001', '0901234567', 'minh@example.com');
GO

-- 7. Tạo phiếu cọc (đã duyệt)
IF NOT EXISTS (SELECT 1 FROM PhieuCoc WHERE MaPhieuCoc = 'PC001')
    INSERT INTO PhieuCoc (MaPhieuCoc, HanThanhToan, HinhThucThue, SoGiuongThue, TongTien, ThoiDiemCoc, TrangThai, MaKH, MaPhong, MaNV)
    VALUES ('PC001', GETDATE(), N'OGhep', 1, 8000000, GETDATE(), N'DaDuyet', 'KH001', 'P001', 'NV001');
GO

-- 8. Tạo thành viên đăng ký
IF NOT EXISTS (SELECT 1 FROM ThanhVienDangKy WHERE MaPhieuCoc = 'PC001' AND MaKH = 'KH001')
    INSERT INTO ThanhVienDangKy (MaPhieuCoc, MaKH, VaiTro, TrangThaiDuyet)
    VALUES ('PC001', 'KH001', N'DaiDien', N'HopLe');
GO

-- 9. Tạo chi tiết phiếu cọc
IF NOT EXISTS (SELECT 1 FROM ChiTietPhieuCoc WHERE MaPhieuCoc = 'PC001')
    INSERT INTO ChiTietPhieuCoc (MaPhieuCoc, MaGiuong)
    VALUES ('PC001', 'G001');
GO

-- 10. Tạo chính sách hoàn cọc
IF NOT EXISTS (SELECT 1 FROM ChinhSachHoanCoc WHERE MaChinhSach = 'CSHC001')
    INSERT INTO ChinhSachHoanCoc (MaChinhSach, TenChinhSach, TiLe_ChuaKy, TiLe_TruocHan_NganHan, TiLe_TruocHan_DaiHan, TiLe_DungHan, MocLuuTru)
    VALUES ('CSHC001', N'Chính sách chuẩn', 0.8, 0.5, 0.7, 1.0, 6);
GO

-- 11. Tạo hợp đồng — trạng thái "ChoThanhToan"
IF NOT EXISTS (SELECT 1 FROM HopDong WHERE MaHD = 'HD001')
    INSERT INTO HopDong (MaHD, NgayKy, NgayBatDau, NgayKetThuc, KyThanhToan, GiaThue, TrangThai, MaNV, MaPhieuCoc, MaChinhSach)
    VALUES ('HD001', GETDATE(), '2026-07-15', '2027-07-14', 1, 4000000, N'ChoThanhToan', 'NV001', 'PC001', 'CSHC001');
GO

-- 12. Tạo chi tiết hợp đồng
IF NOT EXISTS (SELECT 1 FROM ChiTietHopDong WHERE MaHD = 'HD001' AND MaGiuong = 'G001')
    INSERT INTO ChiTietHopDong (MaHD, MaGiuong, MaKH, TrangThaiThue)
    VALUES ('HD001', 'G001', 'KH001', N'DangThue');
GO

-- 13. Tạo dịch vụ mẫu
IF NOT EXISTS (SELECT 1 FROM DichVu WHERE MaDV = 'DV001')
    INSERT INTO DichVu (MaDV, TenDV, DonGia, DonViTinh)
    VALUES ('DV001', N'Phí gửi xe', 150000, N'tháng');
IF NOT EXISTS (SELECT 1 FROM DichVu WHERE MaDV = 'DV002')
    INSERT INTO DichVu (MaDV, TenDV, DonGia, DonViTinh)
    VALUES ('DV002', N'Phí dọn phòng', 500000, N'tháng');
GO

-- 14. Gán dịch vụ cho hợp đồng
IF NOT EXISTS (SELECT 1 FROM HopDong_DichVu WHERE MaHD = 'HD001' AND MaDV = 'DV001')
    INSERT INTO HopDong_DichVu (MaHD, MaDV, DonGiaKyKet) VALUES ('HD001', 'DV001', 150000);
IF NOT EXISTS (SELECT 1 FROM HopDong_DichVu WHERE MaHD = 'HD001' AND MaDV = 'DV002')
    INSERT INTO HopDong_DichVu (MaHD, MaDV, DonGiaKyKet) VALUES ('HD001', 'DV002', 500000);
GO

PRINT N'✅ Dữ liệu test cho thanh toán hợp đồng đã sẵn sàng!';
GO
