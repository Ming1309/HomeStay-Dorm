namespace HomeStay.Presentation.Contracts;

public sealed record PhieuCocChoDoiChieuHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string SoPhong,
    string? ToaNha,
    decimal TongTien,
    string? PhuongThucThanhToan,
    string? AnhMinhChung);

public sealed record GiuongDoiChieuHttpResponse(string MaGiuong, string SoGiuong, string TrangThai);

public sealed record ChiTietXacNhanKhoanTienCocHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string? SDT,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    int SoGiuongThue,
    decimal TongTien,
    string TrangThai,
    string? PhuongThucThanhToan,
    string? AnhMinhChung,
    string? MaNVSale,
    IReadOnlyList<GiuongDoiChieuHttpResponse> Giuongs);

public sealed record YeuCauBoSungChungTuHttpRequest(string LyDo);

public sealed record KetQuaXacNhanKhoanTienCocHttpResponse(
    ChiTietXacNhanKhoanTienCocHttpResponse PhieuCoc,
    string MaPhieuThu,
    decimal SoTienThu,
    DateTime ThoiGian,
    string MaNVQuanLy);
