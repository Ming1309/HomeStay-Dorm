namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class QuanLyNguoiDung(Func<PhienDuLieu> taoPhien, MatKhauHasher hasher)
{
    public async Task<IReadOnlyList<TaiKhoan>> LayDanhSach()
    {
        using var phien = taoPhien();
        return await TaiKhoan.LayDanhSach();
    }

    public async Task<TaiKhoan> Tao(TaiKhoan taiKhoan, NhanVien nhanVien, string matKhauTam)
    {
        if (matKhauTam.Length < 8) throw new ArgumentException("Mật khẩu tạm phải có ít nhất 8 ký tự.");
        using var phien = taoPhien();
        nhanVien.MaNV = nhanVien.MaNV.Trim();
        await nhanVien.Them();
        taiKhoan.MaNV = nhanVien.MaNV;
        taiKhoan.MatKhauHash = hasher.TaoHash(matKhauTam);
        taiKhoan.TrangThai = "HoatDong";
        await taiKhoan.Them();
        taiKhoan.NhanVien = nhanVien;
        return taiKhoan;
    }

    public async Task CapNhat(TaiKhoan taiKhoan, NhanVien nhanVien)
    {
        using var phien = taoPhien();
        await nhanVien.CapNhat();
        await taiKhoan.CapNhat();
    }

    public async Task DoiTrangThai(string maTK, string trangThai, string maTKThucHien)
    {
        using var phien = taoPhien();
        var taiKhoan = await TaiKhoan.Doc(maTK) ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");
        if (maTK == maTKThucHien) throw new InvalidOperationException("Không thể tự khóa hoặc vô hiệu hóa tài khoản của chính mình.");
        if (taiKhoan.LaQuanTri() && trangThai != "HoatDong") await KiemTraConQuanTriHoatDong(maTK);
        taiKhoan.TrangThai = trangThai;
        await taiKhoan.CapNhatTrangThai();
    }

    public async Task DatLaiMatKhau(string maTK, string matKhauTam)
    {
        if (matKhauTam.Length < 8) throw new ArgumentException("Mật khẩu tạm phải có ít nhất 8 ký tự.");
        using var phien = taoPhien();
        var taiKhoan = await TaiKhoan.Doc(maTK) ?? throw new KeyNotFoundException("Không tìm thấy tài khoản.");
        taiKhoan.DoiMatKhau(hasher.TaoHash(matKhauTam));
        await taiKhoan.DatMatKhau();
    }

    private static async Task KiemTraConQuanTriHoatDong(string maTK)
    {
        var quanTri = await TaiKhoan.LayDanhSach();
        if (quanTri.Count(x => x.LaQuanTri() && x.DangHoatDong() && x.MaTK != maTK) == 0)
            throw new InvalidOperationException("Không thể vô hiệu hóa quản trị viên hoạt động cuối cùng.");
    }
}
