namespace HomeStay.Presentation.Contracts;

public sealed record PhieuCocKhoiTaoHttpResponse(
    string MaPhieuCoc,
    string MaKH,
    string HoTenKhachHang,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    DateTime ThoiDiemCoc);

public sealed record GiuongTinhTienHttpResponse(
    string MaGiuong,
    string SoGiuong,
    string TrangThai);

public sealed record ChiTietTinhTienCocHttpResponse(
    string MaPhieuCoc,
    string MaKH,
    string HoTenKhachHang,
    string? SDT,
    string? Email,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    decimal GiaThue,
    int SucChua,
    int SoGiuongTinhTien,
    decimal TongTien,
    string TrangThai,
    IReadOnlyList<GiuongTinhTienHttpResponse> Giuongs);
