namespace HomeStay.Presentation.Contracts;

public sealed record HopDongTraCuuHttpResponse(
    string MaHD,
    string HoTenKhachHang,
    string? SDT,
    string? SoGiayTo,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string TenLoaiPhong,
    DateTime NgayBatDau,
    DateTime NgayKetThuc,
    int? KyThanhToan,
    decimal GiaThue,
    decimal TienCoc,
    string TrangThai);

public sealed record ThanhVienTraCuuHttpResponse(
    string MaKH,
    string HoTen,
    string? SDT,
    string? GioiTinh,
    DateTime? NgaySinh,
    string? LoaiGiayTo,
    string? SoGiayTo,
    string? QuocTich,
    string? DiaChiThuongTru,
    string SoGiuong,
    string TrangThaiThue);

public sealed record DichVuTraCuuHttpResponse(
    string MaDV,
    string TenDV,
    decimal DonGiaKyKet,
    string? DonViTinh);

public sealed record ChiTietHopDongTraCuuHttpResponse(
    string MaHD,
    string HoTenKhachHang,
    string? SDT,
    string? Email,
    string? SoGiayTo,
    string? DiaChiThuongTru,
    string? GioiTinh,
    string? QuocTich,
    DateTime? NgaySinh,
    string? LoaiGiayTo,
    string MaPhong,
    string SoPhong,
    string? ToaNha,
    string? Tang,
    string TenLoaiPhong,
    int SucChua,
    decimal GiaThueLoaiPhong,
    DateTime? NgayKy,
    DateTime NgayBatDau,
    DateTime NgayKetThuc,
    int? KyThanhToan,
    decimal GiaThue,
    decimal TienCoc,
    string? DieuKhoan,
    string TrangThai,
    string MaPhieuCoc,
    IReadOnlyList<ThanhVienTraCuuHttpResponse> ThanhViens,
    IReadOnlyList<DichVuTraCuuHttpResponse> DichVus);
