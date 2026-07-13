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
}
