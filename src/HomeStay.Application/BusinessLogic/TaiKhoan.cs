namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class TaiKhoan
{
    public string MaTK { get; set; } = string.Empty;
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhauHash { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "HoatDong";
    public DateTime? LanDangNhapCuoi { get; set; }
    public string? Email { get; set; }
    public string? PhongBan { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public NhanVien NhanVien { get; set; } = new();

    public bool DangHoatDong() => TrangThai == "HoatDong";
    public bool LaQuanTri() => NhanVien.VaiTro == "QuanTri";
    public bool KiemTraMatKhau(string matKhau, MatKhauHasher hasher) => hasher.KiemTra(matKhau, MatKhauHash);
    public static Task<TaiKhoan?> DocTheoTenDangNhap(string tenDangNhap) => TaiKhoanDB.DocTheoTenDangNhap(tenDangNhap);
    public static Task<TaiKhoan?> Doc(string maTK) => TaiKhoanDB.Doc(maTK);
    public static Task<IReadOnlyList<TaiKhoan>> LayDanhSach() => TaiKhoanDB.LayDanhSach();
    public void DoiMatKhau(string hash)
    {
        MatKhauHash = hash;
    }
    public void Khoa() => TrangThai = "Khoa";
    public void MoKhoa() => TrangThai = "HoatDong";
    public void VoHieuHoa() => TrangThai = "VoHieuHoa";
    public Task Them() => TaiKhoanDB.Them(this);
    public Task CapNhat() => TaiKhoanDB.CapNhat(this);
    public Task CapNhatTrangThai() => TaiKhoanDB.CapNhatTrangThai(MaTK, TrangThai);
    public Task DatMatKhau() => TaiKhoanDB.DatMatKhau(this);
    public Task CapNhatLanDangNhap() => TaiKhoanDB.CapNhatLanDangNhap(this);
}
