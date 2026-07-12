namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class PhieuDangKy
{
    public string MaPDK { get; set; } = string.Empty;
    public string? KhuVuc { get; set; }
    public int? SoLuongNguoi { get; set; }
    public string? LoaiDichVu { get; set; }
    public decimal? MucGia { get; set; }
    public DateTime? ThoiGianDuKienVao { get; set; }
    public int? ThoiHanThue { get; set; }
    public string? YeuCauKhac { get; set; }
    public string TrangThai { get; set; } = "DangXuLy";
    public string MaKH { get; set; } = string.Empty;
    public string? MaNV { get; set; }
    public KhachHang? KhachHang { get; set; }

    public static PhieuDangKy TaoMoi(string maKH, string? maNV, string? khuVuc, int? soLuongNguoi,
        string? loaiDichVu, decimal? mucGia, DateTime? thoiGianDuKienVao, int? thoiHanThue,
        string? yeuCauKhac, DateTime thoiDiem) => new()
    {
        MaPDK = $"PDK{thoiDiem:yyyyMMddHHmmssfff}",
        MaKH = maKH,
        MaNV = maNV,
        KhuVuc = khuVuc,
        SoLuongNguoi = soLuongNguoi,
        LoaiDichVu = loaiDichVu,
        MucGia = mucGia,
        ThoiGianDuKienVao = thoiGianDuKienVao,
        ThoiHanThue = thoiHanThue,
        YeuCauKhac = yeuCauKhac,
        TrangThai = "DangXuLy"
    };

    public void KiemTraDieuKien()
    {
        if (string.IsNullOrWhiteSpace(MaKH))
            throw new InvalidOperationException("Thông tin khách hàng không hợp lệ.");
    }

    public static Task<PhieuDangKy?> DocChiTiet(string maPDK) => PhieuDangKyDB.LayTheoMa(maPDK);

    public static Task<IReadOnlyList<PhieuDangKy>> TimKiem(string? sdt, string? soGiayTo, string? email) =>
        PhieuDangKyDB.TimKiem(sdt, soGiayTo, email);

    public Task Them() => PhieuDangKyDB.Them(this);
}
