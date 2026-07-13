namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhieuThuDB
{
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
