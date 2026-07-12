namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class KhachHangDB
{
    public static async Task CapNhat(KhachHang khachHang)
    {
        const string sql = """
            UPDATE KhachHang SET HoTen=@HoTen, NgaySinh=@NgaySinh, GioiTinh=@GioiTinh,
                QuocTich=@QuocTich, LoaiGiayTo=@LoaiGiayTo, SoGiayTo=@SoGiayTo,
                SDT=@SDT, Email=@Email
            WHERE MaKH=@MaKH
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, khachHang, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật khách hàng của lịch hẹn.");
    }
}
