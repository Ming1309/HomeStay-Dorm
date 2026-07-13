namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChiTietPhieuCocDB
{
    public static async Task<IReadOnlyList<ChiTietPhieuCoc>> GetByMaPhieuCoc(string maPhieuCoc)
    {
        const string sql = "SELECT MaPhieuCoc, MaGiuong FROM ChiTietPhieuCoc WHERE MaPhieuCoc = @MaPhieuCoc";
        return (await PhienDuLieu.Session.Connection.QueryAsync<ChiTietPhieuCoc>(sql,
            new { MaPhieuCoc = maPhieuCoc },
            PhienDuLieu.Session.Transaction)).ToList();
    }

    public static async Task<int> CountByMaPhieuCoc(string maPhieuCoc)
    {
        const string sql = "SELECT COUNT(*) FROM ChiTietPhieuCoc WHERE MaPhieuCoc = @MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { MaPhieuCoc = maPhieuCoc },
            PhienDuLieu.Session.Transaction);
    }
}
