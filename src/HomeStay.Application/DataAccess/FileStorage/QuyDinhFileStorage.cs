namespace HomeStay.Application.DataAccess.FileStorage;

public sealed record TepQuyDinh(string TenTep, long KichThuoc, Stream NoiDung);
public sealed record NoiDungQuyDinh(byte[] DuLieu, string ContentType);

public interface IQuyDinhFileStorage
{
    Task<string> Luu(TepQuyDinh tep, CancellationToken cancellationToken = default);
    Task Xoa(string duongDan, CancellationToken cancellationToken = default);
    Task<NoiDungQuyDinh?> Doc(string tenTep, CancellationToken cancellationToken = default);
}

public sealed class QuyDinhFileStorage(string thuMucGoc, string? thuMucTepMau = null) : IQuyDinhFileStorage
{
    public const long DungLuongToiDa = 10 * 1024 * 1024;
    public const string ThongBaoTepKhongHopLe =
        "Văn bản phải là file PDF hợp lệ và không vượt quá 10MB.";

    public async Task<string> Luu(TepQuyDinh tep, CancellationToken cancellationToken = default)
    {
        if (tep.KichThuoc <= 0 || tep.KichThuoc > DungLuongToiDa ||
            !Path.GetExtension(tep.TenTep).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        await using var buffer = new MemoryStream((int)tep.KichThuoc);
        await tep.NoiDung.CopyToAsync(buffer, cancellationToken);
        if (buffer.Length != tep.KichThuoc || buffer.Length > DungLuongToiDa ||
            buffer.Length < 5 || !buffer.GetBuffer().AsSpan(0, 5).SequenceEqual("%PDF-"u8))
            throw new InvalidDataException(ThongBaoTepKhongHopLe);

        Directory.CreateDirectory(thuMucGoc);
        var tenTep = $"{Guid.NewGuid():N}.pdf";
        var duongDanVatLy = Path.Combine(thuMucGoc, tenTep);
        try
        {
            buffer.Position = 0;
            await using var output = new FileStream(
                duongDanVatLy, FileMode.CreateNew, FileAccess.Write, FileShare.None);
            await buffer.CopyToAsync(output, cancellationToken);
        }
        catch
        {
            if (File.Exists(duongDanVatLy)) File.Delete(duongDanVatLy);
            throw;
        }

        return $"/api/admin/regulations/documents/{tenTep}";
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

    public async Task<NoiDungQuyDinh?> Doc(
        string tenTep, CancellationToken cancellationToken = default)
    {
        if (Path.GetFileName(tenTep) != tenTep ||
            !Path.GetExtension(tenTep).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
            return null;
        var duongDanVatLy = Path.Combine(thuMucGoc, tenTep);
        if (!File.Exists(duongDanVatLy) && !string.IsNullOrWhiteSpace(thuMucTepMau))
            duongDanVatLy = Path.Combine(thuMucTepMau, tenTep);
        if (!File.Exists(duongDanVatLy)) return null;
        return new NoiDungQuyDinh(
            await File.ReadAllBytesAsync(duongDanVatLy, cancellationToken), "application/pdf");
    }
}
