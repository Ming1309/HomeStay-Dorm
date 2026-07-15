namespace HomeStay.Presentation.Contracts;

public sealed record PhieuCocChoNhapHoSoHttpResponse(
    string MaPhieuCoc,
    string MaKH,
    string HoTenKhachHang,
    string SDT,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    int SoGiuongThue,
    DateTime ThoiDiemCoc);

public sealed record ChiTietNhapHoSoHttpResponse(
    string MaPhieuCoc,
    string MaKH,
    string HoTenKhachHang,
    string? SDT,
    string? Email,
    string? GioiTinh,
    DateTime? NgaySinh,
    string? QuocTich,
    string? LoaiGiayTo,
    string? SoGiayTo,
    string? DiaChiThuongTru,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string HinhThucThue,
    int SoGiuongThue,
    int SucChua);

public sealed record NhapHoSoLuuTruHttpRequest(
    string DiaChiThuongTru,
    List<KhachHangRequest>? DanhSachThanhVien);

public sealed record KhachHangRequest(
    string HoTen,
    DateTime? NgaySinh,
    string? GioiTinh,
    string? QuocTich,
    string? LoaiGiayTo,
    string? SoGiayTo,
    string? DiaChiThuongTru,
    string? SDT,
    string? Email);
