namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class LoaiPhongDB
{
    public static async Task<IReadOnlyList<LoaiPhong>> LayDanhSach()
    {
        const string sql = "SELECT MaLP, TenLoaiPhong, SucChua, GiaThue FROM LoaiPhong";
        var result = await PhienDuLieu.Session.Connection.QueryAsync<LoaiPhong>(
            sql, transaction: PhienDuLieu.Session.Transaction);
        return result.ToList();
    }
}
