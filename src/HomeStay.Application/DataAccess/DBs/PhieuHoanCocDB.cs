using System;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

namespace HomeStay.Application.DataAccess.DBs;

public static class PhieuHoanCocDB
{
    public static async Task<bool> ThamChieuChungTu(string tenTep)
    {
        const string sql = "SELECT COUNT(1) FROM PhieuHoanCoc WHERE MinhChung=@TenTep OR MinhChung LIKE '%/' + @TenTep";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { TenTep = tenTep }, PhienDuLieu.Session.Transaction) > 0;
    }
    public static async Task InsertPhieuHoanCoc(PhieuHoanCoc phc)
    {
        phc.MaPHC = await MaSoDB.LayMaMoi("PhieuHoanCoc");
        const string sql = """
            INSERT INTO PhieuHoanCoc (MaPHC, SoTienHoan, PhuongThucHoan, ThongTinNhanTien,
                                     MaGiaoDich, MinhChung, ThoiGian, MaPDS, MaNV)
            VALUES (@MaPHC, @SoTienHoan, @PhuongThucHoan, @ThongTinNhanTien,
                    @MaGiaoDich, @MinhChung, @ThoiGian, @MaPDS, @MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phc, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu phiếu hoàn cọc.");
    }

    public static async Task<bool> TonTaiTheoMaPhieuDoiSoat(string maPDS)
    {
        const string sql = "SELECT CASE WHEN EXISTS (SELECT 1 FROM PhieuHoanCoc WHERE MaPDS = @MaPDS) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END";
        return await PhienDuLieu.Session.Connection.QuerySingleAsync<bool>(
            sql, new { MaPDS = maPDS }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<PhieuHoanCoc?> GetPhieuHoanCocTheoMaPHC(string maPHC)
    {
        const string sql = """
            SELECT MaPHC, SoTienHoan, PhuongThucHoan, ThongTinNhanTien, MaGiaoDich, MinhChung,
                   ThoiGian, MaPDS, MaNV
            FROM PhieuHoanCoc
            WHERE MaPHC = @MaPHC
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuHoanCoc>(
            sql, new { MaPHC = maPHC }, PhienDuLieu.Session.Transaction);
    }
}
