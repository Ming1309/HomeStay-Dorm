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
    public string MaCN { get; set; } = string.Empty;
    public KhachHang? KhachHang { get; set; }

    public static PhieuDangKy TaoMoi(string maKH, string? maNV, string maCN, string? khuVuc, int? soLuongNguoi,
        string? loaiDichVu, decimal? mucGia, DateTime? thoiGianDuKienVao, int? thoiHanThue,
        string? yeuCauKhac, DateTime thoiDiem) => new()
    {
        MaKH = maKH,
        MaNV = maNV,
        MaCN = maCN,
        KhuVuc = khuVuc,
        SoLuongNguoi = soLuongNguoi,
        LoaiDichVu = loaiDichVu,
        MucGia = mucGia,
        ThoiGianDuKienVao = thoiGianDuKienVao,
        ThoiHanThue = thoiHanThue,
        YeuCauKhac = yeuCauKhac,
        TrangThai = "DangXuLy"
    };

    public void KiemTraDieuKien(DateTime thoiDiemHienTai)
    {
        if (string.IsNullOrWhiteSpace(MaKH))
            throw new InvalidOperationException("Thông tin khách hàng không hợp lệ.");
        if (string.IsNullOrWhiteSpace(MaCN))
            throw new InvalidOperationException("Phiếu đăng ký chưa có chi nhánh.");
        if (ThoiGianDuKienVao.HasValue && ThoiGianDuKienVao.Value.Date < thoiDiemHienTai.Date)
            throw new InvalidOperationException("Thời gian dự kiến vào ở không được trong quá khứ.");
    }

    public static Task<PhieuDangKy?> DocChiTiet(string maPDK, string maCN) => PhieuDangKyDB.LayTheoMa(maPDK, maCN);

    public static Task<IReadOnlyList<PhieuDangKy>> TimKiem(
        string maCN, string? sdt, string? soGiayTo, string? email, string? hoTen = null, string? maPDK = null) =>
        PhieuDangKyDB.TimKiem(maCN, sdt, soGiayTo, email, hoTen, maPDK);

    public Task Them() => PhieuDangKyDB.Them(this);
}
