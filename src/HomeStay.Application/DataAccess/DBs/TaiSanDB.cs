namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class TaiSanDB
{
    public static async Task<TaiSan?> GetTaiSanTheoMaTS(string maTS)
    {
        const string sql = """
            SELECT MaTS, TenTaiSan, GiaTri
            FROM TaiSan
            WHERE MaTS = @MaTS
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<TaiSan>(
            sql, new { MaTS = maTS }, PhienDuLieu.Session.Transaction);
    }
}
