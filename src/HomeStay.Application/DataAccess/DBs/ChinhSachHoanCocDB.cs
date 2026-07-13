namespace HomeStay.Application.DataAccess.DBs;

using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChinhSachHoanCocDB
{
    public static async Task<ChinhSachHoanCoc?> LayChinhSachDangApDung()
    {
        const string sql = """
            SELECT TOP 1 MaChinhSach, TenChinhSach, TiLe_ChuaKy, TiLe_TruocHan_NganHan, TiLe_TruocHan_DaiHan, TiLe_DungHan, MocLuuTru
            FROM ChinhSachHoanCoc
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<ChinhSachHoanCoc>(
            sql, null, PhienDuLieu.Session.Transaction);
    }
}
