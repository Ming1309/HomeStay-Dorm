namespace HomeStay.Application.DataAccess.FileStorage;

public sealed record TepChungTuTaiChinh(string TenTep, long KichThuoc, Stream NoiDung);
public sealed record NoiDungChungTuTaiChinh(byte[] DuLieu, string ContentType);

public interface IChungTuTaiChinhStorage
{
    Task<string> Luu(string loai, TepChungTuTaiChinh tep, CancellationToken cancellationToken = default);
    Task Xoa(string duongDan, CancellationToken cancellationToken = default);
    Task<NoiDungChungTuTaiChinh?> Doc(string loai, string tenTep, CancellationToken cancellationToken = default);
}

public sealed class ChungTuTaiChinhFileStorage(string thuMucGoc) : IChungTuTaiChinhStorage
{
    public const long DungLuongToiDa = 5 * 1024 * 1024;
    public const string ThongBaoTepKhongHopLe =
        "Chứng từ phải là JPG, JPEG, PNG hoặc PDF hợp lệ và không vượt quá 5 MB.";

    private static readonly IReadOnlyDictionary<string, string> ContentTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png",
            [".pdf"] = "application/pdf",
        };

    public async Task<string> Luu(string loai, TepChungTuTaiChinh tep, CancellationToken cancellationToken = default)
    {
        loai = ChuanHoaLoai(loai);
        if (tep.KichThuoc <= 0 || tep.KichThuoc > DungLuongToiDa)
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        var extension = Path.GetExtension(tep.TenTep).ToLowerInvariant();
        if (!ContentTypes.ContainsKey(extension))
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        await using var buffer = new MemoryStream((int)tep.KichThuoc);
        await tep.NoiDung.CopyToAsync(buffer, cancellationToken);
        if (buffer.Length != tep.KichThuoc || !DungDinhDang(buffer, extension))
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        var thuMuc = Path.Combine(thuMucGoc, loai);
        Directory.CreateDirectory(thuMuc);
        var tenTep = $"{Guid.NewGuid():N}{extension}";
        var duongDan = Path.Combine(thuMuc, tenTep);
        try
        {
            buffer.Position = 0;
            await using var output = new FileStream(duongDan, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            await buffer.CopyToAsync(output, cancellationToken);
        }
        catch
        {
            if (File.Exists(duongDan)) File.Delete(duongDan);
            throw;
        }

        return $"/api/financial-proofs/{loai}/{tenTep}";
    }

    public Task Xoa(string duongDan, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (!Uri.TryCreate(duongDan, UriKind.RelativeOrAbsolute, out _)) return Task.CompletedTask;
        var parts = duongDan.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 2) return Task.CompletedTask;
        var loai = ChuanHoaLoai(parts[^2]);
        var tenTep = Path.GetFileName(parts[^1]);
        var path = Path.Combine(thuMucGoc, loai, tenTep);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }

    public async Task<NoiDungChungTuTaiChinh?> Doc(string loai, string tenTep, CancellationToken cancellationToken = default)
    {
        loai = ChuanHoaLoai(loai);
        if (Path.GetFileName(tenTep) != tenTep) return null;
        var extension = Path.GetExtension(tenTep);
        if (!ContentTypes.TryGetValue(extension, out var contentType)) return null;
        var path = Path.Combine(thuMucGoc, loai, tenTep);
        if (!File.Exists(path)) return null;
        return new NoiDungChungTuTaiChinh(await File.ReadAllBytesAsync(path, cancellationToken), contentType);
    }

    private static string ChuanHoaLoai(string loai) => loai switch
    {
        "thu" => "thu",
        "hoan" => "hoan",
        _ => throw new ArgumentException("Loại chứng từ tài chính không hợp lệ.", nameof(loai)),
    };

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
