using System;
using System.Collections.Generic;
using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class LapHoaDonBoiThuongEntityTests
{
    [Fact]
    public void KiemTraTinhHopLe_SoTienHopLe_TraVeTrue()
    {
        var ok = HoaDon.KiemTraTinhHopLe(new List<decimal> { 0m, 100_000m, 800_000m });
        Assert.True(ok);
    }

    [Fact]
    public void KiemTraTinhHopLe_SoAm_NemArgumentException()
    {
        var ex = Assert.Throws<ArgumentException>(() =>
            HoaDon.KiemTraTinhHopLe(new List<decimal> { 100_000m, -1m }));
        Assert.Equal("Vui lòng nhập số tiền phạt hợp lệ", ex.Message);
    }

    [Fact]
    public void KiemTraTinhHopLe_DanhSachRong_NemArgumentException()
    {
        var ex = Assert.Throws<ArgumentException>(() =>
            HoaDon.KiemTraTinhHopLe(new List<decimal>()));
        Assert.Equal("Vui lòng nhập số tiền phạt hợp lệ", ex.Message);
    }

    [Fact]
    public void KiemTraTinhHopLe_Null_NemArgumentException()
    {
        var ex = Assert.Throws<ArgumentException>(() =>
            HoaDon.KiemTraTinhHopLe(null!));
        Assert.Equal("Vui lòng nhập số tiền phạt hợp lệ", ex.Message);
    }

    [Fact]
    public void ChiTietHoaDon_ThanhTien_BangSoLuongNhanDonGia()
    {
        var ct = new ChiTietHoaDon { SoLuong = 2, DonGia = 150_000m };
        Assert.Equal(300_000m, ct.ThanhTien);
    }
}
