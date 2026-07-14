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
            INSERT INTO PhieuDoiSoat
                (MaPDS, NgayDoiSoat, TyLeHoanCoc, TongKhauTru, TienHoan, TienThuThem,
                 TrangThai, GhiChu, MaHD, MaNV, MaPhieuCoc, MaGiuong,
                 KhachHangDongY, MaNVChot, ThoiDiemChot, GhiChuXacNhan)
            SELECT @MaPDS, @NgayDoiSoat, @TyLeHoanCoc, @TongKhauTru, @TienHoan, @TienThuThem,
                   @TrangThai, @GhiChu, @MaHD, @MaNV, @MaPhieuCoc, @MaGiuong,
                   @KhachHangDongY, @MaNVChot, @ThoiDiemChot, @GhiChuXacNhan
            WHERE @MaHD IS NOT NULL
               OR NOT EXISTS (
                    SELECT 1
                    FROM PhieuDoiSoat WITH (UPDLOCK, HOLDLOCK)
                    WHERE MaPhieuCoc=@MaPhieuCoc AND MaHD IS NULL
               )
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertPdsSql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiếu cọc đã có phiếu đối soát hoặc vừa được xử lý bởi người khác.");

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

    public static async Task<IReadOnlyList<PhieuDoiSoat>> GetDSPhieuDoiSoatCanHoan()
    {
        const string sql = """
            SELECT * FROM PhieuDoiSoat
            WHERE TrangThai = N'DaChot' AND TienHoan > 0
              AND (MaHD IS NULL OR EXISTS (
                  SELECT 1 FROM HopDong hd WHERE hd.MaHD=PhieuDoiSoat.MaHD AND hd.TrangThai=N'DaThanhLy'
              ))
              AND NOT EXISTS (
                  SELECT 1 FROM PhieuHoanCoc phc WHERE phc.MaPDS=PhieuDoiSoat.MaPDS
              )
            ORDER BY NgayDoiSoat DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuDoiSoat>(sql, null, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<IReadOnlyList<PhieuDoiSoat>> GetDanhSachChoXacNhan()
    {
        const string sql = "SELECT * FROM PhieuDoiSoat WHERE TrangThai=N'ChoXacNhan' ORDER BY NgayDoiSoat DESC";
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuDoiSoat>(sql, null, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> XacNhan(PhieuDoiSoat phieu, string trangThaiMoi)
    {
        const string sql = """
            UPDATE PhieuDoiSoat
            SET TrangThai=@TrangThaiMoi, KhachHangDongY=1, MaNVChot=@MaNVChot,
                ThoiDiemChot=@ThoiDiemChot, GhiChuXacNhan=@GhiChuXacNhan
            WHERE MaPDS=@MaPDS AND TrangThai=N'ChoXacNhan'
            """;
        return await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { phieu.MaPDS, TrangThaiMoi = trangThaiMoi, phieu.MaNVChot, phieu.ThoiDiemChot, phieu.GhiChuXacNhan },
            PhienDuLieu.Session.Transaction) == 1;
    }

    public static async Task<PhieuDoiSoat?> GetPhieuDoiSoatTheoMaPDS(string maPDS)
    {
        const string sql = "SELECT * FROM PhieuDoiSoat WHERE MaPDS = @MaPDS";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuDoiSoat>(sql, new { MaPDS = maPDS }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<PhieuDoiSoat?> GetPhieuDoiSoatChoCapNhat(string maPDS)
    {
        const string sql = "SELECT * FROM PhieuDoiSoat WITH (UPDLOCK, HOLDLOCK) WHERE MaPDS=@MaPDS";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuDoiSoat>(
            sql, new { MaPDS = maPDS }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<bool> TonTaiChoPhieuCocChuaKy(string maPhieuCoc)
    {
        const string sql = """
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM PhieuDoiSoat
                WHERE MaPhieuCoc=@MaPhieuCoc AND MaHD IS NULL
            ) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleAsync<bool>(
            sql, new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<PhieuDoiSoat?> GetPhieuDoiSoatTheoMaHD(string maHD)
    {
        const string sql = """
            SELECT TOP 1 *
            FROM PhieuDoiSoat
            WHERE MaHD = @MaHD
            ORDER BY NgayDoiSoat DESC, MaPDS DESC
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuDoiSoat>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<bool> UpdateTrangThai(string maPDS, string trangThaiHienTai, string trangThaiMoi)
    {
        const string sql = "UPDATE PhieuDoiSoat SET TrangThai = @TrangThaiMoi WHERE MaPDS = @MaPDS AND TrangThai = @TrangThaiHienTai";
        var affected = await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, new { MaPDS = maPDS, TrangThaiHienTai = trangThaiHienTai, TrangThaiMoi = trangThaiMoi },
            PhienDuLieu.Session.Transaction);
        return affected == 1;
    }
}
