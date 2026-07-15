using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class SaleIntakeEntityTests
{
    private static readonly DateTime Now = new(2026, 7, 15, 10, 0, 0);

    [Fact]
    public void PhieuDangKy_TuChoiNgayDuKienTrongQuaKhu()
    {
        var phieu = PhieuDangKy.TaoMoi(
            "KH001", "NV001", "CN001", null, 1, null, null, Now.AddDays(-1), null, null, Now);

        var error = Assert.Throws<InvalidOperationException>(() => phieu.KiemTraDieuKien(Now));

        Assert.Contains("quá khứ", error.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    public void PhieuDangKy_ChapNhanNgayDuKienHomNayHoacTuongLai(int soNgay)
    {
        var phieu = PhieuDangKy.TaoMoi(
            "KH001", "NV001", "CN001", null, 1, null, null, Now.AddDays(soNgay), null, null, Now);

        phieu.KiemTraDieuKien(Now);
    }

    [Fact]
    public void LichHen_TuChoiDungTaiThoiDiemHienTai()
    {
        var lichHen = LichHen.TaoMoi("XemPhong", "PDK001", "CN001", Now.Date, Now.TimeOfDay, "NV001", Now);

        Assert.Throws<InvalidOperationException>(() => lichHen.KiemTraThoiGianHopLe(Now));
    }

    [Fact]
    public void LichHen_ChapNhanThoiDiemTrongTuongLai()
    {
        var thoiDiemHen = Now.AddMinutes(1);
        var lichHen = LichHen.TaoMoi(
            "XemPhong", "PDK001", "CN001", thoiDiemHen.Date, thoiDiemHen.TimeOfDay, "NV001", Now);

        lichHen.KiemTraThoiGianHopLe(Now);
    }

    [Theory]
    [InlineData("XemPhong", "PDK001")]
    [InlineData("NhanPhong", "PC001")]
    [InlineData("TraPhong", "HD001")]
    public void LichHen_GanDungChungTuTheoLoai(string loai, string maChungTu)
    {
        var lichHen = LichHen.TaoMoi(loai, maChungTu, "CN001", Now.Date, Now.AddHours(1).TimeOfDay, "NV001", Now);

        Assert.Equal(maChungTu, lichHen.MaPDK ?? lichHen.MaPhieuCoc ?? lichHen.MaHD);
        Assert.Equal("DaXacNhan", lichHen.TrangThai);
    }
}
