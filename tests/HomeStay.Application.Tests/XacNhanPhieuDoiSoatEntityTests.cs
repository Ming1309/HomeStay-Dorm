using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class XacNhanPhieuDoiSoatEntityTests
{
    [Theory]
    [InlineData("0909000001", null, true)]
    [InlineData(null, "khach@example.com", true)]
    [InlineData(" ", " ", false)]
    [InlineData(null, null, false)]
    public void KhachHang_XacDinhKenhLienHe(string? soDienThoai, string? email, bool mongDoi)
    {
        var khachHang = new KhachHang { SDT = soDienThoai, Email = email };

        Assert.Equal(mongDoi, khachHang.CoKenhLienHe());
    }

    [Theory]
    [InlineData(1_200_000, 0, "Hoan", 1_200_000)]
    [InlineData(0, 350_000, "ThuThem", 350_000)]
    [InlineData(0, 0, "HoaVon", 0)]
    public void PhieuDoiSoat_XacDinhLoaiVaSoTienKetQua(
        decimal tienHoan,
        decimal tienThuThem,
        string loaiMongDoi,
        decimal soTienMongDoi)
    {
        var pds = new PhieuDoiSoat { TienHoan = tienHoan, TienThuThem = tienThuThem };

        var (loaiKetQua, soTienKetQua) = pds.XacDinhKetQua();

        Assert.Equal(loaiMongDoi, loaiKetQua);
        Assert.Equal(soTienMongDoi, soTienKetQua);
    }
}
