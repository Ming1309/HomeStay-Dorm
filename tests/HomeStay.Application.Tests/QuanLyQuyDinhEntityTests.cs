using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.FileStorage;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class QuanLyQuyDinhEntityTests
{
    [Theory]
    [InlineData("DieuKienLuuTru")]
    [InlineData("NoiQuySinhHoat")]
    [InlineData("HoSoPhapLyCuTru")]
    [InlineData("TaiChinhThanhToan")]
    [InlineData("TaiSanTienIchAnToan")]
    [InlineData("ViPhamBoiThuong")]
    public void KiemTraDuLieuHopLe_ChapNhanSauLoaiQuyDinh(string loai)
    {
        var quyDinh = TaoQuyDinh();
        quyDinh.LoaiQD = loai;
        quyDinh.KiemTraDuLieuHopLe();
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiLoaiKhongHopLe()
    {
        var quyDinh = TaoQuyDinh();
        quyDinh.LoaiQD = "Khac";
        Assert.Throws<ArgumentException>(() => quyDinh.KiemTraDuLieuHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiNgayKetThucBangNgayApDung()
    {
        var quyDinh = TaoQuyDinh();
        quyDinh.NgayKetThuc = quyDinh.NgayApDung;
        Assert.Throws<ArgumentException>(() => quyDinh.KiemTraDuLieuHopLe());
    }

    [Fact]
    public void KiemTraDuLieuHopLe_TuChoiKhiThieuDuongDanPdf()
    {
        var quyDinh = TaoQuyDinh();
        quyDinh.DuongDanFile = "";
        Assert.Throws<ArgumentException>(() => quyDinh.KiemTraDuLieuHopLe());
    }

    [Theory]
    [InlineData("2026-07-09", "ChuaApDung")]
    [InlineData("2026-07-10", "DangApDung")]
    [InlineData("2026-07-20", "DangApDung")]
    [InlineData("2026-07-21", "HetHieuLuc")]
    public void TinhTrangThai_DungTaiCacMocBien(string ngay, string mongDoi)
    {
        var quyDinh = TaoQuyDinh();
        Assert.Equal(mongDoi, quyDinh.TinhTrangThai(DateOnly.Parse(ngay)));
    }

    [Fact]
    public async Task FileStorage_LuuDocVaXoaPdfHopLe()
    {
        var thuMuc = Path.Combine(Path.GetTempPath(), $"quy-dinh-test-{Guid.NewGuid():N}");
        var storage = new QuyDinhFileStorage(thuMuc);
        try
        {
            var bytes = "%PDF-1.4\nHomeStay Dorm"u8.ToArray();
            await using var stream = new MemoryStream(bytes);
            var duongDan = await storage.Luu(new TepQuyDinh("quy-dinh.pdf", bytes.Length, stream));
            var tenTep = Path.GetFileName(duongDan);
            Assert.NotNull(await storage.Doc(tenTep));
            await storage.Xoa(duongDan);
            Assert.Null(await storage.Doc(tenTep));
        }
        finally
        {
            if (Directory.Exists(thuMuc)) Directory.Delete(thuMuc, recursive: true);
        }
    }

    [Theory]
    [InlineData("quy-dinh.txt", "%PDF-1.4")]
    [InlineData("quy-dinh.pdf", "not-a-pdf")]
    public async Task FileStorage_TuChoiTepKhongHopLe(string tenTep, string noiDung)
    {
        var storage = new QuyDinhFileStorage(Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N")));
        await using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(noiDung));
        await Assert.ThrowsAsync<InvalidDataException>(() =>
            storage.Luu(new TepQuyDinh(tenTep, stream.Length, stream)));
    }

    [Fact]
    public async Task FileStorage_TuChoiPdfVuotQuaMuoiMb()
    {
        var storage = new QuyDinhFileStorage(Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N")));
        await using var stream = new MemoryStream(new byte[QuyDinhFileStorage.DungLuongToiDa + 1]);
        await Assert.ThrowsAsync<InvalidDataException>(() =>
            storage.Luu(new TepQuyDinh("quy-dinh.pdf", stream.Length, stream)));
    }

    private static QuyDinh TaoQuyDinh() => new()
    {
        MaQD = "QD99",
        TenQD = "Nội quy kiểm thử",
        LoaiQD = "NoiQuySinhHoat",
        DuongDanFile = "/api/admin/regulations/documents/test.pdf",
        NgayApDung = new DateOnly(2026, 7, 10),
        NgayKetThuc = new DateOnly(2026, 7, 20),
    };
}
