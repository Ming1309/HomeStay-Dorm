using System.ComponentModel.DataAnnotations;

namespace HomeStay.Presentation.Contracts;

public sealed class TaoPhieuThuHttpRequest
{
    [Required] public string MaPDS { get; set; } = string.Empty;
    [Required] public string PhuongThucThanhToan { get; set; } = string.Empty;
    [Required] public IFormFile? ChungTu { get; set; }
}

public sealed record TaoPhieuThuHttpResponse(
    string MaPT,
    decimal SoTienThu,
    DateTime ThoiGian,
    string PhuongThucThanhToan,
    string MaNV);
