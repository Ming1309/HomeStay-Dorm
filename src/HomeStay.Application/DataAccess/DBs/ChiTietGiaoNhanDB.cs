namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChiTietGiaoNhanDB
{
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
}
