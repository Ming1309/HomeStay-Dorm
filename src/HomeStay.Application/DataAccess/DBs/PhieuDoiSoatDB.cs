namespace HomeStay.Application.DataAccess.DBs;

using System;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

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
}
