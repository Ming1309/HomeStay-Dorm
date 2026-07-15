namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class TaiKhoanDB
{
    private const string Select = """
        SELECT tk.MaTK,tk.TenDangNhap,tk.MatKhauHash,tk.TrangThai,
               tk.LanDangNhapCuoi,tk.Email,tk.MaNV,
               nv.MaNV AS NhanVienMaNV,nv.HoTen,nv.SDT,nv.VaiTro,nv.MaCN,cn.TenChiNhanh
        FROM TaiKhoan tk INNER JOIN NhanVien nv ON tk.MaNV=nv.MaNV
        LEFT JOIN ChiNhanh cn ON nv.MaCN=cn.MaCN
        """;

    public static async Task<TaiKhoan?> DocTheoTenDangNhap(string tenDangNhap)
    {
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<TaiKhoan, NhanVien, TaiKhoan>(
            $"{Select} WHERE LOWER(tk.TenDangNhap)=LOWER(@TenDangNhap)",
            (taiKhoan, nhanVien) => { nhanVien.MaNV = taiKhoan.MaNV; taiKhoan.NhanVien = nhanVien; return taiKhoan; },
            new { TenDangNhap = tenDangNhap }, PhienDuLieu.Session.Transaction, splitOn: "NhanVienMaNV");
        return rows.SingleOrDefault();
    }

    public static async Task<TaiKhoan?> Doc(string maTK)
    {
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<TaiKhoan, NhanVien, TaiKhoan>(
            $"{Select} WHERE tk.MaTK=@MaTK",
            (taiKhoan, nhanVien) => { nhanVien.MaNV = taiKhoan.MaNV; taiKhoan.NhanVien = nhanVien; return taiKhoan; },
            new { MaTK = maTK }, PhienDuLieu.Session.Transaction, splitOn: "NhanVienMaNV");
        return rows.SingleOrDefault();
    }

    public static async Task<IReadOnlyList<TaiKhoan>> LayDanhSach()
    {
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<TaiKhoan, NhanVien, TaiKhoan>(
            $"{Select} ORDER BY nv.HoTen",
            (taiKhoan, nhanVien) => { nhanVien.MaNV = taiKhoan.MaNV; taiKhoan.NhanVien = nhanVien; return taiKhoan; },
            transaction: PhienDuLieu.Session.Transaction, splitOn: "NhanVienMaNV");
        return rows.ToList();
    }

    public static async Task Them(TaiKhoan taiKhoan)
    {
        const string sql = "INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,MaNV) VALUES (@MaTK,@TenDangNhap,@MatKhauHash,@TrangThai,@Email,@MaNV)";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, taiKhoan, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo tài khoản.");
    }

    public static async Task CapNhat(TaiKhoan taiKhoan)
    {
        const string sql = "UPDATE TaiKhoan SET TenDangNhap=@TenDangNhap,Email=@Email WHERE MaTK=@MaTK";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, taiKhoan, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật tài khoản.");
    }

    public static async Task CapNhatTrangThai(string maTK, string trangThai)
    {
        const string sql = "UPDATE TaiKhoan SET TrangThai=@TrangThai WHERE MaTK=@MaTK";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, new { MaTK = maTK, TrangThai = trangThai }, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật trạng thái tài khoản.");
    }

    public static async Task DatMatKhau(TaiKhoan taiKhoan)
    {
        const string sql = "UPDATE TaiKhoan SET MatKhauHash=@MatKhauHash WHERE MaTK=@MaTK";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, taiKhoan, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể đặt lại mật khẩu.");
    }

    public static async Task CapNhatLanDangNhap(TaiKhoan taiKhoan)
    {
        const string sql = "UPDATE TaiKhoan SET LanDangNhapCuoi=GETDATE() WHERE MaTK=@MaTK";
        await PhienDuLieu.Session.Connection.ExecuteAsync(sql, taiKhoan, PhienDuLieu.Session.Transaction);
    }
}
