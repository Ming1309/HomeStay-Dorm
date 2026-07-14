using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class QuanLyTaiSanEntityTests
{
    [Fact]
    public void ChuanHoa_ChuanHoaChuoiVaMoTaRongThanhNull()
    {
        var taiSan = TaoTaiSan();
        taiSan.TenTaiSan = "  Máy lạnh  ";
        taiSan.MoTa = "   ";

        taiSan.ChuanHoa();

        Assert.Equal("Máy lạnh", taiSan.TenTaiSan);
        Assert.Null(taiSan.MoTa);
    }

    [Theory]
    [InlineData("NoiThat")]
    [InlineData("ThietBiDien")]
    [InlineData("TienIchBanGiao")]
    public void KiemTraDuLieuHopLe_ChapNhanPhanLoaiHopLe(string loaiTaiSan)
    {
        var taiSan = TaoTaiSan();
        taiSan.LoaiTaiSan = loaiTaiSan;

        taiSan.KiemTraDuLieuHopLe();
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiPhanLoaiKhongHopLe()
    {
        var taiSan = TaoTaiSan();
        taiSan.LoaiTaiSan = "Khac";

        Assert.Throws<ArgumentException>(() => taiSan.KiemTraDuLieuHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiGiaTriAm()
    {
        var taiSan = TaoTaiSan();
        taiSan.GiaTri = -1;

        Assert.Throws<ArgumentException>(() => taiSan.KiemTraDuLieuHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiMoTaQuaDai()
    {
        var taiSan = TaoTaiSan();
        taiSan.MoTa = new string('a', 501);

        Assert.Throws<ArgumentException>(() => taiSan.KiemTraDuLieuHopLe());
    }

    [Theory]
    [InlineData("DangApDung")]
    [InlineData("NgungApDung")]
    public void KiemTraDuLieuHopLe_ChapNhanTrangThaiHopLe(string trangThai)
    {
        var taiSan = TaoTaiSan();
        taiSan.TrangThai = trangThai;

        taiSan.KiemTraDuLieuHopLe();
    }

    private static TaiSan TaoTaiSan() => new()
    {
        TenTaiSan = "Máy lạnh",
        LoaiTaiSan = "ThietBiDien",
        GiaTri = 8_000_000,
        MoTa = "Máy lạnh inverter",
        TrangThai = "DangApDung",
    };
}
