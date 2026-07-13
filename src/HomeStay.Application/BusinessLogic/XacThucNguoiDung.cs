namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class XacThucNguoiDung(Func<PhienDuLieu> taoPhien, MatKhauHasher hasher)
{
    public async Task<TaiKhoan> DangNhap(string tenDangNhap, string matKhau)
    {
        using var phien = taoPhien();
        var taiKhoan = await TaiKhoan.DocTheoTenDangNhap(tenDangNhap.Trim());
        if (taiKhoan is null || !taiKhoan.DangHoatDong() || !taiKhoan.KiemTraMatKhau(matKhau, hasher))
            throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không chính xác.");
        await taiKhoan.CapNhatLanDangNhap();
        return taiKhoan;
    }

    public async Task<TaiKhoan?> LayTaiKhoanHienTai(string maTK)
    {
        using var phien = taoPhien();
        return await TaiKhoan.Doc(maTK);
    }
}
