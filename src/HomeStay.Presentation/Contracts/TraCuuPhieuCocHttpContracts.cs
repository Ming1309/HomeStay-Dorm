namespace HomeStay.Presentation.Contracts;

public sealed record PhieuCocTraCuuHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string? SDT,
    string? Email,
    string? SoGiayTo,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    int SoGiuongThue,
    decimal TongTien,
    DateTime ThoiDiemCoc,
    DateTime? HanThanhToan,
    string TrangThai,
    bool DaDongTien,
    DateTime? ThoiDiemHuy,
    string? MaNVHuy);

public sealed record ChiTietPhieuCocTraCuuHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string? SDT,
    string? Email,
    string? LoaiGiayTo,
    string? SoGiayTo,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    int SoGiuongThue,
    decimal TongTien,
    DateTime ThoiDiemCoc,
    DateTime? HanThanhToan,
    string TrangThai,
    bool DaDongTien,
    DateTime? ThoiDiemHuy,
    string? MaNVHuy,
    IReadOnlyList<GiuongTraCuuHttpResponse> Giuongs);

public sealed record GiuongTraCuuHttpResponse(string MaGiuong, string SoGiuong, string TrangThai);
