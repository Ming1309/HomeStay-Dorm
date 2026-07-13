namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.DataAccess.DbConnections;

public static class GiuongDB
{
    public static async Task<bool> UpdateTrangThai(string maGiuong, string trangThai)
    {
        const string sql = "UPDATE Giuong SET TrangThai=@TrangThai WHERE MaGiuong=@MaGiuong";
        return await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaGiuong = maGiuong, TrangThai = trangThai },
            PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task UpdateTrangThaiBatch(IReadOnlyList<string> dsMaGiuong, string trangThai)
    {
        const string sql = "UPDATE Giuong SET TrangThai=@TrangThai WHERE MaGiuong=@MaGiuong";
        foreach (var maGiuong in dsMaGiuong)
        {
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
                    new { MaGiuong = maGiuong, TrangThai = trangThai },
                    PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException($"Giường {maGiuong} không thể cập nhật trạng thái.");
        }
    }
}
