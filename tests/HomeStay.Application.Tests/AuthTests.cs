using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class AuthTests
{
    [Fact]
    public void MatKhauHasher_TaoHashVaKiemTraDuocMatKhau()
    {
        var hasher = new MatKhauHasher();
        var hash = hasher.TaoHash("MatKhau@123");

        Assert.True(hasher.KiemTra("MatKhau@123", hash));
        Assert.False(hasher.KiemTra("sai-mat-khau", hash));
    }

    [Fact]
    public void TaiKhoan_KhongHoatDongKhongDuocDangNhap()
    {
        var taiKhoan = new TaiKhoan { TrangThai = "Khoa" };

        Assert.False(taiKhoan.DangHoatDong());
    }

    [Fact]
    public void TaiKhoan_DoiMatKhauCapNhatHash()
    {
        var taiKhoan = new TaiKhoan();

        taiKhoan.DoiMatKhau("hash-moi");

        Assert.Equal("hash-moi", taiKhoan.MatKhauHash);
    }

    [Fact]
    public void TaiKhoan_MoiTaiKhoanChiCoMotVaiTroTuNhanVien()
    {
        var taiKhoan = new TaiKhoan { NhanVien = new NhanVien { VaiTro = "QuanTri" } };

        Assert.True(taiKhoan.LaQuanTri());
    }
}
