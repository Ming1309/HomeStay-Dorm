-- ==========================================================
-- Script thêm dữ liệu test cho UC 1.4.15 Lập biên bản bàn giao
-- Mục đích: Tạo hợp đồng "ChoBanGiao" + tài sản phòng
-- ==========================================================
USE HomeStay;
GO

-- 1. Fix ChiTietHopDong hiện tại: set TrangThaiThue = 'ChoThue'
--    (trước khi bàn giao, trạng thái phải là 'ChoThue', không phải 'DangThue')
UPDATE ChiTietHopDong
SET TrangThaiThue = N'ChoThue'
WHERE MaHD IN ('HD0002','HD0003')
  AND TrangThaiThue = N'DangThue';
GO

-- 2. Thêm Phong_TaiSan cho các phòng chưa có tài sản

-- P005 (LP04 - Phòng dịch vụ 4 SV):基本家具
INSERT INTO Phong_TaiSan (MaPhong, MaTS, SoLuongTieuChuan) VALUES
('P005','TS03',4),  -- Giường tầng sắt 2 chỗ x4
('P005','TS04',4),  -- Tủ quần áo cá nhân x4
('P005','TS05',2),  -- Rèm cửa chống nắng x2
('P005','TS09',4),  -- Nệm cao su non x4
('P005','TS10',1),  -- Bàn học gỗ x1
('P005','TS11',1),  -- Ghế xoay x1
('P005','TS12',4),  -- Chìa khóa phòng x4
('P005','TS13',4);  -- Thẻ từ ra vào cổng x4
GO

-- P006 (LP04 - Phòng dịch vụ 4 SV):基本家具
INSERT INTO Phong_TaiSan (MaPhong, MaTS, SoLuongTieuChuan) VALUES
('P006','TS03',4),
('P006','TS04',4),
('P006','TS05',2),
('P006','TS09',4),
('P006','TS10',1),
('P006','TS11',1),
('P006','TS12',4),
('P006','TS13',4);
GO

-- P003 (LP02 - Phòng 6 SV):基本家具
INSERT INTO Phong_TaiSan (MaPhong, MaTS, SoLuongTieuChuan) VALUES
('P003','TS03',6),
('P003','TS04',6),
('P003','TS05',3),
('P003','TS09',6),
('P003','TS12',6),
('P003','TS13',6);
GO

-- P010 (LP02 - Phòng 6 SV):基本家具
INSERT INTO Phong_TaiSan (MaPhong, MaTS, SoLuongTieuChuan) VALUES
('P010','TS03',6),
('P010','TS04',6),
('P010','TS05',3),
('P010','TS09',6),
('P010','TS12',6),
('P010','TS13',6);
GO

-- P011 (LP08 - Phòng dịch vụ 2 SV):基本家具
INSERT INTO Phong_TaiSan (MaPhong, MaTS, SoLuongTieuChuan) VALUES
('P011','TS01',1),  -- Máy Lạnh x1
('P011','TS03',2),  -- Giường tầng sắt 2 chỗ x2
('P011','TS04',2),  -- Tủ quần áo cá nhân x2
('P011','TS05',1),  -- Rèm cửa chống nắng x1
('P011','TS09',2),  -- Nệm cao su non x2
('P011','TS12',2),  -- Chìa khóa phòng x2
('P011','TS13',2);  -- Thẻ từ ra vào cổng x2
GO

-- 3. Tạo hợp đồng test mới: HD0006 (room P003 - 6 bed)

-- 3a. Tạo Phiếu cọc
INSERT INTO PhieuCoc (MaPhieuCoc, HanThanhToan, HinhThucThue, SoGiuongThue, TongTien, ThoiDiemCoc, TrangThai, MaKH, MaPhong, MaNV)
VALUES ('PC0006', DATEADD(DAY,3,GETDATE()), N'OGhep', 3, 930000, GETDATE(), N'DaDuyet', 'KH0009', 'P003', 'NV01');
GO

-- 3b. Chi tiết phiếu cọc (3 giường: G009, G010, G011)
INSERT INTO ChiTietPhieuCoc (MaPhieuCoc, MaGiuong) VALUES
('PC0006','G009'),
('PC0006','G010'),
('PC0006','G011');
GO

-- 3c. Tạo hợp đồng
INSERT INTO HopDong (MaHD, NgayKy, NgayBatDau, NgayKetThuc, KyThanhToan, GiaThue, TrangThai, MaNV, MaPhieuCoc)
VALUES ('HD0006', GETDATE(), DATEADD(DAY,7,GETDATE()), DATEADD(MONTH,6,DATEADD(DAY,7,GETDATE())), 1, 310000, N'ChoBanGiao', 'NV01', 'PC0006');
GO

-- 3d. Chi tiết hợp đồng (3 thành viên: KH0009, KH010, KH011)
INSERT INTO ChiTietHopDong (MaHD, MaGiuong, MaKH, TrangThaiThue) VALUES
('HD0006','G009','KH0009',N'ChoThue'),
('HD0006','G010','KH0010',N'ChoThue'),
('HD0006','G011','KH011',N'ChoThue');
GO

-- 3e. Cập nhật trạng thái giường → DaCoc
UPDATE Giuong SET TrangThai = N'DaCoc' WHERE MaGiuong IN ('G009','G010','G011');
UPDATE Phong SET TrangThai = N'DaCoc' WHERE MaPhong = 'P003';
GO

-- 4. Tạo hợp đồng test mới: HD0007 (room P011 - 2 bed service room)

-- 4a. Tạo Phiếu cọc
INSERT INTO PhieuCoc (MaPhieuCoc, HanThanhToan, HinhThucThue, SoGiuongThue, TongTien, ThoiDiemCoc, TrangThai, MaKH, MaPhong, MaNV)
VALUES ('PC0007', DATEADD(DAY,3,GETDATE()), N'OGhep', 2, 3800000, GETDATE(), N'DaDuyet', 'KH014', 'P011', 'NV01');
GO

-- 4b. Chi tiết phiếu cọc (2 giường: G041, G042)
INSERT INTO ChiTietPhieuCoc (MaPhieuCoc, MaGiuong) VALUES
('PC0007','G041'),
('PC0007','G042');
GO

-- 4c. Tạo hợp đồng
INSERT INTO HopDong (MaHD, NgayKy, NgayBatDau, NgayKetThuc, KyThanhToan, GiaThue, TrangThai, MaNV, MaPhieuCoc)
VALUES ('HD0007', GETDATE(), DATEADD(DAY,5,GETDATE()), DATEADD(MONTH,12,DATEADD(DAY,5,GETDATE())), 1, 1900000, N'ChoBanGiao', 'NV01', 'PC0007');
GO

-- 4d. Chi tiết hợp đồng (2 thành viên: KH014, KH015)
INSERT INTO ChiTietHopDong (MaHD, MaGiuong, MaKH, TrangThaiThue) VALUES
('HD0007','G041','KH014',N'ChoThue'),
('HD0007','G042','KH015',N'ChoThue');
GO

-- 4e. Cập nhật trạng thái giường → DaCoc
UPDATE Giuong SET TrangThai = N'DaCoc' WHERE MaGiuong IN ('G041','G042');
UPDATE Phong SET TrangThai = N'DaCoc' WHERE MaPhong = 'P011';
GO

-- ==========================================================
-- Verify: Kiểm tra kết quả
-- ==========================================================
PRINT '=== Hợp đồng chờ bàn giao ===';
SELECT hd.MaHD, kh.HoTen, p.SoPhong, p.ToaNha, hd.TrangThai,
       (SELECT COUNT(*) FROM ChiTietHopDong cthd WHERE cthd.MaHD = hd.MaHD) AS SoThanhVien
FROM HopDong hd
INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
WHERE hd.TrangThai = N'ChoBanGiao';
GO

PRINT '';
PRINT '=== Tài sản phòng (P005, P006, P003, P011) ===';
SELECT p.MaPhong, p.SoPhong, ts.TenTaiSan, pts.SoLuongTieuChuan
FROM Phong_TaiSan pts
INNER JOIN Phong p ON p.MaPhong = pts.MaPhong
INNER JOIN TaiSan ts ON ts.MaTS = pts.MaTS
WHERE p.MaPhong IN ('P005','P006','P003','P011')
ORDER BY p.MaPhong, ts.TenTaiSan;
GO

PRINT '';
PRINT '=== Chi tiết hợp đồng chờ bàn giao ===';
SELECT cthd.MaHD, cthd.MaGiuong, g.SoGiuong, kh.HoTen, cthd.TrangThaiThue
FROM ChiTietHopDong cthd
INNER JOIN Giuong g ON g.MaGiuong = cthd.MaGiuong
INNER JOIN KhachHang kh ON kh.MaKH = cthd.MaKH
WHERE cthd.MaHD IN ('HD0002','HD0003','HD0006','HD0007')
ORDER BY cthd.MaHD, g.SoGiuong;
GO
