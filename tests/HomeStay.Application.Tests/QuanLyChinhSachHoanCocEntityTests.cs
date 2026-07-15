using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class QuanLyChinhSachHoanCocEntityTests
{
    [Theory]
    [InlineData(0, 0, 0, 0)]
    [InlineData(1, 1, 1, 1)]
    [InlineData(0.8, 0.5, 0.7, 1)]
    public void KiemTraTyLeHopLe_ChapNhanCacGiaTriHopLe(
        decimal chuaKy, decimal nganHan, decimal daiHan, decimal dungHan)
    {
        TaoChinhSach(chuaKy, nganHan, daiHan, dungHan).KiemTraTyLeHopLe();
    }

    [Theory]
    [InlineData(-0.01, 0, 0, 0)]
    [InlineData(0, -0.01, 0, 0)]
    [InlineData(0, 0, -0.01, 0)]
    [InlineData(0, 0, 0, -0.01)]
    [InlineData(1.01, 0, 0, 0)]
    [InlineData(0, 1.01, 0, 0)]
    [InlineData(0, 0, 1.01, 0)]
    [InlineData(0, 0, 0, 1.01)]
    public void KiemTraTyLeHopLe_TuChoiTyLeNgoaiKhoang(
        decimal chuaKy, decimal nganHan, decimal daiHan, decimal dungHan)
    {
        Assert.Throws<ArgumentException>(() =>
            TaoChinhSach(chuaKy, nganHan, daiHan, dungHan).KiemTraTyLeHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiNgayKetThucTruocNgayApDung()
    {
        var chinhSach = TaoChinhSach();
        chinhSach.NgayKetThuc = chinhSach.NgayApDung.AddDays(-1);

        Assert.Throws<ArgumentException>(() => chinhSach.KiemTraDuLieuHopLe());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void KiemTraDuLieuHopLe_TuChoiTenRong(string tenChinhSach)
    {
        var chinhSach = TaoChinhSach();
        chinhSach.TenChinhSach = tenChinhSach;

        Assert.Throws<ArgumentException>(() => chinhSach.KiemTraDuLieuHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiMocLuuTruKhongDuong()
    {
        var chinhSach = TaoChinhSach();
        chinhSach.MocLuuTru = 0;

        Assert.Throws<ArgumentException>(() => chinhSach.KiemTraDuLieuHopLe());
    }

    [Fact]
    public async Task Them_TuChoiKhiChuaCoMaTruocKhiGoiDb()
    {
        var chinhSach = TaoChinhSach();
        chinhSach.MaChinhSach = string.Empty;

        await Assert.ThrowsAsync<InvalidOperationException>(() => chinhSach.Them());
    }

    [Fact]
    public async Task CapNhatNgayKetThuc_TuChoiNgayKhongHopLeTruocKhiGoiDb()
    {
        var chinhSach = TaoChinhSach();

        await Assert.ThrowsAsync<ArgumentException>(() =>
            chinhSach.CapNhatNgayKetThuc(chinhSach.NgayApDung.AddDays(-1)));
    }

    [Theory]
    [InlineData("2026-06-30", "ChuaApDung")]
    [InlineData("2026-07-01", "DangApDung")]
    [InlineData("2026-07-31", "DangApDung")]
    [InlineData("2026-08-01", "HetHieuLuc")]
    public void TinhTrangThai_PhanLoaiTheoKhoangHieuLuc(string ngay, string mongDoi)
    {
        var chinhSach = TaoChinhSach();
        chinhSach.NgayApDung = new DateOnly(2026, 7, 1);
        chinhSach.NgayKetThuc = new DateOnly(2026, 7, 31);

        Assert.Equal(mongDoi, chinhSach.TinhTrangThai(DateOnly.Parse(ngay)));
    }

    [Theory]
    [InlineData(3, 12, 6, 0.5)]
    [InlineData(7, 12, 6, 0.7)]
    [InlineData(12, 12, 6, 1.0)]
    [InlineData(13, 12, 6, 1.0)]
    public void XacDinhTyLeHoan_DungTaiCacMocBien(
        int soThangThucTe, int soThangHopDong, int moc, decimal tyLeMongDoi)
    {
        var chinhSach = TaoChinhSach();
        chinhSach.MocLuuTru = moc;

        Assert.Equal(tyLeMongDoi, chinhSach.XacDinhTyLeHoan(soThangThucTe, soThangHopDong));
    }

    private static ChinhSachHoanCoc TaoChinhSach(
        decimal chuaKy = 0.8m,
        decimal nganHan = 0.5m,
        decimal daiHan = 0.7m,
        decimal dungHan = 1m) => new()
    {
        MaChinhSach = "CS01",
        TenChinhSach = "Chính sách kiểm thử",
        TiLe_ChuaKy = chuaKy,
        TiLe_TruocHan_NganHan = nganHan,
        TiLe_TruocHan_DaiHan = daiHan,
        TiLe_DungHan = dungHan,
        MocLuuTru = 6,
        NgayApDung = new DateOnly(2026, 7, 1)
    };
}
