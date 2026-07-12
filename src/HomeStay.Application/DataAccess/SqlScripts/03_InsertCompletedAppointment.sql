USE HomeStay;
GO

-- 1. Khởi tạo Khách Hàng mẫu nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM KhachHang WHERE MaKH = 'KH_TEST_01')
BEGIN
    INSERT INTO KhachHang (MaKH, HoTen, NgaySinh, GioiTinh, QuocTich, LoaiGiayTo, SoGiayTo, DiaChiThuongTru, SDT, Email)
    VALUES (
        'KH_TEST_01', 
        N'Nguyễn Hoàng Nam', 
        '2001-08-25', 
        N'Nam', 
        N'Việt Nam', 
        N'CCCD', 
        '001201012345', 
        N'Quận 7, TP.HCM', 
        '0912345678', 
        'hoangnam@gmail.com'
    );
END
GO

-- 2. Khởi tạo Phiếu Đăng Ký mẫu liên kết với Khách Hàng trên nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM PhieuDangKy WHERE MaPDK = 'PDK_TEST_01')
BEGIN
    INSERT INTO PhieuDangKy (MaPDK, KhuVuc, SoLuongNguoi, LoaiDichVu, MucGia, ThoiGianDuKienVao, ThoiHanThue, YeuCauKhac, TrangThai, MaKH, MaNV)
    VALUES (
        'PDK_TEST_01', 
        N'Khu Vực Quận 1', 
        1, 
        N'Phòng dịch vụ', 
        950000.00, 
        '2026-07-01', 
        6, 
        N'Yêu cầu phòng có máy lạnh', 
        N'DaHenXemPhong', 
        'KH_TEST_01', 
        'NV03'
    );
END
GO

-- 3. Chèn Lịch Hẹn trạng thái Đã hoàn thành (Xem phòng) nếu chưa tồn tại
IF NOT EXISTS (SELECT 1 FROM LichHen WHERE MaLH = 'LH_TEST_HT')
BEGIN
    INSERT INTO LichHen (MaLH, NgayHen, GioHen, LoaiLichHen, TrangThai, MaPDK, MaPhieuCoc, MaHD, MaNV, MaCN)
    VALUES (
        'LH_TEST_HT', 
        CAST(GETDATE() AS DATE), 
        '15:30:00', 
        N'XemPhong', 
        N'DaHoanThanh', 
        'PDK_TEST_01', 
        NULL, 
        NULL, 
        'NV03', 
        'CN01'
    );
    PRINT N'✅ Đã chèn lịch hẹn hoàn thành thành công!';
END
ELSE
BEGIN
    PRINT N'ℹ️ Lịch hẹn LH_TEST_HT đã tồn tại.';
END
GO

select * from khachhang
select * from lichhen

select * from phieucoc

select * from chitietphieucoc

select * from phong

select * from giuong
