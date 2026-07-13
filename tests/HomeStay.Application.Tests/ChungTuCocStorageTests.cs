using HomeStay.Application.DataAccess.FileStorage;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class ChungTuCocStorageTests : IDisposable
{
    private readonly string _thuMuc = Path.Combine(Path.GetTempPath(), $"homestay-proof-{Guid.NewGuid():N}");

    [Fact]
    public async Task LuuVaDocTepPngHopLe()
    {
        var storage = new ChungTuCocFileStorage(_thuMuc);
        byte[] bytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01];

        var link = await storage.Luu(new TepChungTuCoc("bien-nhan.png", bytes.Length, new MemoryStream(bytes)));
        var saved = await storage.Doc(Path.GetFileName(link));

        Assert.StartsWith("/api/deposits/chung-tu/", link);
        Assert.NotNull(saved);
        Assert.Equal("image/png", saved.ContentType);
        Assert.Equal(bytes, saved.DuLieu);
    }

    [Fact]
    public async Task TuChoiTepGiaMaoDinhDang()
    {
        var storage = new ChungTuCocFileStorage(_thuMuc);
        byte[] bytes = [0x01, 0x02, 0x03, 0x04];

        var error = await Assert.ThrowsAsync<InvalidDataException>(() =>
            storage.Luu(new TepChungTuCoc("gia-mao.pdf", bytes.Length, new MemoryStream(bytes))));

        Assert.Equal(ChungTuCocFileStorage.ThongBaoTepKhongHopLe, error.Message);
    }

    [Fact]
    public async Task TuChoiTepVuotQuaNamMb()
    {
        var storage = new ChungTuCocFileStorage(_thuMuc);

        await Assert.ThrowsAsync<InvalidDataException>(() => storage.Luu(new TepChungTuCoc(
            "qua-lon.jpg", ChungTuCocFileStorage.DungLuongToiDa + 1, new MemoryStream([0xFF, 0xD8, 0xFF]))));
    }

    public void Dispose()
    {
        if (Directory.Exists(_thuMuc)) Directory.Delete(_thuMuc, recursive: true);
    }
}
