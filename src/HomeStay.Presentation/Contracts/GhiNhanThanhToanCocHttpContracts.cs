namespace HomeStay.Presentation.Contracts;

using Microsoft.AspNetCore.Http;

public sealed class GhiNhanThanhToanCocHttpRequest
{
    public string PhuongThucThanhToan { get; set; } = string.Empty;
    public IFormFile? ChungTu { get; set; }
}

public sealed record PhieuCocChoThanhToanHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    decimal TongTien,
    DateTime? HanThanhToan);

public sealed record ChiTietGhiNhanThanhToanCocHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string? SDT,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    int SoGiuongThue,
    decimal TongTien,
    DateTime? HanThanhToan,
    string TrangThai,
    string? PhuongThucThanhToan,
    string? AnhMinhChung);
