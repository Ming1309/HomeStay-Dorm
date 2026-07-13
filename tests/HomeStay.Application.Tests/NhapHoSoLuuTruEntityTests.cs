using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class NhapHoSoLuuTruEntityTests
{
    [Theory]
    [InlineData(1, "KH0001")]
    [InlineData(16, "KH0016")]
    [InlineData(12345, "KH12345")]
    public void KhachHang_DinhDangMaTheoSoThuTu(long soThuTu, string mongDoi)
    {
        Assert.Equal(mongDoi, KhachHang.DinhDangMa(soThuTu));
    }

    [Fact]
    public void KhachHang_TuChoiSoThuTuKhongHopLe()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => KhachHang.DinhDangMa(0));
    }

    [Fact]
    public void KhachHang_ChiCapNhatDiaChiThuongTru()
    {
        var khachHang = new KhachHang
        {
            MaKH = "KH0001",
            HoTen = "Nguyễn Văn An",
            SoGiayTo = "079200000001",
            Email = "an@example.com",
        };

        khachHang.CapNhatDiaChiThuongTru("  12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM  ");

        Assert.Equal("12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM", khachHang.DiaChiThuongTru);
        Assert.Equal("Nguyễn Văn An", khachHang.HoTen);
        Assert.Equal("079200000001", khachHang.SoGiayTo);
        Assert.Equal("an@example.com", khachHang.Email);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void KhachHang_TuChoiDiaChiRong(string diaChi)
    {
        var khachHang = new KhachHang { MaKH = "KH0001" };

        Assert.Throws<InvalidOperationException>(() => khachHang.CapNhatDiaChiThuongTru(diaChi));
    }

    [Fact]
    public void KhachHang_TuChoiGiayToThanhVienTrungNguoiDaiDien()
    {
        var daiDien = new KhachHang { SoGiayTo = "079200000001" };
        var thanhVien = new KhachHang { SoGiayTo = " 079200000001 " };

        Assert.Throws<InvalidOperationException>(() =>
            KhachHang.KiemTraTrungSoGiayTo(daiDien, [thanhVien]));
    }

    [Fact]
    public void KhachHang_TuChoiGiayToTrungGiuaCacThanhVien()
    {
        var daiDien = new KhachHang { SoGiayTo = "079200000001" };
        var thanhViens = new List<KhachHang>
        {
            new() { SoGiayTo = "P1234567" },
            new() { SoGiayTo = " p1234567 " },
        };

        Assert.Throws<InvalidOperationException>(() =>
            KhachHang.KiemTraTrungSoGiayTo(daiDien, thanhViens));
    }
}
