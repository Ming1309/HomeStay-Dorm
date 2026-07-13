namespace HomeStay.Presentation.Contracts;

public sealed record PhieuCocChoDuyetHttpResponse(
    string MaPhieuCoc,
    string HoTenKhachHang,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    int SoGiuongThue,
    decimal TongTien,
    DateTime ThoiDiemCoc);

public sealed record ThanhVienDuyetHttpResponse(
    string MaKH,
    string HoTen,
    DateTime? NgaySinh,
    string? GioiTinh,
    string? QuocTich,
    string? LoaiGiayTo,
    string? SoGiayTo,
    string? SDT,
    string? Email,
    string? DiaChiThuongTru,
    string VaiTro,
    string TrangThaiDuyet);

public sealed record ChiTietXetDuyetHttpResponse(
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
    string? MaNVSale,
    IReadOnlyList<GiuongDoiChieuHttpResponse> Giuongs,
    IReadOnlyList<ThanhVienDuyetHttpResponse> ThanhViens);

public sealed record TuChoiThanhVienHttpRequest(string MaKH);
