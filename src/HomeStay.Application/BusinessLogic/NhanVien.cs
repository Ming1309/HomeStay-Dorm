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

    public Task Them() => NhanVienDB.Them(this);
    public Task CapNhat() => NhanVienDB.CapNhat(this);
}
