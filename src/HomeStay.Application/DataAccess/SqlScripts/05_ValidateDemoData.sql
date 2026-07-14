-- Kiểm tra bộ dữ liệu trong 04_DemoScenarios.sql.
-- Script chỉ đọc; lỗi đầu tiên sẽ dừng bằng THROW.
USE HomeStay;
GO

IF EXISTS (
    SELECT 1
    FROM (VALUES
        ('PDK0001'), ('PDK0002'), ('PDK0003'), ('PDK0004'), ('PDK0005'),
        ('PDK0006'), ('PDK0007'), ('PDK0008'), ('PDK0009'), ('PDK0010')
    ) AS required(MaPDK)
    LEFT JOIN PhieuDangKy p ON p.MaPDK = required.MaPDK
    WHERE p.MaPDK IS NULL
)
    THROW 51000, 'Thieu phieu dang ky trong bo scenario.', 1;
GO

IF EXISTS (
    SELECT 1
    FROM (VALUES
        (N'KhoiTao'), (N'ChoThanhToan'), (N'ChoDoiChieu'), (N'DaThanhToan'),
        (N'ChoDuyet'), (N'DaDuyet'), (N'DaHuy')
    ) AS required(TrangThai)
    LEFT JOIN (SELECT DISTINCT TrangThai FROM PhieuCoc) actual ON actual.TrangThai = required.TrangThai
    WHERE actual.TrangThai IS NULL
)
    THROW 51001, 'Thieu trang thai phieu coc can kiem thu.', 1;
GO

IF EXISTS (
    SELECT 1
    FROM PhieuCoc
    WHERE TrangThai = N'ChoThanhToan'
      AND HanThanhToan IS NULL
)
    THROW 51023, 'Phieu coc cho thanh toan phai co han thanh toan.', 1;
GO

IF EXISTS (
    SELECT 1
    FROM (VALUES
        (N'DaXacNhan'), (N'DaHuy'), (N'VangMat'), (N'DaCheckin'), (N'DaHoanThanh')
    ) AS required(TrangThai)
    LEFT JOIN (SELECT DISTINCT TrangThai FROM LichHen) actual ON actual.TrangThai = required.TrangThai
    WHERE actual.TrangThai IS NULL
)
    THROW 51002, 'Thieu trang thai lich hen can kiem thu.', 1;
GO

IF NOT EXISTS (
    SELECT 1
    FROM LichHen lh
    INNER JOIN PhieuDangKy pdk ON pdk.MaPDK = lh.MaPDK
    INNER JOIN KhachHang kh ON kh.MaKH = pdk.MaKH
    WHERE lh.MaLH = 'LH0011'
      AND lh.LoaiLichHen = N'XemPhong'
      AND lh.TrangThai = N'DaHoanThanh'
      AND lh.MaPhieuCoc IS NULL
)
    THROW 51024, 'Thieu lich hen du dieu kien lap phieu coc.', 1;
GO

IF EXISTS (
    SELECT 1
    FROM (VALUES
        (N'ChoKy'), (N'ChoThanhToan'), (N'ChoBanGiao'),
        (N'DangHieuLuc'), (N'DaThanhLy'), (N'DaHuy')
    ) AS required(TrangThai)
    LEFT JOIN (SELECT DISTINCT TrangThai FROM HopDong) actual ON actual.TrangThai = required.TrangThai
    WHERE actual.TrangThai IS NULL
)
    THROW 51003, 'Thieu trang thai hop dong can kiem thu.', 1;
GO

IF EXISTS (
    SELECT 1
    FROM (VALUES
        (N'Trong'), (N'ConGiuongTrong'), (N'GiuCho'), (N'DaCoc'),
        (N'DangSuDung'), (N'DangBaoTri'), (N'NgungSuDung')
    ) AS required(TrangThai)
    LEFT JOIN (SELECT DISTINCT TrangThai FROM Phong) actual ON actual.TrangThai = required.TrangThai
    WHERE actual.TrangThai IS NULL
)
    THROW 51004, 'Thieu trang thai phong can kiem thu.', 1;
GO

IF EXISTS (
    SELECT 1
    FROM (VALUES
        (N'Trong'), (N'GiuCho'), (N'DaCoc'),
        (N'DangSuDung'), (N'DangBaoTri'), (N'NgungSuDung')
    ) AS required(TrangThai)
    LEFT JOIN (SELECT DISTINCT TrangThai FROM Giuong) actual ON actual.TrangThai = required.TrangThai
    WHERE actual.TrangThai IS NULL
)
    THROW 51005, 'Thieu trang thai giuong can kiem thu.', 1;
GO

-- Mỗi phòng scenario có số giường đúng bằng sức chứa loại phòng.
IF EXISTS (
    SELECT p.MaPhong
    FROM Phong p
    INNER JOIN LoaiPhong lp ON lp.MaLP = p.MaLP
    LEFT JOIN Giuong g ON g.MaPhong = p.MaPhong
    WHERE p.MaPhong BETWEEN 'P004' AND 'P012'
    GROUP BY p.MaPhong, lp.SucChua
    HAVING COUNT(g.MaGiuong) <> lp.SucChua
)
    THROW 51006, 'So giuong cua phong scenario khong khop suc chua.', 1;
GO

-- Mỗi phiếu cọc có ít nhất một thành viên đại diện và đủ chi tiết giường.
IF EXISTS (
    SELECT pc.MaPhieuCoc
    FROM PhieuCoc pc
    WHERE pc.MaPhieuCoc BETWEEN 'PC0001' AND 'PC0010'
      AND (
          (SELECT COUNT(*) FROM ChiTietPhieuCoc ct WHERE ct.MaPhieuCoc = pc.MaPhieuCoc) <> pc.SoGiuongThue
          OR
          (SELECT COUNT(*) FROM ThanhVienDangKy tv WHERE tv.MaPhieuCoc = pc.MaPhieuCoc AND tv.VaiTro = N'DaiDien') <> 1
      )
)
    THROW 51007, 'Phieu coc scenario thieu dai dien hoac chi tiet giuong.', 1;
GO

-- Đại diện của phiếu cọc phải trùng với MaKH của phiếu cọc.
IF EXISTS (
    SELECT 1
    FROM PhieuCoc pc
    LEFT JOIN ThanhVienDangKy tv
        ON tv.MaPhieuCoc = pc.MaPhieuCoc
       AND tv.VaiTro = N'DaiDien'
    WHERE pc.MaPhieuCoc BETWEEN 'PC0001' AND 'PC0010'
      AND (tv.MaKH IS NULL OR tv.MaKH <> pc.MaKH)
)
    THROW 51008, 'Dai dien phieu coc khong trung MaKH.', 1;
GO

-- Thuê nguyên căn phải thuê toàn bộ số giường của loại phòng.
IF EXISTS (
    SELECT 1
    FROM PhieuCoc pc
    INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
    INNER JOIN LoaiPhong lp ON lp.MaLP = p.MaLP
    WHERE pc.MaPhieuCoc BETWEEN 'PC0001' AND 'PC0010'
      AND pc.HinhThucThue = N'NguyenCan'
      AND pc.SoGiuongThue <> lp.SucChua
)
    THROW 51009, 'Phieu thue nguyen can khong du suc chua.', 1;
GO

-- Phiếu thu tiền cọc chỉ tồn tại sau khi Quản lý xác nhận thanh toán.
IF EXISTS (
    SELECT 1
    FROM PhieuThu pt
    INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = pt.MaPhieuCoc
    WHERE pc.TrangThai = N'ChoDoiChieu'
)
    THROW 51010, 'Phieu coc cho doi chieu khong duoc co PhieuThu.', 1;
GO

-- Phiếu đã thanh toán phải có đúng một phiếu thu dương và khớp toàn bộ tiền cọc.
IF EXISTS (
    SELECT 1
    FROM PhieuCoc pc
    LEFT JOIN PhieuThu pt ON pt.MaPhieuCoc = pc.MaPhieuCoc
    WHERE pc.TrangThai = N'DaThanhToan'
      AND (pt.MaPT IS NULL OR pt.SoTienThu <= 0 OR pt.SoTienThu <> pc.TongTien)
)
    THROW 51018, 'Phieu coc da thanh toan thieu PhieuThu hoac so tien thuc thu khong khop.', 1;
GO

-- Phiếu cọc demo đã thu tiền và bị hủy phải sẵn sàng cho hàng đợi đối soát.
IF NOT EXISTS (
    SELECT 1
    FROM PhieuCoc pc
    INNER JOIN PhieuThu pt ON pt.MaPhieuCoc = pc.MaPhieuCoc
    WHERE pc.MaPhieuCoc = 'PC0007'
      AND pc.TrangThai = N'DaHuy'
      AND pc.ThoiDiemHuy IS NOT NULL
      AND pt.SoTienThu = pc.TongTien
      AND pt.SoTienThu > 0
      AND NOT EXISTS (SELECT 1 FROM HopDong hd WHERE hd.MaPhieuCoc = pc.MaPhieuCoc)
      AND NOT EXISTS (SELECT 1 FROM PhieuDoiSoat pds WHERE pds.MaPhieuCoc = pc.MaPhieuCoc)
)
    THROW 51013, 'Thieu kich ban phieu coc da thu tien bi huy cho doi soat.', 1;
GO

-- PĐS của phiếu cọc chưa ký chỉ được tạo cho phiếu đã hủy và có số tiền thực thu khớp.
IF EXISTS (
    SELECT 1
    FROM PhieuDoiSoat pds
    INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = pds.MaPhieuCoc
    LEFT JOIN PhieuThu pt ON pt.MaPhieuCoc = pc.MaPhieuCoc
    WHERE pds.MaHD IS NULL
      AND (
          pc.TrangThai <> N'DaHuy'
          OR pc.ThoiDiemHuy IS NULL
          OR pt.MaPT IS NULL
          OR pt.SoTienThu <= 0
          OR pt.SoTienThu <> pc.TongTien
          OR EXISTS (SELECT 1 FROM HopDong hd WHERE hd.MaPhieuCoc = pc.MaPhieuCoc)
      )
)
    THROW 51014, 'Phieu doi soat chua ky khong du dieu kien hoan coc.', 1;
GO

IF EXISTS (
    SELECT MaPhieuCoc
    FROM PhieuDoiSoat
    WHERE MaHD IS NULL
    GROUP BY MaPhieuCoc
    HAVING COUNT(*) > 1
)
    THROW 51015, 'Mot phieu coc chua ky co nhieu phieu doi soat.', 1;
GO

-- Phiếu hoàn cọc đã phát hành phải đi cùng PĐS đã tất toán.
IF EXISTS (
    SELECT 1
    FROM PhieuHoanCoc phc
    INNER JOIN PhieuDoiSoat pds ON pds.MaPDS = phc.MaPDS
    WHERE pds.TrangThai <> N'DaTatToan'
)
    THROW 51016, 'Phieu hoan coc ton tai nhung phieu doi soat chua tat toan.', 1;
GO

-- PĐS chỉ được chốt/tất toán sau khi có đủ dấu vết Quản lý xác nhận khách đồng ý.
IF EXISTS (
    SELECT 1 FROM PhieuDoiSoat
    WHERE (TrangThai = N'ChoXacNhan' AND (KhachHangDongY <> 0 OR MaNVChot IS NOT NULL OR ThoiDiemChot IS NOT NULL))
       OR (TrangThai IN (N'DaChot', N'DaTatToan') AND (KhachHangDongY <> 1 OR MaNVChot IS NULL OR ThoiDiemChot IS NULL))
)
    THROW 51019, 'Trang thai phieu doi soat khong khop dau vet xac nhan.', 1;
GO

IF NOT EXISTS (SELECT 1 FROM PhieuDoiSoat WHERE TrangThai = N'ChoXacNhan')
    THROW 51020, 'Thieu kich ban phieu doi soat cho Quan ly xac nhan.', 1;
GO

IF EXISTS (SELECT 1 FROM PhieuThu WHERE AnhMinhChung IS NULL OR LEN(LTRIM(RTRIM(AnhMinhChung))) = 0)
    THROW 51021, 'Phieu thu thieu chung tu xac nhan da thu tien.', 1;
GO

IF EXISTS (
    SELECT 1 FROM PhieuHoanCoc
    WHERE MinhChung IS NULL OR LEN(LTRIM(RTRIM(MinhChung))) = 0
       OR ThongTinNhanTien IS NULL OR LEN(LTRIM(RTRIM(ThongTinNhanTien))) = 0
       OR (PhuongThucHoan = N'ChuyenKhoan' AND (MaGiaoDich IS NULL OR LEN(LTRIM(RTRIM(MaGiaoDich))) = 0))
)
    THROW 51022, 'Phieu hoan coc thieu chung tu, nguoi nhan hoac ma giao dich.', 1;
GO

-- Phiếu chờ đối chiếu phải có chứng từ, phương thức và toàn bộ giường còn giữ chỗ.
IF EXISTS (
    SELECT 1
    FROM PhieuCoc pc
    WHERE pc.TrangThai = N'ChoDoiChieu'
      AND (
          pc.AnhMinhChung IS NULL
          OR pc.PhuongThucThanhToan IS NULL
          OR pc.PhuongThucThanhToan NOT IN (N'ChuyenKhoan', N'TienMat')
          OR EXISTS (
              SELECT 1
              FROM ChiTietPhieuCoc ct
              INNER JOIN Giuong g ON g.MaGiuong = ct.MaGiuong
              WHERE ct.MaPhieuCoc = pc.MaPhieuCoc
                AND g.TrangThai <> N'GiuCho'
          )
      )
)
    THROW 51012, 'Phieu coc cho doi chieu chua san sang de xac nhan.', 1;
GO

-- Phiếu đã thanh toán nhưng chưa có hợp đồng phải còn giữ các giường để có thể hủy an toàn.
IF EXISTS (
    SELECT 1
    FROM PhieuCoc pc
    INNER JOIN ChiTietPhieuCoc ct ON ct.MaPhieuCoc = pc.MaPhieuCoc
    INNER JOIN Giuong g ON g.MaGiuong = ct.MaGiuong
    WHERE pc.TrangThai = N'DaThanhToan'
      AND NOT EXISTS (SELECT 1 FROM HopDong hd WHERE hd.MaPhieuCoc = pc.MaPhieuCoc)
      AND g.TrangThai NOT IN (N'GiuCho', N'DaCoc')
)
    THROW 51017, 'Phieu coc da thanh toan co giuong khong con duoc giu coc.', 1;
GO

-- Giường trong hợp đồng phải thuộc phòng của phiếu cọc tương ứng.
IF EXISTS (
    SELECT 1
    FROM ChiTietHopDong ct
    INNER JOIN HopDong hd ON hd.MaHD = ct.MaHD
    INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
    INNER JOIN Giuong g ON g.MaGiuong = ct.MaGiuong
    WHERE ct.MaHD BETWEEN 'HD0001' AND 'HD0006'
      AND g.MaPhong <> pc.MaPhong
)
    THROW 51011, 'Chi tiet hop dong co giuong khac phong dat coc.', 1;
GO

-- Tổng hóa đơn phải bằng tổng các dòng chi tiết.
IF EXISTS (
    SELECT h.MaHoaDon
    FROM HoaDon h
    INNER JOIN (
        SELECT MaHoaDon, SUM(SoLuong * DonGia) AS TongChiTiet
        FROM ChiTietHoaDon
        GROUP BY MaHoaDon
    ) ct ON ct.MaHoaDon = h.MaHoaDon
    WHERE h.MaHoaDon BETWEEN 'HDON0002' AND 'HDON0004'
      AND h.TongTien <> ct.TongChiTiet
)
    THROW 51011, 'Tong hoa don khong khop chi tiet.', 1;
GO

PRINT N'05_ValidateDemoData.sql: dữ liệu mẫu hợp lệ.';
GO
