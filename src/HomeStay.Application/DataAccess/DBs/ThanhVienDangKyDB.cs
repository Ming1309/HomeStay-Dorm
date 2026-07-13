namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ThanhVienDangKyDB
{
    public static async Task<IReadOnlyList<ThanhVienDangKy>> GetByMaPhieuCoc(string maPhieuCoc)
    {
        const string sql = """
            SELECT tv.MaPhieuCoc, tv.MaKH, tv.VaiTro, tv.TrangThaiDuyet,
                   kh.HoTen, kh.NgaySinh, kh.GioiTinh, kh.QuocTich,
                   kh.LoaiGiayTo, kh.SoGiayTo, kh.SDT, kh.Email, kh.DiaChiThuongTru
            FROM ThanhVienDangKy tv
            INNER JOIN KhachHang kh ON kh.MaKH = tv.MaKH
            WHERE tv.MaPhieuCoc = @MaPhieuCoc
            ORDER BY tv.VaiTro DESC, kh.HoTen
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<ThanhVienDangKyWithKhachHang>(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
        return rows.Select(MapToThanhVienDangKy).ToList();
    }

    public static async Task<bool> UpdateTrangThaiDuyet(string maPhieuCoc, string maKH, string trangThaiDuyet)
    {
        const string sql = """
            UPDATE ThanhVienDangKy
            SET TrangThaiDuyet = @TrangThaiDuyet
            WHERE MaPhieuCoc = @MaPhieuCoc AND MaKH = @MaKH
            """;
        return await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaPhieuCoc = maPhieuCoc, MaKH = maKH, TrangThaiDuyet = trangThaiDuyet },
            PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<bool> UpdateTatCaTrangThaiDuyet(string maPhieuCoc, string trangThaiDuyet)
    {
        const string sql = """
            UPDATE ThanhVienDangKy
            SET TrangThaiDuyet = @TrangThaiDuyet
            WHERE MaPhieuCoc = @MaPhieuCoc
            """;
        return await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaPhieuCoc = maPhieuCoc, TrangThaiDuyet = trangThaiDuyet },
            PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<bool> UpdateThanhVienConLaiHopLe(string maPhieuCoc)
    {
        const string sql = """
            UPDATE ThanhVienDangKy
            SET TrangThaiDuyet = N'HopLe'
            WHERE MaPhieuCoc = @MaPhieuCoc AND TrangThaiDuyet = N'ChoDuyet'
            """;
        return await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaPhieuCoc = maPhieuCoc },
            PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<int> CountThanhVienHopLe(string maPhieuCoc)
    {
        const string sql = """
            SELECT COUNT(*)
            FROM ThanhVienDangKy
            WHERE MaPhieuCoc = @MaPhieuCoc AND TrangThaiDuyet = N'HopLe'
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { MaPhieuCoc = maPhieuCoc },
            PhienDuLieu.Session.Transaction);
    }

    private sealed class ThanhVienDangKyWithKhachHang
    {
        public string MaPhieuCoc { get; set; } = string.Empty;
        public string MaKH { get; set; } = string.Empty;
        public string VaiTro { get; set; } = string.Empty;
        public string TrangThaiDuyet { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? QuocTich { get; set; }
        public string? LoaiGiayTo { get; set; }
        public string? SoGiayTo { get; set; }
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? DiaChiThuongTru { get; set; }
    }

    private static ThanhVienDangKy MapToThanhVienDangKy(ThanhVienDangKyWithKhachHang row)
    {
        return new ThanhVienDangKy
        {
            MaPhieuCoc = row.MaPhieuCoc,
            MaKH = row.MaKH,
            VaiTro = row.VaiTro,
            TrangThaiDuyet = row.TrangThaiDuyet,
            KhachHang = new KhachHang
            {
                MaKH = row.MaKH,
                HoTen = row.HoTen,
                NgaySinh = row.NgaySinh,
                GioiTinh = row.GioiTinh,
                QuocTich = row.QuocTich,
                LoaiGiayTo = row.LoaiGiayTo,
                SoGiayTo = row.SoGiayTo,
                SDT = row.SDT,
                Email = row.Email,
                DiaChiThuongTru = row.DiaChiThuongTru,
            },
        };
    }
}
