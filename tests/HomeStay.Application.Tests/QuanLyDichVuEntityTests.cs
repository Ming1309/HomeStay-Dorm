using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class QuanLyDichVuEntityTests
{
    [Fact]
    public void ChuanHoa_LoaiBoKhoangTrangThua()
    {
        var dichVu = TaoDichVu();
        dichVu.TenDV = "  Tiền điện  ";
        dichVu.DonViTinh = "  kWh ";

        dichVu.ChuanHoa();

        Assert.Equal("Tiền điện", dichVu.TenDV);
        Assert.Equal("kWh", dichVu.DonViTinh);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void KiemTraDuLieuHopLe_TuChoiTenRong(string ten)
    {
        var dichVu = TaoDichVu();
        dichVu.TenDV = ten;
        dichVu.ChuanHoa();

        Assert.Throws<ArgumentException>(() => dichVu.KiemTraDuLieuHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiDonViTinhRong()
    {
        var dichVu = TaoDichVu();
        dichVu.DonViTinh = string.Empty;

        Assert.Throws<ArgumentException>(() => dichVu.KiemTraDuLieuHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiDonGiaAm()
    {
        var dichVu = TaoDichVu();
        dichVu.DonGia = -1;

        Assert.Throws<ArgumentException>(() => dichVu.KiemTraDuLieuHopLe());
    }

    [Theory]
    [InlineData("DangApDung")]
    [InlineData("NgungApDung")]
    public void KiemTraDuLieuHopLe_ChapNhanTrangThaiHopLe(string trangThai)
    {
        var dichVu = TaoDichVu();
        dichVu.TrangThai = trangThai;

        dichVu.KiemTraDuLieuHopLe();
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiTrangThaiKhongHopLe()
    {
        var dichVu = TaoDichVu();
        dichVu.TrangThai = "KhongHopLe";

        Assert.Throws<ArgumentException>(() => dichVu.KiemTraDuLieuHopLe());
    }

    private static DichVu TaoDichVu() => new()
    {
        TenDV = "Tiền điện",
        DonViTinh = "kWh",
        DonGia = 3500,
        TrangThai = "DangApDung",
    };
}
