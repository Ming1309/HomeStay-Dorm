using System;
using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class ThanhLyHopDongEntityTests
{
    [Fact]
    public void KiemTraCongNo_TienThuThemBang0_TraVeTrue()
    {
        var pds = new PhieuDoiSoat
        {
            MaPDS = "PDS1",
            TienThuThem = 0,
            TienHoan = 1_000_000m,
            TrangThai = "DaChot",
        };
        Assert.True(PhieuDoiSoat.KiemTraCongNo(pds));
    }

    [Fact]
    public void KiemTraCongNo_HoaVon_TraVeTrue()
    {
        var pds = new PhieuDoiSoat
        {
            MaPDS = "PDS2",
            TienThuThem = 0,
            TienHoan = 0,
            TrangThai = "DaChot",
        };
        Assert.True(PhieuDoiSoat.KiemTraCongNo(pds));
    }

    [Fact]
    public void KiemTraCongNo_DaTatToan_TraVeTrue()
    {
        var pds = new PhieuDoiSoat
        {
            MaPDS = "PDS3",
            TienThuThem = 500_000m,
            TrangThai = "DaTatToan",
        };
        Assert.True(PhieuDoiSoat.KiemTraCongNo(pds));
    }

    [Fact]
    public void KiemTraCongNo_ConNoChuaTatToan_TraVeFalse()
    {
        var pds = new PhieuDoiSoat
        {
            MaPDS = "PDS4",
            TienThuThem = 500_000m,
            TrangThai = "DaChot",
        };
        Assert.False(PhieuDoiSoat.KiemTraCongNo(pds));
    }

    [Fact]
    public void KiemTraCongNo_Null_NemArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => PhieuDoiSoat.KiemTraCongNo((PhieuDoiSoat)null!));
    }
}
