namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class DichVuHopDongDB
{
    public static async Task<IReadOnlyList<DichVuHopDong>> LayDanhSachTheoHopDong(string maHD)
    {
        const string sql = """
            SELECT hddv.MaHD, hddv.MaDV, hddv.DonGiaKyKet,
                   dv.TenDV, dv.DonGia, dv.DonViTinh, dv.TrangThai
            FROM HopDong_DichVu hddv
            INNER JOIN DichVu dv ON dv.MaDV = hddv.MaDV
            WHERE hddv.MaHD = @MaHD
            ORDER BY dv.TenDV
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<DichVuHopDongRow>(sql,
            new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
        return rows.Select(TaoDichVu).ToList();
    }

    private class DichVuHopDongRow
    {
        public string MaHD { get; set; } = string.Empty;
        public string MaDV { get; set; } = string.Empty;
        public decimal DonGiaKyKet { get; set; }
        public string TenDV { get; set; } = string.Empty;
        public decimal DonGia { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
    }

    private static DichVuHopDong TaoDichVu(DichVuHopDongRow x) => new()
    {
        MaHD = x.MaHD,
        MaDV = x.MaDV,
        DonGiaKyKet = x.DonGiaKyKet,
        DichVu = new DichVu
        {
            MaDV = x.MaDV,
            TenDV = x.TenDV,
            DonGia = x.DonGia,
            DonViTinh = x.DonViTinh,
            TrangThai = x.TrangThai,
        },
    };
}
