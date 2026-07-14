namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ThanhVienHopDongDB
{
    public static async Task<IReadOnlyList<ThanhVienHopDong>> LayDanhSachTheoHopDong(string maHD)
    {
        const string sql = """
            SELECT cthd.MaHD, cthd.MaGiuong, cthd.MaKH, cthd.TrangThaiThue, cthd.NgayTra,
                   kh.HoTen, kh.SDT, kh.Email, kh.LoaiGiayTo, kh.SoGiayTo,
                   kh.NgaySinh, kh.GioiTinh, kh.QuocTich, kh.DiaChiThuongTru,
                   g.MaGiuong AS MaGiuongGiuong, g.SoGiuong, g.TrangThai, g.MaPhong
            FROM ChiTietHopDong cthd
            INNER JOIN KhachHang kh ON kh.MaKH = cthd.MaKH
            INNER JOIN Giuong g ON g.MaGiuong = cthd.MaGiuong
            WHERE cthd.MaHD = @MaHD
            ORDER BY g.SoGiuong
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<ThanhVienHopDongRow>(sql,
            new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
        return rows.Select(TaoThanhVien).ToList();
    }

    public static async Task<bool> UpdateTrangThaiDangThue(string maHD)
    {
        const string sql = "UPDATE ChiTietHopDong SET TrangThaiThue = N'DangThue' WHERE MaHD = @MaHD AND TrangThaiThue = N'ChoThue'";
        var affected = await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
        return affected > 0;
    }

    public static async Task<bool> UpdateTrangThaiDaTra(string maHD, DateTime ngayTra)
    {
        const string sql = """
            UPDATE ChiTietHopDong
            SET TrangThaiThue = N'DaTra', NgayTra = @NgayTra
            WHERE MaHD = @MaHD AND TrangThaiThue = N'DangThue'
            """;
        var affected = await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, new { MaHD = maHD, NgayTra = ngayTra }, PhienDuLieu.Session.Transaction);
        return affected > 0;
    }

    private class ThanhVienHopDongRow
    {
        public string MaHD { get; set; } = string.Empty;
        public string MaGiuong { get; set; } = string.Empty;
        public string MaKH { get; set; } = string.Empty;
        public string TrangThaiThue { get; set; } = string.Empty;
        public DateTime? NgayTra { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? LoaiGiayTo { get; set; }
        public string? SoGiayTo { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? QuocTich { get; set; }
        public string? DiaChiThuongTru { get; set; }
        public string SoGiuong { get; set; } = string.Empty;
    }

    private static ThanhVienHopDong TaoThanhVien(ThanhVienHopDongRow x) => new()
    {
        MaHD = x.MaHD,
        MaGiuong = x.MaGiuong,
        MaKH = x.MaKH,
        TrangThaiThue = x.TrangThaiThue,
        NgayTra = x.NgayTra,
        KhachHang = new KhachHang
        {
            MaKH = x.MaKH,
            HoTen = x.HoTen,
            SDT = x.SDT,
            Email = x.Email,
            LoaiGiayTo = x.LoaiGiayTo,
            SoGiayTo = x.SoGiayTo,
            NgaySinh = x.NgaySinh,
            GioiTinh = x.GioiTinh,
            QuocTich = x.QuocTich,
            DiaChiThuongTru = x.DiaChiThuongTru,
        },
        Giuong = new Giuong { MaGiuong = x.MaGiuong, SoGiuong = x.SoGiuong },
    };
}
