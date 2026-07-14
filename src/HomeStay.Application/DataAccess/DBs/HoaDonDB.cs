namespace HomeStay.Application.DataAccess.DBs;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class HoaDonDB
{
    public static async Task<IReadOnlyList<HoaDon>> LayDanhSachChuaThanhToanTheoHD(string maHD)
    {
        const string sql = """
            SELECT MaHoaDon, NgayLap, HanThanhToan, LoaiHoaDon, TongTien, TrangThai, GhiChu, MaHD, MaNV
            FROM HoaDon
            WHERE MaHD = @MaHD AND TrangThai IN (N'ChuaThanhToan', N'ThanhToanMotPhan')
            ORDER BY NgayLap
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HoaDon>(sql,
            new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<IReadOnlyList<HoaDon>> GetDSHoaDonTheoMaPDS(string maPDS)
    {
        const string sql = """
            SELECT hd.MaHoaDon, hd.NgayLap, hd.HanThanhToan, hd.LoaiHoaDon, hd.TongTien, hd.TrangThai, hd.GhiChu, hd.MaHD, hd.MaNV
            FROM HoaDon hd
            INNER JOIN ChiTietDoiSoat ctds ON hd.MaHoaDon = ctds.MaHoaDon
            WHERE ctds.MaPDS = @MaPDS
            ORDER BY hd.NgayLap
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HoaDon>(sql,
            new { MaPDS = maPDS }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<decimal> TinhTongKhauTru(string maPDS)
    {
        const string sql = """
            SELECT COALESCE(SUM(hd.TongTien), 0)
            FROM HoaDon hd
            INNER JOIN ChiTietDoiSoat ctds ON hd.MaHoaDon = ctds.MaHoaDon
            WHERE ctds.MaPDS = @MaPDS
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleAsync<decimal>(sql,
            new { MaPDS = maPDS }, PhienDuLieu.Session.Transaction);
    }

    public static Task<IReadOnlyList<HoaDon>> GetDSHoaDonCanThuTheoPDS(string maPDS) =>
        GetDSHoaDonTheoMaPDS(maPDS);

    public static Task<decimal> TinhTongCanThu(string maPDS) =>
        TinhTongKhauTru(maPDS);

    public static async Task<string> InsertHoaDon(HoaDon hoaDon)
    {
        const string sql = """
            INSERT INTO HoaDon
                (MaHoaDon, NgayLap, HanThanhToan, LoaiHoaDon, TongTien, TrangThai, GhiChu, MaHD, MaNV)
            VALUES
                (@MaHoaDon, @NgayLap, @HanThanhToan, @LoaiHoaDon, @TongTien, @TrangThai, @GhiChu, @MaHD, @MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, hoaDon, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu hóa đơn bồi thường.");
        return hoaDon.MaHoaDon;
    }

    // ==========================================================
    // Methods from feat/xu-li-thanh-toan branch
    // ==========================================================
    public static async Task<bool> ExistsHoaDonKyDau(string maHD)
    {
        const string sql = """
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM HoaDon WHERE MaHD = @MaHD AND LoaiHoaDon = N'KyDau'
            ) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleAsync<bool>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<string> Insert(HoaDon hoaDon)
    {
        const string sql = """
            INSERT INTO HoaDon
                (MaHoaDon, NgayLap, HanThanhToan, LoaiHoaDon, TongTien, TrangThai, GhiChu, MaHD, MaNV)
            VALUES
                (@MaHoaDon, @NgayLap, @HanThanhToan, @LoaiHoaDon, @TongTien, @TrangThai, @GhiChu, @MaHD, @MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, hoaDon, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu hóa đơn.");
        return hoaDon.MaHoaDon;
    }

    public static async Task UpdateTrangThai(string maHoaDon, string trangThai)
    {
        const string sql = """
            UPDATE HoaDon
            SET TrangThai = @TrangThai
            WHERE MaHoaDon = @MaHoaDon
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, new { MaHoaDon = maHoaDon, TrangThai = trangThai }, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật trạng thái hóa đơn.");
    }
}
