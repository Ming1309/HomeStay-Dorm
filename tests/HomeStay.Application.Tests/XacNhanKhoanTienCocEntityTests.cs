using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class XacNhanKhoanTienCocEntityTests
{
    [Fact]
    public void PhieuCoc_XacNhanHopLe_ChuyenSangDaThanhToan()
    {
        var phieu = TaoPhieuChoDoiChieu();

        phieu.XacNhanThanhToan();

        Assert.Equal("DaThanhToan", phieu.TrangThai);
        Assert.Null(phieu.LyDoYeuCauBoSung);
    }

    [Fact]
    public void PhieuCoc_TuChoiXacNhanKhiThieuChungTu()
    {
        var phieu = TaoPhieuChoDoiChieu();
        phieu.AnhMinhChung = null;

        Assert.Throws<InvalidOperationException>(phieu.XacNhanThanhToan);
    }

    [Fact]
    public void PhieuCoc_YeuCauBoSung_QuayVeChoThanhToanVaLuuLyDo()
    {
        var phieu = TaoPhieuChoDoiChieu();

        var now = new DateTime(2026, 7, 13, 10, 0, 0);
        phieu.YeuCauBoSung(
            "  Số tiền trên chứng từ không khớp.  ", now, TimeSpan.FromHours(24));

        Assert.Equal("ChoThanhToan", phieu.TrangThai);
        Assert.Equal("Số tiền trên chứng từ không khớp.", phieu.LyDoYeuCauBoSung);
        Assert.Equal(now.AddHours(24), phieu.HanThanhToan);
        Assert.NotNull(phieu.AnhMinhChung);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void PhieuCoc_TuChoiYeuCauBoSungKhiLyDoRong(string lyDo)
    {
        Assert.Throws<ArgumentException>(() => TaoPhieuChoDoiChieu().YeuCauBoSung(
            lyDo, new DateTime(2026, 7, 13), TimeSpan.FromHours(24)));
    }

    [Fact]
    public void PhieuCoc_GuiLaiChungTu_XoaLyDoBoSung()
    {
        var phieu = TaoPhieuChoDoiChieu();
        var now = new DateTime(2026, 7, 13, 10, 0, 0);
        phieu.YeuCauBoSung("Ảnh bị mờ.", now, TimeSpan.FromMinutes(1));

        phieu.GhiNhanThanhToan(
            "TienMat", "/api/deposits/chung-tu/new-proof.png", now.AddSeconds(30));

        Assert.Equal("ChoDoiChieu", phieu.TrangThai);
        Assert.Null(phieu.LyDoYeuCauBoSung);
        Assert.Equal("TienMat", phieu.PhuongThucThanhToan);
    }

    [Fact]
    public void PhieuThu_SaoChepDungThongTinCocVaNguoiXacNhan()
    {
        var phieu = TaoPhieuChoDoiChieu();
        var now = new DateTime(2026, 7, 13, 10, 30, 0, 123);

        var phieuThu = PhieuThu.TaoChoTienCoc(phieu, "NV_QUAN_LY", now);

        Assert.Empty(phieuThu.MaPT); // Database cấp mã khi lưu.
        Assert.Equal(phieu.MaPhieuCoc, phieuThu.MaPhieuCoc);
        Assert.Equal(phieu.TongTien, phieuThu.SoTienThu);
        Assert.Equal(phieu.PhuongThucThanhToan, phieuThu.PhuongThucThanhToan);
        Assert.Equal(phieu.AnhMinhChung, phieuThu.AnhMinhChung);
        Assert.Equal("NV_QUAN_LY", phieuThu.MaNV);
    }

    [Fact]
    public void Phong_XacNhanMotGiuong_GiuPhongConGiuongTrong()
    {
        var phong = TaoPhong();

        phong.XacNhanDatCoc(["G1"]);

        Assert.Equal("DaCoc", phong.Giuongs[0].TrangThai);
        Assert.Equal("Trong", phong.Giuongs[1].TrangThai);
        Assert.Equal("ConGiuongTrong", phong.TrangThai);
        Assert.Equal("G1", Assert.Single(phong.GiuongsVuaDatCoc).MaGiuong);
    }

    [Fact]
    public void Phong_XacNhanToanBoGiuong_ChuyenPhongSangDaCoc()
    {
        var phong = TaoPhong();
        phong.Giuongs[1].TrangThai = "GiuCho";

        phong.XacNhanDatCoc(["G1", "G2"]);

        Assert.All(phong.Giuongs, giuong => Assert.Equal("DaCoc", giuong.TrangThai));
        Assert.Equal("DaCoc", phong.TrangThai);
    }

    [Fact]
    public void Phong_TuChoiKhiGiuongKhongConGiuCho()
    {
        var phong = TaoPhong();
        phong.Giuongs[0].TrangThai = "DaCoc";

        Assert.Throws<InvalidOperationException>(() => phong.XacNhanDatCoc(["G1"]));
    }

    private static PhieuCoc TaoPhieuChoDoiChieu() => new()
    {
        MaPhieuCoc = "PC1",
        MaPhong = "P1",
        TrangThai = "ChoDoiChieu",
        TongTien = 2_000_000m,
        SoGiuongThue = 1,
        PhuongThucThanhToan = "ChuyenKhoan",
        AnhMinhChung = "/api/deposits/chung-tu/proof.png",
        Giuongs = [new Giuong { MaGiuong = "G1", MaPhong = "P1", TrangThai = "GiuCho" }]
    };

    private static Phong TaoPhong() => new()
    {
        MaPhong = "P1",
        TrangThai = "GiuCho",
        Giuongs =
        [
            new Giuong { MaGiuong = "G1", MaPhong = "P1", TrangThai = "GiuCho" },
            new Giuong { MaGiuong = "G2", MaPhong = "P1", TrangThai = "Trong" }
        ]
    };
}
