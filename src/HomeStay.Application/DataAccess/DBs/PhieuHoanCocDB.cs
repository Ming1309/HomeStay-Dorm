using System;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

namespace HomeStay.Application.DataAccess.DBs;

public static class PhieuHoanCocDB
{
    public static async Task InsertPhieuHoanCoc(PhieuHoanCoc phc)
    {
        const string sql = """
            INSERT INTO PhieuHoanCoc (MaPHC, SoTienHoan, PhuongThucHoan, ThongTinNhanTien, ThoiGian, MaPDS, MaNV)
            VALUES (@MaPHC, @SoTienHoan, @PhuongThucHoan, @ThongTinNhanTien, @ThoiGian, @MaPDS, @MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phc, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu phiếu hoàn cọc.");
    }

    public static async Task<PhieuHoanCoc?> GetPhieuHoanCocTheoMaPHC(string maPHC)
    {
        const string sql = """
            SELECT MaPHC, SoTienHoan, PhuongThucHoan, ThongTinNhanTien, ThoiGian, MaPDS, MaNV
            FROM PhieuHoanCoc
            WHERE MaPHC = @MaPHC
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuHoanCoc>(
            sql, new { MaPHC = maPHC }, PhienDuLieu.Session.Transaction);
    }
}
