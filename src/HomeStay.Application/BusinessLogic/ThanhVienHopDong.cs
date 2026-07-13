namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ThanhVienHopDong
{
    public string MaHD { get; set; } = string.Empty;
    public string MaGiuong { get; set; } = string.Empty;
    public string MaKH { get; set; } = string.Empty;
    public string TrangThaiThue { get; set; } = "DangThue";
    public DateTime? NgayTra { get; set; }
    public KhachHang KhachHang { get; set; } = new();
    public Giuong Giuong { get; set; } = new();

    public static Task<IReadOnlyList<ThanhVienHopDong>> LayDanhSachTheoHopDong(string maHD) =>
        ThanhVienHopDongDB.LayDanhSachTheoHopDong(maHD);
}
