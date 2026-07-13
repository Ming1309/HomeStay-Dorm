using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

namespace HomeStay.Application.DataAccess.DBs;

public static class PhieuDoiSoatDB
{
    public static async Task LuuPhieu(PhieuDoiSoat phieu)
    {
        const string insertPdsSql = """
            INSERT INTO PhieuDoiSoat (MaPDS, NgayDoiSoat, TyLeHoanCoc, TongKhauTru, TienHoan, TienThuThem, TrangThai, GhiChu, MaHD, MaNV, MaPhieuCoc, MaGiuong)
            VALUES (@MaPDS, @NgayDoiSoat, @TyLeHoanCoc, @TongKhauTru, @TienHoan, @TienThuThem, @TrangThai, @GhiChu, @MaHD, @MaNV, @MaPhieuCoc, @MaGiuong)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertPdsSql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo phiếu đối soát.");

        const string insertDetailSql = """
            INSERT INTO ChiTietDoiSoat (MaPDS, MaHoaDon)
            VALUES (@MaPDS, @MaHoaDon)
            """;
        foreach (var hd in phieu.HoaDons)
        {
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertDetailSql, new { phieu.MaPDS, hd.MaHoaDon }, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("Không thể lưu chi tiết hóa đơn đối soát.");
        }
    }

    public static async Task<IReadOnlyList<PhieuDoiSoat>> GetDSPhieuDoiSoatDaChot()
    {
        const string sql = """
            SELECT * FROM PhieuDoiSoat
            WHERE TrangThai = N'DaChot' AND TienThuThem > 0
            ORDER BY NgayDoiSoat DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuDoiSoat>(sql, null, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<PhieuDoiSoat?> GetPhieuDoiSoatTheoMaPDS(string maPDS)
    {
        const string sql = "SELECT * FROM PhieuDoiSoat WHERE MaPDS = @MaPDS";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuDoiSoat>(sql, new { MaPDS = maPDS }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<bool> UpdateTrangThai(string maPDS, string trangThai)
    {
        const string sql = "UPDATE PhieuDoiSoat SET TrangThai = @TrangThai WHERE MaPDS = @MaPDS";
        var affected = await PhienDuLieu.Session.Connection.ExecuteAsync(sql, new { MaPDS = maPDS, TrangThai = trangThai }, PhienDuLieu.Session.Transaction);
        return affected == 1;
    }
}
