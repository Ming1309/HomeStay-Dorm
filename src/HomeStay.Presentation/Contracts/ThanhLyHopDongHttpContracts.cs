namespace HomeStay.Presentation.Contracts;

public sealed record HopDongChoThanhLyHttpResponse(
    string MaHD,
    string TenKhachHang,
    string? SDT,
    string SoPhong,
    string? ToaNha,
    DateTime NgayBatDau,
    DateTime NgayKetThuc,
    decimal TienCoc,
    string MaPDS,
    decimal TienHoan,
    decimal TienThuThem,
    decimal TongKhauTru,
    string TrangThaiPDS,
    bool CoTheThanhLy);

public sealed record GiuongThanhLyHttpResponse(
    string MaGiuong,
    string SoGiuong,
    string TrangThaiThue);

public sealed record ChiTietThanhLyHopDongHttpResponse(
    string MaHD,
    string TrangThai,
    string TenKhachHang,
    string? SDT,
    string SoPhong,
    string? ToaNha,
    DateTime NgayBatDau,
    DateTime NgayKetThuc,
    decimal TienCoc,
    string MaPDS,
    DateTime NgayDoiSoat,
    decimal TyLeHoanCoc,
    decimal TongKhauTru,
    decimal TienHoan,
    decimal TienThuThem,
    string TrangThaiPDS,
    bool CoTheThanhLy,
    string? LyDoChan,
    IReadOnlyList<GiuongThanhLyHttpResponse> Giuongs);

public sealed record XacNhanThanhLyHttpRequest(
    bool CustomerAgreed,
    bool LiquidationSigned,
    bool KeysRecovered);

public sealed record ThanhLyHopDongHttpRequest(
    string MaHD,
    string? GhiChu,
    XacNhanThanhLyHttpRequest Confirmations);

public sealed record ThanhLyHopDongHttpResponse(
    string MaHD,
    string TrangThai,
    DateTime NgayThanhLy,
    string MaPDS,
    decimal TienHoan,
    decimal TienThuThem);
