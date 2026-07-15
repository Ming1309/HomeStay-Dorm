namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class NhanVien
{
    public string MaNV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string? SDT { get; set; }
    public string VaiTro { get; set; } = string.Empty;
    public string MaCN { get; set; } = string.Empty;
    public string? TenChiNhanh { get; set; }

    public static Task<NhanVien?> DocChiTiet(string maNV) => NhanVienDB.DocChiTiet(maNV);
    public static Task<NhanVien?> LayThongTinNhanVien(string maNV) => NhanVienDB.GetNhanVienTheoMaNV(maNV);
    public static async Task<NhanVien> DocPhamVi(string? maNV)
    {
        if (string.IsNullOrWhiteSpace(maNV))
            throw new UnauthorizedAccessException("Không xác định được nhân viên đang đăng nhập.");
        var nhanVien = await DocChiTiet(maNV.Trim())
            ?? throw new UnauthorizedAccessException("Nhân viên đang đăng nhập không còn tồn tại.");
        if (string.IsNullOrWhiteSpace(nhanVien.MaCN))
            throw new UnauthorizedAccessException("Nhân viên chưa được phân công chi nhánh.");
        return nhanVien;
    }

    public void KiemTraCungChiNhanh(string? maCN)
    {
        if (!string.Equals(MaCN, maCN, StringComparison.OrdinalIgnoreCase))
            throw new KeyNotFoundException("Không tìm thấy hồ sơ.");
    }
    public Task Them() => NhanVienDB.Them(this);
    public Task CapNhat() => NhanVienDB.CapNhat(this);
}
