namespace HomeStay.Application.Tests;

using HomeStay.Application.BusinessLogic;
using Xunit;

public sealed class ThongBaoEntityTests
{
    [Fact]
    public void TaoCanXuLy_DatDungPhamViVaVongDoi()
    {
        var now = new DateTime(2026, 7, 15, 9, 0, 0);

        var thongBao = ThongBao.Tao(
            LoaiSuKienThongBao.PhieuCocChoTinhTien,
            "CanXuLy",
            "Phiếu cọc mới",
            "PC0001 đang chờ tính tiền.",
            "CN01",
            "KeToan",
            null,
            "/accountant/deposit-calc?maPhieuCoc=PC0001",
            "blue",
            "PhieuCocChoTinhTien:PC0001",
            "NV03",
            "PC0001",
            now);

        Assert.Equal("CN01", thongBao.MaCN);
        Assert.Equal("KeToan", thongBao.VaiTroNhan);
        Assert.Equal("DangMo", thongBao.TrangThai);
        Assert.Equal("CanXuLy", thongBao.LoaiThongBao);
        Assert.StartsWith("TB", thongBao.MaTB);
        Assert.True(thongBao.MaTB.Length <= 36);
    }

    [Fact]
    public void TaoThongTin_DatTrangThaiThongTin()
    {
        var thongBao = ThongBao.Tao(
            LoaiSuKienThongBao.HoanCocDaHoanTat,
            "ThongTin",
            "Đã hoàn cọc",
            "Phiếu hoàn đã được lập.",
            "CN01",
            "Sale",
            "NV03",
            null,
            "green",
            "HoanCocDaHoanTat:PDS0001",
            "NV02",
            "PDS0001",
            DateTime.Now);

        Assert.Equal("ThongTin", thongBao.TrangThai);
        Assert.Equal("NV03", thongBao.MaNVNhan);
    }

    [Theory]
    [InlineData("", "CanXuLy", "CN01", "KeToan", "event:key")]
    [InlineData("Event", "SaiLoai", "CN01", "KeToan", "event:key")]
    [InlineData("Event", "CanXuLy", "", "KeToan", "event:key")]
    [InlineData("Event", "CanXuLy", "CN01", "", "event:key")]
    [InlineData("Event", "CanXuLy", "CN01", "KeToan", "")]
    public void Tao_DuLieuPhamViKhongHopLe_Throws(
        string loaiSuKien, string loaiThongBao, string maCN, string vaiTro, string khoa)
    {
        Assert.Throws<ArgumentException>(() => ThongBao.Tao(
            loaiSuKien,
            loaiThongBao,
            "Tiêu đề",
            "Nội dung",
            maCN,
            vaiTro,
            null,
            null,
            "blue",
            khoa,
            null,
            "REF",
            DateTime.Now));
    }
}
