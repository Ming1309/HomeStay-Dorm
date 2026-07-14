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

public sealed record TienHanhThuTienHttpRequest(
    [Required] string MaHD,
    [Required] string PhuongThucThanhToan,
    string? AnhMinhChung);

public sealed record TienHanhThuTienHttpResponse(
    string MaPT,
    decimal SoTienThu,
    string PhuongThucThanhToan,
    DateTime ThoiGian);
