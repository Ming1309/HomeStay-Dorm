namespace HomeStay.Presentation.Contracts;

// UC 1.4.25 - Quan ly phong / giuong (vai tro QuanTri)

public sealed record PhongHttpResponse(
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string? Tang,
    string? GioiTinhChoPhep,
    string TrangThai,
    string MaLP,
    string TenLoaiPhong,
    int SucChua,
    decimal GiaThue,
    string MaCN,
    string? TenChiNhanh,
    int SoGiuong,
    int SoGiuongTrong);

public sealed record GiuongHttpResponse(
    string MaGiuong,
    string SoGiuong,
    string TrangThai,
    string MaPhong,
    string SoPhong,
    string? ToaNha);

public sealed record TaoPhongHttpRequest(
    string SoPhong,
    string? ToaNha,
    string? Tang,
    string? GioiTinhChoPhep,
    string MaLP,
    string MaCN);

public sealed record CapNhatPhongHttpRequest(
    string SoPhong,
    string? ToaNha,
    string? Tang,
    string? GioiTinhChoPhep,
    string TrangThai,
    string MaLP,
    string MaCN);

public sealed record TaoGiuongHttpRequest(
    string SoGiuong,
    string MaPhong);

public sealed record CapNhatGiuongHttpRequest(
    string SoGiuong,
    string TrangThai,
    string MaPhong);
