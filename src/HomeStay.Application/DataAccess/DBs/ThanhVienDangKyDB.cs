namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ThanhVienDangKyDB
{
    public static async Task<List<ThanhVienDangKy>> LayTheoMaPhieuCoc(string maPhieuCoc)
    {
        const string sql = "SELECT * FROM ThanhVienDangKy WHERE MaPhieuCoc=@MaPhieuCoc";
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<ThanhVienDangKy>(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task XoaTheoPhieuCoc(string maPhieuCoc)
    {
        const string sql = "DELETE FROM ThanhVienDangKy WHERE MaPhieuCoc=@MaPhieuCoc";
        await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
    }

    public static async Task ThemHangLoat(List<ThanhVienDangKy> danhSach)
    {
        const string sql = """
            INSERT INTO ThanhVienDangKy (MaPhieuCoc,MaKH,VaiTro,TrangThaiDuyet)
            VALUES (@MaPhieuCoc,@MaKH,@VaiTro,@TrangThaiDuyet)
            """;
        foreach (var tv in danhSach)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, tv, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("Không thể lưu thành viên đăng ký.");
    }
}
