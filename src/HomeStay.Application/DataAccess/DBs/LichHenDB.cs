namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class LichHenDB
{
    public static Task<IReadOnlyList<LichHen>> LayDanhSachKhachChoCoc(string maCN, string? text = null) => DocDanhSach(maCN, text);

    public static async Task Them(LichHen lichHen)
    {
        lichHen.MaLH = await MaSoDB.LayMaMoi("LichHen");
        const string sql = """
            INSERT INTO LichHen (MaLH, NgayHen, GioHen, LoaiLichHen, TrangThai, MaPDK, MaPhieuCoc, MaHD, MaNV, MaCN)
            VALUES (@MaLH, @NgayHen, @GioHen, @LoaiLichHen, @TrangThai, @MaPDK, @MaPhieuCoc, @MaHD, @MaNV, @MaCN)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, lichHen, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo lịch hẹn.");
    }

    public static async Task CapNhat(LichHen lichHen)
    {
        const string sql = """
            UPDATE LichHen 
            SET NgayHen = @NgayHen, GioHen = @GioHen, MaNV = @MaNV, TrangThai = @TrangThai
            WHERE MaLH = @MaLH
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, lichHen, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật lịch hẹn.");
    }

    public static async Task<bool> KiemTraLichTrungCaNhanVien(string maNV, DateTime ngayHen, TimeSpan gioHen)
    {
        const string sql = """
            SELECT COUNT(1) FROM LichHen
            WHERE MaNV = @MaNV AND NgayHen = CAST(@NgayHen AS DATE) AND GioHen = @GioHen
              AND TrangThai NOT IN (N'DaHuy', N'DaHoanThanh')
            """;
        var count = await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaNV = maNV, NgayHen = ngayHen, GioHen = gioHen }, PhienDuLieu.Session.Transaction);
        return count > 0;
    }

    public static async Task<bool> KiemTraLichTrungCaNhanVienKhacLichHienTai(string maNV, DateTime ngayHen, TimeSpan gioHen, string maLH)
    {
        const string sql = """
            SELECT COUNT(1) FROM LichHen
            WHERE MaNV = @MaNV AND NgayHen = CAST(@NgayHen AS DATE) AND GioHen = @GioHen
              AND TrangThai NOT IN (N'DaHuy', N'DaHoanThanh')
              AND MaLH != @MaLH
            """;
        var count = await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaNV = maNV, NgayHen = ngayHen, GioHen = gioHen, MaLH = maLH }, PhienDuLieu.Session.Transaction);
        return count > 0;
    }

    public static async Task<LichHen?> DocChiTiet(string maLichHen, string maCN, bool khoaCapNhat = false)
    {
        var goiYKhoa = khoaCapNhat ? " WITH (UPDLOCK, HOLDLOCK)" : string.Empty;
        var sql = $"""
            SELECT lh.*, kh.*
            FROM LichHen lh{goiYKhoa}
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK=pdk.MaPDK
            LEFT JOIN KhachHang kh ON pdk.MaKH=kh.MaKH
            WHERE lh.MaLH=@MaLichHen AND lh.MaCN=@MaCN
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<LichHen, KhachHang, LichHen>(sql, (lich, khach) =>
        {
            lich.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
            return lich;
        }, new { MaLichHen = maLichHen, MaCN = maCN }, PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return rows.SingleOrDefault();
    }

    public static async Task<IReadOnlyList<LichHen>> GetLichNhanPhongHomNay()
    {
        const string sql = """
            SELECT lh.*, kh.*
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK=pdk.MaPDK
            LEFT JOIN KhachHang kh ON pdk.MaKH=kh.MaKH
            WHERE lh.LoaiLichHen=N'NhanPhong'
              AND CAST(lh.NgayHen AS DATE)=CAST(GETDATE() AS DATE)
              AND lh.MaPhieuCoc IS NOT NULL
            ORDER BY lh.GioHen
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<LichHen, KhachHang, LichHen>(sql, (lich, khach) =>
        {
            lich.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
            return lich;
        }, null, PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return rows.ToList();
    }

    public static async Task<LichHen?> DocTheoMaPhieuCoc(string maPhieuCoc)
    {
        const string sql = "SELECT * FROM LichHen WHERE MaPhieuCoc=@MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<LichHen>(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
    }

    public static async Task GanPhieuCoc(LichHen lichHen)
    {
        const string sql = """
            UPDATE LichHen SET MaPhieuCoc=@MaPhieuCoc
            WHERE MaLH=@MaLH AND LoaiLichHen=N'XemPhong'
              AND TrangThai=N'DaHoanThanh' AND MaPhieuCoc IS NULL
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, lichHen, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Lịch hẹn đã thay đổi, không thể gắn phiếu cọc.");
    }

    public static async Task<IReadOnlyList<LichHen>> TraCuuLichHenTongQuat(string maCN, string? keyword, DateTime? date, TimeSpan? time)
    {
        const string sql = """
            SELECT lh.*, kh.*
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK = pdk.MaPDK
            LEFT JOIN PhieuCoc pc ON lh.MaPhieuCoc = pc.MaPhieuCoc
            LEFT JOIN HopDong hd ON lh.MaHD = hd.MaHD
            LEFT JOIN KhachHang kh ON 
                kh.MaKH = pdk.MaKH OR kh.MaKH = pc.MaKH OR kh.MaKH = (SELECT MaKH FROM PhieuCoc WHERE MaPhieuCoc = hd.MaPhieuCoc)
            WHERE lh.MaCN=@MaCN
              AND (@Keyword IS NULL OR lh.MaLH LIKE '%' + @Keyword + '%' OR kh.HoTen LIKE '%' + @Keyword + '%' OR kh.SDT LIKE '%' + @Keyword + '%' OR kh.SoGiayTo LIKE '%' + @Keyword + '%' OR lh.TrangThai LIKE '%' + @Keyword + '%')
              AND (@Date IS NULL OR CAST(lh.NgayHen AS DATE) = CAST(@Date AS DATE))
              AND (@Time IS NULL OR lh.GioHen = @Time)
            ORDER BY lh.NgayHen DESC, lh.GioHen DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<LichHen, KhachHang, LichHen>(sql, (lich, khach) =>
        {
            lich.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
            return lich;
        }, new 
        { 
            MaCN = maCN, Keyword = string.IsNullOrWhiteSpace(keyword) ? null : keyword.Trim(),
            Date = date,
            Time = time
        }, PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return rows.ToList();
    }

    private static async Task<IReadOnlyList<LichHen>> DocDanhSach(string maCN, string? text)
    {
        const string sql = """
            SELECT lh.*, kh.*
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK=pdk.MaPDK
            LEFT JOIN KhachHang kh ON pdk.MaKH=kh.MaKH
            WHERE lh.MaCN=@MaCN AND lh.LoaiLichHen=N'XemPhong' AND lh.TrangThai=N'DaHoanThanh' AND lh.MaPhieuCoc IS NULL
              AND (@Text IS NULL OR lh.MaLH LIKE '%' + @Text + '%' OR kh.HoTen LIKE '%' + @Text + '%' OR kh.SDT LIKE '%' + @Text + '%')
            ORDER BY lh.NgayHen, lh.GioHen
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<LichHen, KhachHang, LichHen>(sql, (lich, khach) =>
        {
            lich.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
            return lich;
        }, new { MaCN = maCN, Text = string.IsNullOrWhiteSpace(text) ? null : text.Trim() }, PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return rows.ToList();
    }
}
