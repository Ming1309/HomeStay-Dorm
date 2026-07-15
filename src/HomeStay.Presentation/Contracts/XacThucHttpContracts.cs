namespace HomeStay.Presentation.Contracts;

public sealed record DangNhapHttpRequest(string TenDangNhap, string MatKhau);
public sealed record TaoTaiKhoanHttpRequest(string HoTen, string SDT, string VaiTro, string MaCN, string TenDangNhap, string Email, string MatKhauTam);
public sealed record CapNhatTaiKhoanHttpRequest(string HoTen, string SDT, string VaiTro, string MaCN, string TenDangNhap, string Email);
public sealed record DoiTrangThaiTaiKhoanHttpRequest(string TrangThai);
public sealed record DatLaiMatKhauHttpRequest(string MatKhauTam);
