namespace HomeStay.Presentation.Contracts;

using Microsoft.AspNetCore.Http;

public sealed class TaoQuyDinhHttpRequest
{
    public string TenQD { get; set; } = string.Empty;
    public string LoaiQD { get; set; } = string.Empty;
    public DateOnly NgayApDung { get; set; }
    public DateOnly? NgayKetThuc { get; set; }
    public IFormFile? File { get; set; }
}

public sealed class CapNhatQuyDinhHttpRequest
{
    public string TenQD { get; set; } = string.Empty;
    public string LoaiQD { get; set; } = string.Empty;
    public DateOnly NgayApDung { get; set; }
    public DateOnly? NgayKetThuc { get; set; }
    public IFormFile? File { get; set; }
}

public sealed record QuyDinhHttpResponse(
    string MaQD,
    string TenQD,
    string LoaiQD,
    string DuongDanFile,
    DateOnly NgayApDung,
    DateOnly? NgayKetThuc,
    string TrangThai);
