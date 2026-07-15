namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChiTietGiaoNhanDB
{
    public static async Task<bool> ThamChieuMinhChung(string tenTep)
    {
        const string sql = """
            SELECT COUNT(1) FROM ChiTietGiaoNhan ct
            INNER JOIN BienBanGiaoNhan bb ON bb.MaBienBan=ct.MaBienBan
            WHERE ct.MinhChung=@TenTep OR ct.MinhChung LIKE '%/' + @TenTep
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { TenTep = tenTep }, PhienDuLieu.Session.Transaction) > 0;
    }
    public static async Task ThemNhieu(IEnumerable<ChiTietGiaoNhan> chiTiet)
    {
        const string sql = """
            INSERT INTO ChiTietGiaoNhan (MaBienBan, MaTS, TinhTrang, SoLuong, GhiChu, MinhChung)
            VALUES (@MaBienBan, @MaTS, @TinhTrang, @SoLuong, @GhiChu, @MinhChung)
            """;

        foreach (var item in chiTiet)
        {
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, item, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("Không thể lưu chi tiết biên bản thu hồi.");
        }
    }

    public static async Task<IReadOnlyList<ChiTietGiaoNhan>> GetDSTaiSanHuHongTheoBienBan(string maBienBan)
    {
        const string sql = """
            SELECT
                ct.MaBienBan,
                ct.MaTS,
                ct.TinhTrang,
                ct.SoLuong,
                ct.GhiChu,
                ct.MinhChung,
                ts.TenTaiSan,
                ts.GiaTri AS GiaTriGoiY
            FROM ChiTietGiaoNhan ct
            INNER JOIN TaiSan ts ON ts.MaTS = ct.MaTS
            WHERE ct.MaBienBan = @MaBienBan
              AND ct.TinhTrang IN (N'Hư hỏng', N'Mất mát')
            ORDER BY ct.MaTS
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<ChiTietGiaoNhan>(
            sql, new { MaBienBan = maBienBan }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }
}
