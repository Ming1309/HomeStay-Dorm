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

    public static async Task<NhanVien?> DocChiTiet(string maNV)
    {
        const string sql = """
            SELECT nv.MaNV, nv.HoTen, nv.SDT, nv.VaiTro, nv.MaCN, cn.TenChiNhanh
            FROM NhanVien nv
            LEFT JOIN ChiNhanh cn ON cn.MaCN = nv.MaCN
            WHERE nv.MaNV = @MaNV
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<NhanVien>(
            sql, new { MaNV = maNV }, PhienDuLieu.Session.Transaction);
    }

    public static Task<NhanVien?> GetNhanVienTheoMaNV(string maNV) => DocChiTiet(maNV);
}
