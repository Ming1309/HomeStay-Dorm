namespace HomeStay.Application.DataAccess.DBs;

using System;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhieuThuDB
{
    // ==========================================================
    // Methods from feat/thanh-toan-tra-phong branch
    // ==========================================================
    public static async Task InsertPhieuThu(PhieuThu phieuThu)
    {
        const string sql = """
            INSERT INTO PhieuThu (MaPT, SoTienThu, ThoiGian, PhuongThucThanhToan, AnhMinhChung, MaHoaDon, MaPhieuCoc, MaPDS, MaNV)
            VALUES (@MaPT, @SoTienThu, @ThoiGian, @PhuongThucThanhToan, @AnhMinhChung, @MaHoaDon, @MaPhieuCoc, @MaPDS, @MaNV)
            """;
        var affected = await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieuThu, PhienDuLieu.Session.Transaction);
        if (affected != 1)
            throw new InvalidOperationException("Không thể lưu phiếu thu.");
    }

    public static async Task<bool> TonTaiTheoMaPhieuDoiSoat(string maPDS)
    {
        const string sql = "SELECT CASE WHEN EXISTS (SELECT 1 FROM PhieuThu WHERE MaPDS = @MaPDS) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END";
        return await PhienDuLieu.Session.Connection.QuerySingleAsync<bool>(
            sql, new { MaPDS = maPDS }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<PhieuThu?> LayTheoPhieuCoc(string maPhieuCoc)
    {
        const string sql = """
            SELECT MaPT, SoTienThu, ThoiGian, PhuongThucThanhToan, AnhMinhChung,
                   MaHoaDon, MaPhieuCoc, MaPDS, MaNV
            FROM PhieuThu
            WHERE MaPhieuCoc=@MaPhieuCoc
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuThu>(
            sql, new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
    }

    // ==========================================================
    // Methods from develop branch
    // ==========================================================
    public static async Task Them(PhieuThu phieuThu)
    {
        const string sql = """
            INSERT INTO PhieuThu
                (MaPT,SoTienThu,ThoiGian,PhuongThucThanhToan,AnhMinhChung,MaHoaDon,MaPhieuCoc,MaPDS,MaNV)
            VALUES
                (@MaPT,@SoTienThu,@ThoiGian,@PhuongThucThanhToan,@AnhMinhChung,@MaHoaDon,@MaPhieuCoc,@MaPDS,@MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieuThu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo phiếu thu tiền cọc.");
    }
}
