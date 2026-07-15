namespace HomeStay.Presentation.Contracts;

public sealed record BienBanThuHoiChuaXuLyHttpResponse(
    string MaBienBan,
    DateTime NgayBanGiao,
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha,
    string? TenNguoiLap);

public sealed record TaiSanHuHongHttpResponse(
    string MaTS,
    string TenTaiSan,
    string TinhTrang,
    int SoLuong,
    string? GhiChu,
    string? MinhChung,
    decimal? GiaTriGoiY);

public sealed record ChiTietBienBanThuHoiHttpResponse(
    string MaBienBan,
    DateTime NgayBanGiao,
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha,
    string? TenNguoiLap,
    string? MaNV,
    IReadOnlyList<TaiSanHuHongHttpResponse> TaiSanHuHong);

public sealed record KhoanBoiThuongHttpRequest(
    string MaTS,
    int SoLuong,
    decimal DonGia);

public sealed record LapHoaDonBoiThuongHttpRequest(
    string MaBienBan,
    IReadOnlyList<KhoanBoiThuongHttpRequest> ChiTiet,
    string? GhiChu);

public sealed record LapHoaDonBoiThuongHttpResponse(
    string MaHoaDon,
    decimal TongTien,
    string TrangThai,
    string MaBienBan,
    string MaHD,
    string TenKhachHang);
