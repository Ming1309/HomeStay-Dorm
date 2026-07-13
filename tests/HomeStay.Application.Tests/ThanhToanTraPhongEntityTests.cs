using System;
using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class ThanhToanTraPhongEntityTests
{
    [Fact]
    public void TaoPhieuThu_ValidParameters_CreatesSuccessfully()
    {
        var now = new DateTime(2026, 7, 13, 12, 0, 0);
        var phieuThu = PhieuThu.TaoPhieuThu("PDS0099", 500_000m, "TienMat", null, "NV02", now);

        Assert.NotNull(phieuThu);
        Assert.StartsWith("PT20260713120000", phieuThu.MaPT);
        Assert.Equal(500_000m, phieuThu.SoTienThu);
        Assert.Equal("PDS0099", phieuThu.MaPDS);
        Assert.Equal("TienMat", phieuThu.PhuongThucThanhToan);
        Assert.Null(phieuThu.AnhMinhChung);
        Assert.Equal("NV02", phieuThu.MaNV);
        Assert.Null(phieuThu.MaHoaDon);
        Assert.Null(phieuThu.MaPhieuCoc);
    }

    [Fact]
    public void TaoPhieuThu_InvalidAmount_ThrowsArgumentException()
    {
        var now = DateTime.Now;
        Assert.Throws<ArgumentException>(() =>
            PhieuThu.TaoPhieuThu("PDS0099", -100m, "TienMat", null, "NV02", now)
        );

        Assert.Throws<ArgumentException>(() =>
            PhieuThu.TaoPhieuThu("PDS0099", 0m, "TienMat", null, "NV02", now)
        );
    }

    [Theory]
    [InlineData("Cash")]
    [InlineData("BankTransfer")]
    [InlineData("")]
    public void TaoPhieuThu_InvalidPaymentMethod_ThrowsArgumentException(string method)
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuThu.TaoPhieuThu("PDS0099", 100m, method, null, "NV02", DateTime.Now));
    }

    [Fact]
    public void TaoPhieuThu_BankTransferWithoutEvidence_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuThu.TaoPhieuThu("PDS0099", 100m, "ChuyenKhoan", null, "NV02", DateTime.Now));
    }

    [Fact]
    public void TaoPhieuThu_MissingEmployee_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuThu.TaoPhieuThu("PDS0099", 100m, "TienMat", null, " ", DateTime.Now));
    }
}
