namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class HoaDon
{
    public string MaHoaDon { get; set; } = string.Empty;
    public DateTime NgayLap { get; set; }
    public DateTime? HanThanhToan { get; set; }
    public string LoaiHoaDon { get; set; } = string.Empty;
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public string MaHD { get; set; } = string.Empty;
    public string? MaNV { get; set; }

    public static Task<IReadOnlyList<HoaDon>> LayDanhSachChuaThanhToan(string maHD) =>
        HoaDonDB.LayDanhSachChuaThanhToanTheoHD(maHD);
}
