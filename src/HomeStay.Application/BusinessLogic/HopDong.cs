namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class HopDong
{
    public string MaHD { get; set; } = string.Empty;
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public decimal GiaThue { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string? MaChinhSach { get; set; }
    public string? MaQD { get; set; }

    public PhieuCoc? PhieuCoc { get; set; }
    public KhachHang? KhachHang { get; set; }

    public static Task<IReadOnlyList<HopDong>> LayDanhSachChoDoiSoat() =>
        HopDongDB.LayDanhSachChoDoiSoat();

    public static Task<HopDong?> LayThongTinLuuTru(string maHD) =>
        HopDongDB.LayThongTinLuuTru(maHD);

    public int TinhSoThangThucTe(DateTime thoiDiemDoiSoat)
    {
        if (thoiDiemDoiSoat <= NgayBatDau) return 0;
        int years = thoiDiemDoiSoat.Year - NgayBatDau.Year;
        int months = thoiDiemDoiSoat.Month - NgayBatDau.Month;
        int totalMonths = years * 12 + months;
        if (thoiDiemDoiSoat.Day < NgayBatDau.Day)
        {
            totalMonths--;
        }
        return Math.Max(0, totalMonths);
    }

    public int TinhSoThangHopDong()
    {
        int years = NgayKetThuc.Year - NgayBatDau.Year;
        int months = NgayKetThuc.Month - NgayBatDau.Month;
        int totalMonths = years * 12 + months;
        if (NgayKetThuc.Day < NgayBatDau.Day)
        {
            totalMonths--;
        }
        return Math.Max(0, totalMonths);
    }
}
