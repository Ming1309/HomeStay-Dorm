namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class HopDong
{
    public string MaHD { get; set; } = string.Empty;
    public DateTime? NgayKy { get; set; }
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public int? KyThanhToan { get; set; }
    public decimal GiaThue { get; set; }
    public string? DieuKhoan { get; set; }
    public string TrangThai { get; set; } = "ChoKy";
    public string? MaNV { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string? MaChinhSach { get; set; }
    public string? MaQD { get; set; }
    public string? MaQLDuyet { get; set; }
    public decimal TienCoc { get; set; }

    public PhieuCoc? PhieuCoc { get; set; }
    public KhachHang KhachHang { get; set; } = new();
    public Phong Phong { get; set; } = new();
    public List<ThanhVienHopDong> ThanhViens { get; set; } = [];
    public List<DichVuHopDong> DichVus { get; set; } = [];

    // ==========================================================
    // Methods from develop branch
    // ==========================================================
    public static Task<bool> TonTaiTheoPhieuCoc(string maPhieuCoc) =>
        HopDongDB.TonTaiTheoPhieuCoc(maPhieuCoc);

    public static Task<IReadOnlyList<HopDong>> TimKiem(string? tuKhoa, string? trangThai) =>
        HopDongDB.TraCuu(tuKhoa, trangThai);

    public static Task<IReadOnlyList<HopDong>> LayDanhSachHieuLuc() =>
        HopDongDB.LayDanhSachHieuLuc();

    public static async Task<HopDong?> DocChiTiet(string maHD)
    {
        var hopDong = await HopDongDB.DocChiTiet(maHD);
        if (hopDong is null) return null;

        hopDong.ThanhViens = (await ThanhVienHopDong.LayDanhSachTheoHopDong(maHD)).ToList();
        hopDong.DichVus = (await DichVuHopDong.LayDanhSachTheoHopDong(maHD)).ToList();
        return hopDong;
    }

    // ==========================================================
    // Methods from feat/lap-phieu-doi-soat branch
    // ==========================================================
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