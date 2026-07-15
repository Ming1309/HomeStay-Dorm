namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChiNhanhDB
{
    public static async Task<IReadOnlyList<ChiNhanh>> LayDanhSach()
    {
        const string sql = "SELECT MaCN, TenChiNhanh, DiaChi, SDT FROM ChiNhanh";
        var result = await PhienDuLieu.Session.Connection.QueryAsync<ChiNhanh>(
            sql, transaction: PhienDuLieu.Session.Transaction);
        return result.ToList();
    }

    public static async Task<bool> TonTai(string maCN)
    {
        const string sql = "SELECT COUNT(1) FROM ChiNhanh WHERE MaCN=@MaCN";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaCN = maCN }, PhienDuLieu.Session.Transaction) > 0;
    }
}
