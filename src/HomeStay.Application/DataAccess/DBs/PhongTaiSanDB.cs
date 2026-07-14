namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhongTaiSanDB
{
    public static async Task<IReadOnlyList<PhongTaiSan>> LayTaiSanTheoPhong(string maPhong)
    {
        const string sql = """
            SELECT pts.MaPhong, pts.MaTS, pts.SoLuongTieuChuan,
                   ts.MaTS, ts.TenTaiSan, ts.LoaiTaiSan, ts.GiaTri, ts.MoTa, ts.TrangThai
            FROM Phong_TaiSan pts
            INNER JOIN TaiSan ts ON pts.MaTS = ts.MaTS
            WHERE pts.MaPhong = @MaPhong
            """;
        var result = await PhienDuLieu.Session.Connection.QueryAsync<PhongTaiSan, TaiSan, PhongTaiSan>(
            sql,
            (pts, ts) =>
            {
                pts.TaiSan = ts;
                return pts;
            },
            new { MaPhong = maPhong },
            PhienDuLieu.Session.Transaction,
            splitOn: "MaTS");
        return result.ToList();
    }
}
