namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class NhanVienDB
{
    public static async Task Them(NhanVien nhanVien)
    {
        const string sql = "INSERT INTO NhanVien (MaNV,HoTen,SDT,VaiTro,MaCN) VALUES (@MaNV,@HoTen,@SDT,@VaiTro,@MaCN)";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, nhanVien, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo nhân viên.");
    }

    public static async Task CapNhat(NhanVien nhanVien)
    {
        const string sql = "UPDATE NhanVien SET HoTen=@HoTen,SDT=@SDT,VaiTro=@VaiTro,MaCN=@MaCN WHERE MaNV=@MaNV";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, nhanVien, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật nhân viên.");
    }
}
