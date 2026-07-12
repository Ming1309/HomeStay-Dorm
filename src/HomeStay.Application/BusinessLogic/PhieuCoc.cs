namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class PhieuCoc
{
    public string MaPhieuCoc { get; set; } = string.Empty;
    public DateTime? HanThanhToan { get; set; }
    public string HinhThucThue { get; set; } = string.Empty;
    public int SoGiuongThue { get; set; }
    public decimal TongTien { get; set; }
    public DateTime ThoiDiemCoc { get; set; }
    public string? AnhMinhChung { get; set; }
    public string TrangThai { get; set; } = "KhoiTao";
    public string MaKH { get; set; } = string.Empty;
    public string MaPhong { get; set; } = string.Empty;
    public string? MaNV { get; set; }
    public List<Giuong> Giuongs { get; set; } = [];
    public List<ThanhVienDangKy> ThanhViens { get; set; } = [];

    public static PhieuCoc TaoMoi(string hinhThucThue, KhachHang khachHang, Phong phong,
        IReadOnlyList<Giuong> giuongs, string? maNhanVien, DateTime thoiDiem)
    {
        if (hinhThucThue is not ("NguyenCan" or "OGhep"))
            throw new InvalidOperationException("Hình thức thuê không hợp lệ.");
        var maPhieu = $"PC{thoiDiem:yyyyMMddHHmmssfff}";
        return new PhieuCoc
        {
            MaPhieuCoc = maPhieu,
            HanThanhToan = thoiDiem.AddHours(24),
            HinhThucThue = hinhThucThue,
            SoGiuongThue = giuongs.Count,
            TongTien = phong.TinhTienCoc(giuongs.Count),
            ThoiDiemCoc = thoiDiem,
            MaKH = khachHang.MaKH,
            MaPhong = phong.MaPhong,
            MaNV = maNhanVien,
            Giuongs = giuongs.ToList(),
            ThanhViens = [new ThanhVienDangKy { MaPhieuCoc = maPhieu, MaKH = khachHang.MaKH }]
        };
    }

    public Task Them() => PhieuCocDB.Them(this);
}
