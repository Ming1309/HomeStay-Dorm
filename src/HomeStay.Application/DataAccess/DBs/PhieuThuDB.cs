using System;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

namespace HomeStay.Application.DataAccess.DBs;

public static class PhieuThuDB
{
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
}
