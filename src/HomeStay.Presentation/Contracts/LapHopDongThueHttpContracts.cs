namespace HomeStay.Presentation.Contracts;

public sealed record PhieuCocDaDuyetHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string? SDT,
    string SoPhong,
    string? ToaNha,
    string TenLoaiPhong,
    string HinhThucThue,
    int SoGiuongThue,
    decimal TongTien,
    decimal TienCocDaThu,
    int SoThanhVienHopLe,
    DateTime ThoiDiemCoc);

public sealed record LapHopDongHttpRequest(
    string MaPhieuCoc,
    DateTime NgayBatDau,
    DateTime NgayKetThuc,
    int? KyThanhToan,
    decimal GiaThue,
    string? MaQD,
    List<string>? MaDichVus);

public sealed record HopDongDaTaoHttpResponse(
    string MaHD,
    string MaPhieuCoc,
    DateTime NgayBatDau,
    DateTime NgayKetThuc,
    int? KyThanhToan,
    decimal GiaThue,
    string TrangThai);
