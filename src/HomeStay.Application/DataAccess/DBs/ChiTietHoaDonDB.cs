namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChiTietHoaDonDB
{
    public static async Task InsertChiTietHoaDon(ChiTietHoaDon chiTiet)
    {
        const string sql = """
            INSERT INTO ChiTietHoaDon
                (MaHoaDon, STT, LoaiKhoanThu, MaDV, MaTS, MaGiuong, SoLuong, DonViTinh, DonGia)
            VALUES
                (@MaHoaDon, @STT, @LoaiKhoanThu, @MaDV, @MaTS, @MaGiuong, @SoLuong, @DonViTinh, @DonGia)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, chiTiet, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu chi tiết hóa đơn bồi thường.");
    }
}
