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

    /// <summary>Alias UML: layDanhSachGiuong(maHD).</summary>
    public static Task<IReadOnlyList<ThanhVienHopDong>> LayDanhSachGiuong(string maHD) =>
        LayDanhSachTheoHopDong(maHD);

    public static async Task CapNhatTrangThaiDaTra(string maHD, DateTime ngayTra)
    {
        if (string.IsNullOrWhiteSpace(maHD))
            throw new ArgumentException("Mã hợp đồng không được để trống.");
        if (!await ThanhVienHopDongDB.UpdateTrangThaiDaTra(maHD.Trim(), ngayTra.Date))
            throw new InvalidOperationException("Không thể cập nhật trạng thái chi tiết hợp đồng thành Đã trả.");
    }

    public static async Task CapNhatDangThueTheoHD(string maHD)
    {
        if (string.IsNullOrWhiteSpace(maHD))
            throw new ArgumentException("Mã hợp đồng không được để trống.");
        if (!await ThanhVienHopDongDB.UpdateTrangThaiDangThue(maHD.Trim()))
            throw new InvalidOperationException("Không thể cập nhật trạng thái chi tiết hợp đồng thành Đang thuê.");
    }
}
