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

    public KhachHang KhachHang { get; set; } = new();
    public Phong Phong { get; set; } = new();
    public List<ThanhVienHopDong> ThanhViens { get; set; } = [];
    public List<DichVuHopDong> DichVus { get; set; } = [];
    public decimal TienCoc { get; set; }

    public static Task<bool> TonTaiTheoPhieuCoc(string maPhieuCoc) =>
        HopDongDB.TonTaiTheoPhieuCoc(maPhieuCoc);

    public static Task<IReadOnlyList<HopDong>> TimKiem(string? tuKhoa, string? trangThai) =>
        HopDongDB.TraCuu(tuKhoa, trangThai);

    public static Task<IReadOnlyList<HopDong>> LayDanhSachHieuLuc() =>
        HopDongDB.LayDanhSachHieuLuc();

    public static Task<IReadOnlyList<HopDongCoLichTraPhong>> LayDanhSachCoLichTraTrongNgay(string? tuKhoa = null) =>
        HopDongDB.LayDanhSachCoLichTraTrongNgay(tuKhoa);

    public static Task<bool> CoLichTraPhongTrongNgay(string maHD) =>
        HopDongDB.CoLichTraPhongTrongNgay(maHD);

    public void KiemTraDangHieuLuc()
    {
        if (!string.Equals(TrangThai, "DangHieuLuc", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Hợp đồng không ở trạng thái Đang hiệu lực.");
    }

    public static async Task<HopDong?> DocChiTiet(string maHD)
    {
        var hopDong = await HopDongDB.DocChiTiet(maHD);
        if (hopDong is null) return null;

        hopDong.ThanhViens = (await ThanhVienHopDong.LayDanhSachTheoHopDong(maHD)).ToList();
        hopDong.DichVus = (await DichVuHopDong.LayDanhSachTheoHopDong(maHD)).ToList();
        return hopDong;
    }
}

public sealed class HopDongCoLichTraPhong
{
    public string MaHD { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }
    public DateTime NgayTraPhong { get; set; }
    public TimeSpan GioTraPhong { get; set; }
    public string MaLH { get; set; } = string.Empty;
}
