using System.ComponentModel.DataAnnotations;

namespace HomeStay.Presentation.Contracts;

public sealed record TaoPhieuThuHttpRequest(
    [Required] string MaPDS,
    [Required] string PhuongThucThanhToan,
    string? AnhMinhChung);

public sealed record TaoPhieuThuHttpResponse(
    string MaPT,
    decimal SoTienThu,
    DateTime ThoiGian,
    string PhuongThucThanhToan,
    string MaNV);
