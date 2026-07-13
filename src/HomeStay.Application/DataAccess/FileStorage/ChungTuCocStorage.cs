namespace HomeStay.Application.DataAccess.FileStorage;

public sealed record TepChungTuCoc(string TenTep, long KichThuoc, Stream NoiDung);

public sealed record NoiDungChungTuCoc(byte[] DuLieu, string ContentType);

public interface IChungTuCocStorage
{
    Task<string> Luu(TepChungTuCoc tep, CancellationToken cancellationToken = default);
    Task Xoa(string duongDan, CancellationToken cancellationToken = default);
    Task<NoiDungChungTuCoc?> Doc(string tenTep, CancellationToken cancellationToken = default);
}

public sealed class ChungTuCocFileStorage(string thuMucGoc) : IChungTuCocStorage
{
    public const long DungLuongToiDa = 5 * 1024 * 1024;
    public const string ThongBaoTepKhongHopLe =
        "Định dạng tệp không hỗ trợ hoặc dung lượng quá lớn. Vui lòng tải lên file ảnh hoặc PDF dưới 5MB.";

    private static readonly IReadOnlyDictionary<string, string> ContentTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png",
            [".pdf"] = "application/pdf",
        };

    public async Task<string> Luu(TepChungTuCoc tep, CancellationToken cancellationToken = default)
    {
        if (tep.KichThuoc <= 0 || tep.KichThuoc > DungLuongToiDa)
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        var extension = Path.GetExtension(tep.TenTep).ToLowerInvariant();
        if (!ContentTypes.ContainsKey(extension))
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        await using var buffer = new MemoryStream((int)tep.KichThuoc);
        await tep.NoiDung.CopyToAsync(buffer, cancellationToken);
        if (buffer.Length != tep.KichThuoc || buffer.Length > DungLuongToiDa || !DungDinhDang(buffer, extension))
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        Directory.CreateDirectory(thuMucGoc);
        var tenTep = $"{Guid.NewGuid():N}{extension}";
        var duongDanVatLy = Path.Combine(thuMucGoc, tenTep);
        try
        {
            buffer.Position = 0;
            await using var output = new FileStream(duongDanVatLy, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            await buffer.CopyToAsync(output, cancellationToken);
        }
        catch
        {
            if (File.Exists(duongDanVatLy)) File.Delete(duongDanVatLy);
            throw;
        }

        return $"/api/deposits/chung-tu/{tenTep}";
    }

    public Task Xoa(string duongDan, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var tenTep = Path.GetFileName(duongDan);
        if (!string.IsNullOrWhiteSpace(tenTep))
        {
            var duongDanVatLy = Path.Combine(thuMucGoc, tenTep);
            if (File.Exists(duongDanVatLy)) File.Delete(duongDanVatLy);
        }
        return Task.CompletedTask;
    }

    public async Task<NoiDungChungTuCoc?> Doc(string tenTep, CancellationToken cancellationToken = default)
    {
        if (Path.GetFileName(tenTep) != tenTep) return null;
        var extension = Path.GetExtension(tenTep);
        if (!ContentTypes.TryGetValue(extension, out var contentType)) return null;
        var duongDanVatLy = Path.Combine(thuMucGoc, tenTep);
        if (!File.Exists(duongDanVatLy)) return null;
        return new NoiDungChungTuCoc(await File.ReadAllBytesAsync(duongDanVatLy, cancellationToken), contentType);
    }

    private static bool DungDinhDang(MemoryStream buffer, string extension)
    {
        var bytes = buffer.GetBuffer();
        var length = buffer.Length;
        return extension switch
        {
            ".jpg" or ".jpeg" => length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,
            ".png" => length >= 8 && bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
            ".pdf" => length >= 5 && bytes.AsSpan(0, 5).SequenceEqual("%PDF-"u8),
            _ => false,
        };
    }
}
