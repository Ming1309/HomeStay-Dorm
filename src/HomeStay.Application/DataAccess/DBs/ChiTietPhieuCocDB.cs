namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChiTietPhieuCocDB
{
    public static async Task<int> DemSoGiuongDaCoc(string maPhieuCoc)
    {
        const string sql = "SELECT COUNT(*) FROM ChiTietPhieuCoc WHERE MaPhieuCoc=@MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
    }
}
