using System.ComponentModel.DataAnnotations;

namespace HomeStay.Presentation.Contracts;

public sealed class TaoPhieuHoanCocHttpRequest
{
    [Required]
    public string MaPDS { get; set; } = string.Empty;

    [Required]
    public string PhuongThucHoan { get; set; } = string.Empty;

    public string ThongTinNhanTien { get; set; } = string.Empty;
}

public sealed record TaoPhieuHoanCocHttpResponse(
    string MaPHC,
    decimal SoTienHoan,
    string PhuongThucHoan,
    DateTime ThoiGian,
    string MaNV);
