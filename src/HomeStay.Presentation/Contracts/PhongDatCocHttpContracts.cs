namespace HomeStay.Presentation.Contracts;

public sealed record GiuongDatCocHttpResponse(
    string MaGiuong,
    string SoGiuong,
    string TrangThai);

public sealed record LoaiPhongDatCocHttpResponse(
    string MaLP,
    string TenLoaiPhong,
    decimal GiaThue,
    int SucChua);

public sealed record PhongDatCocHttpResponse(
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string? GioiTinhChoPhep,
    string TrangThai,
    LoaiPhongDatCocHttpResponse LoaiPhong,
    IReadOnlyList<GiuongDatCocHttpResponse> Giuongs);
