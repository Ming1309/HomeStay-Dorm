namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class KhachHangDB
{
    public static async Task<KhachHang?> TimTheoSoGiayTo(string soGiayTo)
    {
        const string sql = "SELECT * FROM KhachHang WHERE SoGiayTo=@SoGiayTo";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<KhachHang>(
            sql, new { SoGiayTo = soGiayTo.Trim() }, PhienDuLieu.Session.Transaction);
    }

    public static async Task Them(KhachHang khachHang)
    {
        const string sql = """
            INSERT INTO KhachHang (MaKH,HoTen,NgaySinh,GioiTinh,QuocTich,LoaiGiayTo,SoGiayTo,DiaChiThuongTru,SDT,Email)
            VALUES (@MaKH,@HoTen,@NgaySinh,@GioiTinh,@QuocTich,@LoaiGiayTo,@SoGiayTo,@DiaChiThuongTru,@SDT,@Email)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, khachHang, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể thêm khách hàng mới.");
    }

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
