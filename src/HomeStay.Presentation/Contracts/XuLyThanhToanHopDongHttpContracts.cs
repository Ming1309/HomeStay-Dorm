namespace HomeStay.Presentation.Contracts;

using System.ComponentModel.DataAnnotations;

public sealed record HopDongChoThanhToanHttpResponse(
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha,
    decimal GiaThue,
    int KyThanhToan,
    decimal TongTienCanThu);

public sealed record KhoanThuHttpResponse(
    string TenKhoanThu,
    int SoLuongKy,
    decimal DonGia,
    decimal ThanhTien);

public sealed record ChiTietThanhToanHopDongHttpResponse(
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha,
    decimal GiaThue,
    int KyThanhToan,
    decimal TienThueKyDau,
    decimal TienDichVu,
    decimal TongCong,
    IReadOnlyList<KhoanThuHttpResponse> KhoanThus);

public sealed class TienHanhThuTienHttpRequest
{
    [Required] public string MaHD { get; set; } = string.Empty;
    [Required] public string PhuongThucThanhToan { get; set; } = string.Empty;
    [Required] public IFormFile? ChungTu { get; set; }
}

public sealed record TienHanhThuTienHttpResponse(
    string MaPT,
    decimal SoTienThu,
    string PhuongThucThanhToan,
    DateTime ThoiGian);
