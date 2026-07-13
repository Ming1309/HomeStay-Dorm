namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class BienBanGiaoNhanDB
{
    public static async Task Them(BienBanGiaoNhan bienBan)
    {
        const string sql = """
            INSERT INTO BienBanGiaoNhan (MaBienBan, NgayBanGiao, LoaiBienBan, MaHD, MaNV)
            VALUES (@MaBienBan, @NgayBanGiao, @LoaiBienBan, @MaHD, @MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, bienBan, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu biên bản thu hồi.");
    }

    public static async Task<bool> TonTaiThuHoiTheoHD(string maHD)
    {
        const string sql = """
            SELECT COUNT(1)
            FROM BienBanGiaoNhan
            WHERE MaHD = @MaHD AND LoaiBienBan = N'ThuHoi'
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction) > 0;
    }
}
