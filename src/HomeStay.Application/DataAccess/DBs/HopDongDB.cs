namespace HomeStay.Application.DataAccess.DBs;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class HopDongDB
{
    // ==========================================================
    // Methods from develop branch
    // ==========================================================
    public static async Task<bool> TonTaiTheoPhieuCoc(string maPhieuCoc)
    {
        const string sql = "SELECT COUNT(1) FROM HopDong WHERE MaPhieuCoc=@MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<IReadOnlyList<dynamic>> TimKiemHopDongHieuLuc(string? tuKhoa)
    {
        const string sql = """
            SELECT hd.MaHD, hd.TrangThai, kh.MaKH, kh.HoTen, kh.SDT
            FROM HopDong hd
            JOIN PhieuCoc pc ON hd.MaPhieuCoc = pc.MaPhieuCoc
            JOIN KhachHang kh ON pc.MaKH = kh.MaKH
            WHERE hd.TrangThai = N'DangHieuLuc'
              AND (@TuKhoa IS NULL OR hd.MaHD LIKE '%' + @TuKhoa + '%' OR kh.HoTen LIKE '%' + @TuKhoa + '%' OR kh.SDT LIKE '%' + @TuKhoa + '%')
            ORDER BY hd.NgayBatDau DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync(
            sql, new { TuKhoa = string.IsNullOrWhiteSpace(tuKhoa) ? null : tuKhoa.Trim() }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> KiemTraConHopLe(string maHD)
    {
        const string sql = "SELECT COUNT(1) FROM HopDong WHERE MaHD = @MaHD AND TrangThai = N'DangHieuLuc'";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<IReadOnlyList<HopDong>> TraCuu(string? tuKhoa, string? trangThai)
    {
        const string sql = """
            SELECT DISTINCT hd.MaHD, hd.NgayKy, hd.NgayBatDau, hd.NgayKetThuc, hd.KyThanhToan,
                   hd.GiaThue, hd.TrangThai, hd.MaNV, hd.MaPhieuCoc, hd.MaChinhSach, hd.MaQLDuyet,
                   pc.MaKH, kh.HoTen AS TenKhachHang, kh.SDT, kh.SoGiayTo,
                   p.MaPhong, p.SoPhong, p.ToaNha,
                   lp.MaLP, lp.TenLoaiPhong, lp.SucChua, lp.GiaThue AS GiaThueLoaiPhong,
                   pc.TongTien AS TienCoc
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            INNER JOIN LoaiPhong lp ON lp.MaLP = p.MaLP
            LEFT JOIN ChiTietHopDong cthd ON cthd.MaHD = hd.MaHD
            LEFT JOIN Giuong g ON g.MaGiuong = cthd.MaGiuong
            WHERE (@TuKhoa IS NULL
                   OR hd.MaHD LIKE '%' + @TuKhoa + '%'
                   OR kh.HoTen LIKE '%' + @TuKhoa + '%'
                   OR kh.SDT LIKE '%' + @TuKhoa + '%'
                   OR kh.SoGiayTo LIKE '%' + @TuKhoa + '%'
                   OR p.SoPhong LIKE '%' + @TuKhoa + '%'
                   OR g.SoGiuong LIKE '%' + @TuKhoa + '%')
              AND (@TrangThai IS NULL OR hd.TrangThai = @TrangThai)
            ORDER BY hd.NgayBatDau DESC, hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongListRow>(sql,
            new { TuKhoa = ChuanHoa(tuKhoa), TrangThai = ChuanHoa(trangThai) },
            PhienDuLieu.Session.Transaction);
        return rows.Select(TaoHopDongDanhSach).ToList();
    }

    public static async Task<IReadOnlyList<HopDong>> LayDanhSachHieuLuc()
    {
        const string sql = """
            SELECT hd.MaHD, hd.NgayKy, hd.NgayBatDau, hd.NgayKetThuc, hd.KyThanhToan,
                   hd.GiaThue, hd.TrangThai, hd.MaNV, hd.MaPhieuCoc, hd.MaChinhSach, hd.MaQLDuyet,
                   pc.MaKH, kh.HoTen AS TenKhachHang, kh.SDT, kh.SoGiayTo,
                   p.MaPhong, p.SoPhong, p.ToaNha,
                   lp.MaLP, lp.TenLoaiPhong, lp.SucChua, lp.GiaThue AS GiaThueLoaiPhong,
                   pc.TongTien AS TienCoc
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            INNER JOIN LoaiPhong lp ON lp.MaLP = p.MaLP
            WHERE hd.TrangThai = N'DangHieuLuc'
            ORDER BY hd.NgayBatDau DESC, hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongListRow>(sql,
            transaction: PhienDuLieu.Session.Transaction);
        return rows.Select(TaoHopDongDanhSach).ToList();
    }

    public static async Task<IReadOnlyList<HopDongCoLichTraPhong>> LayDanhSachCoLichTraTrongNgay(string? tuKhoa = null)
    {
        const string sql = """
            SELECT hd.MaHD, kh.HoTen AS TenKhachHang, p.SoPhong, p.ToaNha,
                   lh.NgayHen AS NgayTraPhong, lh.GioHen AS GioTraPhong, lh.MaLH
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            INNER JOIN LichHen lh ON lh.MaHD = hd.MaHD
            WHERE hd.TrangThai = N'DangHieuLuc'
              AND lh.LoaiLichHen = N'TraPhong'
              AND CAST(lh.NgayHen AS DATE) = CAST(GETDATE() AS DATE)
              AND lh.TrangThai NOT IN (N'DaHuy', N'VangMat')
              AND NOT EXISTS (
                  SELECT 1 FROM BienBanGiaoNhan bb
                  WHERE bb.MaHD = hd.MaHD AND bb.LoaiBienBan = N'ThuHoi'
              )
              AND (@TuKhoa IS NULL
                   OR hd.MaHD LIKE '%' + @TuKhoa + '%'
                   OR kh.HoTen LIKE '%' + @TuKhoa + '%'
                   OR p.SoPhong LIKE '%' + @TuKhoa + '%')
            ORDER BY lh.GioHen, hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongCoLichTraPhong>(sql,
            new { TuKhoa = ChuanHoa(tuKhoa) }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> CoLichTraPhongTrongNgay(string maHD)
    {
        const string sql = """
            SELECT COUNT(1)
            FROM LichHen lh
            INNER JOIN HopDong hd ON hd.MaHD = lh.MaHD
            WHERE lh.MaHD = @MaHD
              AND hd.TrangThai = N'DangHieuLuc'
              AND lh.LoaiLichHen = N'TraPhong'
              AND CAST(lh.NgayHen AS DATE) = CAST(GETDATE() AS DATE)
              AND lh.TrangThai NOT IN (N'DaHuy', N'VangMat')
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<HopDong?> DocChiTiet(string maHD)
    {
        const string sql = """
            SELECT hd.MaHD, hd.NgayKy, hd.NgayBatDau, hd.NgayKetThuc, hd.KyThanhToan,
                   hd.GiaThue, hd.DieuKhoan, hd.TrangThai, hd.MaNV, hd.MaPhieuCoc,
                   hd.MaChinhSach, hd.MaQLDuyet,
                   pc.MaKH, kh.HoTen AS TenKhachHang, kh.SDT, kh.Email, kh.LoaiGiayTo, kh.SoGiayTo,
                   kh.NgaySinh, kh.GioiTinh, kh.QuocTich, kh.DiaChiThuongTru,
                   p.MaPhong, p.SoPhong, p.ToaNha, p.Tang,
                   lp.MaLP, lp.TenLoaiPhong, lp.SucChua, lp.GiaThue AS GiaThueLoaiPhong,
                   pc.TongTien AS TienCoc
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            INNER JOIN LoaiPhong lp ON lp.MaLP = p.MaLP
            WHERE hd.MaHD = @MaHD
            """;
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<HopDongDetailRow>(sql,
            new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
        return row is null ? null : TaoHopDongChiTiet(row);
    }

    // ==========================================================
    // Methods from feat/lap-phieu-doi-soat branch
    // ==========================================================
    public static async Task<IReadOnlyList<HopDong>> LayDanhSachChoDoiSoat()
    {
        // UC 1.4.18: HĐ đang hiệu lực + đã thu hồi tài sản + chưa có phiếu đối soát
        const string sql = """
            SELECT hd.MaHD, hd.NgayBatDau, hd.NgayKetThuc, hd.GiaThue, hd.TrangThai, hd.MaPhieuCoc, hd.MaChinhSach,
                   kh.MaKH, kh.HoTen AS TenKhachHang,
                   pc.MaPhieuCoc, pc.TongTien AS TienCoc,
                   p.MaPhong, p.SoPhong, p.ToaNha
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            WHERE hd.TrangThai = N'DangHieuLuc'
              AND EXISTS (
                  SELECT 1 FROM BienBanGiaoNhan bb
                  WHERE bb.MaHD = hd.MaHD AND bb.LoaiBienBan = N'ThuHoi'
              )
              AND NOT EXISTS (SELECT 1 FROM PhieuDoiSoat pds WHERE pds.MaHD = hd.MaHD)
            ORDER BY hd.NgayKetThuc, hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongRow>(sql,
            null, PhienDuLieu.Session.Transaction);
        return rows.Select(x => new HopDong
        {
            MaHD = x.MaHD,
            NgayBatDau = x.NgayBatDau,
            NgayKetThuc = x.NgayKetThuc,
            GiaThue = x.GiaThue,
            TrangThai = x.TrangThai,
            MaPhieuCoc = x.MaPhieuCoc,
            MaChinhSach = x.MaChinhSach,
            KhachHang = new KhachHang { MaKH = x.MaKH, HoTen = x.TenKhachHang },
            PhieuCoc = new PhieuCoc
            {
                MaPhieuCoc = x.MaPhieuCoc,
                TongTien = x.TienCoc,
                Phong = new Phong { MaPhong = x.MaPhong, SoPhong = x.SoPhong, ToaNha = x.ToaNha }
            }
        }).ToList();
    }

    // UC 1.4.23 Thanh lý hợp đồng
    public static async Task<IReadOnlyList<HopDongChoThanhLy>> LayDanhSachChoThanhLy(string? tuKhoa = null)
    {
        const string sql = """
            SELECT hd.MaHD, hd.NgayBatDau, hd.NgayKetThuc, hd.TrangThai, hd.GiaThue,
                   pc.TongTien AS TienCoc,
                   kh.MaKH, kh.HoTen AS TenKhachHang, kh.SDT,
                   p.MaPhong, p.SoPhong, p.ToaNha,
                   pds.MaPDS, pds.TienHoan, pds.TienThuThem, pds.TongKhauTru, pds.TrangThai AS TrangThaiPDS
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            INNER JOIN PhieuDoiSoat pds ON pds.MaHD = hd.MaHD
            WHERE hd.TrangThai = N'DangHieuLuc'
              AND pds.TrangThai IN (N'DaChot', N'DaTatToan')
              AND (@TuKhoa IS NULL
                   OR hd.MaHD LIKE '%' + @TuKhoa + '%'
                   OR kh.HoTen LIKE '%' + @TuKhoa + '%'
                   OR kh.SDT LIKE '%' + @TuKhoa + '%'
                   OR p.SoPhong LIKE '%' + @TuKhoa + '%'
                   OR pds.MaPDS LIKE '%' + @TuKhoa + '%')
            ORDER BY pds.NgayDoiSoat DESC, hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongChoThanhLy>(sql,
            new { TuKhoa = ChuanHoa(tuKhoa) }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> UpdateTrangThaiThanhLy(string maHD)
    {
        const string sql = """
            UPDATE HopDong
            SET TrangThai = N'DaThanhLy'
            WHERE MaHD = @MaHD AND TrangThai = N'DangHieuLuc'
            """;
        return await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction) == 1;
    }

    public static async Task<HopDong?> LayThongTinLuuTru(string maHD)
    {
        const string sql = """
            SELECT hd.MaHD, hd.NgayBatDau, hd.NgayKetThuc, hd.GiaThue, hd.TrangThai, hd.MaPhieuCoc, hd.MaChinhSach,
                   kh.MaKH, kh.HoTen AS TenKhachHang,
                   pc.MaPhieuCoc, pc.TongTien AS TienCoc,
                   p.MaPhong, p.SoPhong, p.ToaNha
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            WHERE hd.MaHD = @MaHD
            """;
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<HopDongRow>(sql,
            new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
        if (row is null) return null;

        return new HopDong
        {
            MaHD = row.MaHD,
            NgayBatDau = row.NgayBatDau,
            NgayKetThuc = row.NgayKetThuc,
            GiaThue = row.GiaThue,
            TrangThai = row.TrangThai,
            MaPhieuCoc = row.MaPhieuCoc,
            MaChinhSach = row.MaChinhSach,
            KhachHang = new KhachHang { MaKH = row.MaKH, HoTen = row.TenKhachHang },
            PhieuCoc = new PhieuCoc
            {
                MaPhieuCoc = row.MaPhieuCoc,
                TongTien = row.TienCoc,
                Phong = new Phong { MaPhong = row.MaPhong, SoPhong = row.SoPhong, ToaNha = row.ToaNha }
            }
        };
    }

    // ==========================================================
    // Helper Classes and Methods
    // ==========================================================
    private class HopDongRow
    {
        public string MaHD { get; set; } = string.Empty;
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public decimal GiaThue { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string MaPhieuCoc { get; set; } = string.Empty;
        public string? MaChinhSach { get; set; }
        public string MaKH { get; set; } = string.Empty;
        public string TenKhachHang { get; set; } = string.Empty;
        public string MaPhong { get; set; } = string.Empty;
        public string SoPhong { get; set; } = string.Empty;
        public string? ToaNha { get; set; }
        public decimal TienCoc { get; set; }
    }

    private class HopDongListRow
    {
        public string MaHD { get; set; } = string.Empty;
        public DateTime? NgayKy { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public int? KyThanhToan { get; set; }
        public decimal GiaThue { get; set; }
        public decimal TienCoc { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? MaNV { get; set; }
        public string MaPhieuCoc { get; set; } = string.Empty;
        public string? MaChinhSach { get; set; }
        public string? MaQLDuyet { get; set; }
        public string MaKH { get; set; } = string.Empty;
        public string TenKhachHang { get; set; } = string.Empty;
        public string? SDT { get; set; }
        public string? SoGiayTo { get; set; }
        public string MaPhong { get; set; } = string.Empty;
        public string SoPhong { get; set; } = string.Empty;
        public string? ToaNha { get; set; }
        public string MaLP { get; set; } = string.Empty;
        public string TenLoaiPhong { get; set; } = string.Empty;
        public int SucChua { get; set; }
        public decimal GiaThueLoaiPhong { get; set; }
    }

    private sealed class HopDongDetailRow : HopDongListRow
    {
        public string? DieuKhoan { get; set; }
        public string? Email { get; set; }
        public string? LoaiGiayTo { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? QuocTich { get; set; }
        public string? DiaChiThuongTru { get; set; }
        public string? Tang { get; set; }
    }

    private static HopDong TaoHopDongDanhSach(HopDongListRow x) => new()
    {
        MaHD = x.MaHD,
        NgayKy = x.NgayKy,
        NgayBatDau = x.NgayBatDau,
        NgayKetThuc = x.NgayKetThuc,
        KyThanhToan = x.KyThanhToan,
        GiaThue = x.GiaThue,
        TienCoc = x.TienCoc,
        TrangThai = x.TrangThai,
        MaNV = x.MaNV,
        MaPhieuCoc = x.MaPhieuCoc,
        MaChinhSach = x.MaChinhSach,
        MaQLDuyet = x.MaQLDuyet,
        KhachHang = new KhachHang
        {
            MaKH = x.MaKH,
            HoTen = x.TenKhachHang,
            SDT = x.SDT,
            SoGiayTo = x.SoGiayTo,
        },
        Phong = new Phong
        {
            MaPhong = x.MaPhong,
            SoPhong = x.SoPhong,
            ToaNha = x.ToaNha,
            LoaiPhong = new LoaiPhong
            {
                MaLP = x.MaLP,
                TenLoaiPhong = x.TenLoaiPhong,
                SucChua = x.SucChua,
                GiaThue = x.GiaThueLoaiPhong,
            },
        },
    };

    private static HopDong TaoHopDongChiTiet(HopDongDetailRow x) => new()
    {
        MaHD = x.MaHD,
        NgayKy = x.NgayKy,
        NgayBatDau = x.NgayBatDau,
        NgayKetThuc = x.NgayKetThuc,
        KyThanhToan = x.KyThanhToan,
        GiaThue = x.GiaThue,
        TienCoc = x.TienCoc,
        DieuKhoan = x.DieuKhoan,
        TrangThai = x.TrangThai,
        MaNV = x.MaNV,
        MaPhieuCoc = x.MaPhieuCoc,
        MaChinhSach = x.MaChinhSach,
        MaQLDuyet = x.MaQLDuyet,
        KhachHang = new KhachHang
        {
            MaKH = x.MaKH,
            HoTen = x.TenKhachHang,
            SDT = x.SDT,
            Email = x.Email,
            LoaiGiayTo = x.LoaiGiayTo,
            SoGiayTo = x.SoGiayTo,
            NgaySinh = x.NgaySinh,
            GioiTinh = x.GioiTinh,
            QuocTich = x.QuocTich,
            DiaChiThuongTru = x.DiaChiThuongTru,
        },
        Phong = new Phong
        {
            MaPhong = x.MaPhong,
            SoPhong = x.SoPhong,
            ToaNha = x.ToaNha,
            Tang = x.Tang,
            LoaiPhong = new LoaiPhong
            {
                MaLP = x.MaLP,
                TenLoaiPhong = x.TenLoaiPhong,
                SucChua = x.SucChua,
                GiaThue = x.GiaThueLoaiPhong,
            },
        },
    };

    // ==========================================================
    // UC 1.4.15 Lập biên bản bàn giao
    // ==========================================================
    public static async Task<IReadOnlyList<HopDongChoBanGiao>> LayDanhSachChoBanGiao(string? tuKhoa = null)
    {
        const string sql = """
            SELECT hd.MaHD, kh.HoTen AS TenKhachHang, p.SoPhong, p.ToaNha, p.MaPhong
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            WHERE hd.TrangThai = N'ChoBanGiao'
              AND NOT EXISTS (
                  SELECT 1 FROM BienBanGiaoNhan bb
                  WHERE bb.MaHD = hd.MaHD AND bb.LoaiBienBan = N'BanGiao'
              )
              AND (@TuKhoa IS NULL
                   OR hd.MaHD LIKE '%' + @TuKhoa + '%'
                   OR kh.HoTen LIKE '%' + @TuKhoa + '%'
                   OR p.SoPhong LIKE '%' + @TuKhoa + '%')
            ORDER BY hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongChoBanGiao>(sql,
            new { TuKhoa = ChuanHoa(tuKhoa) }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    // Methods from feat/xu-li-thanh-toan branch
    // ==========================================================
    public static async Task<IReadOnlyList<HopDong>> LayDanhSachChoThanhToan()
    {
        const string sql = """
            SELECT hd.MaHD, hd.NgayKy, hd.NgayBatDau, hd.NgayKetThuc, hd.KyThanhToan,
                   hd.GiaThue, hd.TrangThai, hd.MaNV, hd.MaPhieuCoc, hd.MaChinhSach, hd.MaQLDuyet,
                   pc.MaKH, kh.HoTen AS TenKhachHang, kh.SDT, kh.SoGiayTo,
                   p.MaPhong, p.SoPhong, p.ToaNha,
                   lp.MaLP, lp.TenLoaiPhong, lp.SucChua, lp.GiaThue AS GiaThueLoaiPhong,
                   pc.TongTien AS TienCoc
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            INNER JOIN LoaiPhong lp ON lp.MaLP = p.MaLP
            WHERE hd.TrangThai = N'ChoThanhToan'
            ORDER BY hd.NgayBatDau DESC, hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongListRow>(sql,
            transaction: PhienDuLieu.Session.Transaction);
        return rows.Select(TaoHopDongDanhSach).ToList();
    }

    public static async Task Them(HopDong hd)
    {
        const string sql = """
            INSERT INTO HopDong (MaHD, NgayKy, NgayBatDau, NgayKetThuc, KyThanhToan, GiaThue, TrangThai, MaNV, MaPhieuCoc, MaQLDuyet, MaChinhSach)
            VALUES (@MaHD, @NgayKy, @NgayBatDau, @NgayKetThuc, @KyThanhToan, @GiaThue, @TrangThai, @MaNV, @MaPhieuCoc, @MaQLDuyet, @MaChinhSach)
            """;
        await PhienDuLieu.Session.Connection.ExecuteAsync(sql, hd, PhienDuLieu.Session.Transaction);
    }

    public static async Task<bool> UpdateTrangThai(string maHD, string trangThai)
    {
        const string sql = "UPDATE HopDong SET TrangThai = @TrangThai WHERE MaHD = @MaHD";
        return await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, new { MaHD = maHD, TrangThai = trangThai }, PhienDuLieu.Session.Transaction) == 1;
    }

    public static async Task<bool> UpdateTrangThaiChoThanhToan(string maHD, string trangThai)
    {
        const string sql = """
            UPDATE HopDong
            SET TrangThai = @TrangThai
            WHERE MaHD = @MaHD AND TrangThai = N'ChoThanhToan'
            """;
        return await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, new { MaHD = maHD, TrangThai = trangThai }, PhienDuLieu.Session.Transaction) == 1;
    }

    public static async Task<bool> TonTaiChoBanGiaoTheoHD(string maHD)
    {
        const string sql = "SELECT COUNT(1) FROM HopDong WHERE MaHD = @MaHD AND TrangThai = N'ChoBanGiao'";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction) > 0;
    }

    private static string? ChuanHoa(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
