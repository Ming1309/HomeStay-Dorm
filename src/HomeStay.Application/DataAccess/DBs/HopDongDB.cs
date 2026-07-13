namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class HopDongDB
{
    public static async Task<bool> TonTaiTheoPhieuCoc(string maPhieuCoc)
    {
        const string sql = "SELECT COUNT(1) FROM HopDong WHERE MaPhieuCoc=@MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction) > 0;
    }

    // Cài đặt tối thiểu phục vụ tạo lịch hẹn (Tránh conflict với UC khác)
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
                   hd.GiaThue, hd.TrangThai, hd.MaNV, hd.MaPhieuCoc, hd.MaChinhSach, hd.MaQD, hd.MaQLDuyet,
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
                   hd.GiaThue, hd.TrangThai, hd.MaNV, hd.MaPhieuCoc, hd.MaChinhSach, hd.MaQD, hd.MaQLDuyet,
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
                   hd.MaChinhSach, hd.MaQD, hd.MaQLDuyet,
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
        public string? MaQD { get; set; }
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
        MaQD = x.MaQD,
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
        MaQD = x.MaQD,
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

    private static string? ChuanHoa(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
