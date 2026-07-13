namespace HomeStay.Presentation.Contracts;

// HTTP transport contract only. LapPhieuDangKy is the use-case boundary.
public sealed class TaoPhieuDangKyHttpRequest
{
    // Thông tin cá nhân khách hàng
    public string HoTen { get; set; } = string.Empty;
    public string? GioiTinh { get; set; }
    public string? SDT { get; set; }
    public string? Email { get; set; }
    public string? DiaChiThuongTru { get; set; }
    public string? LoaiGiayTo { get; set; }
    public string SoGiayTo { get; set; } = string.Empty;

    // Thông tin lưu trú mong muốn
    public string? KhuVuc { get; set; }
    public int? SoLuongNguoi { get; set; }
    public string? LoaiDichVu { get; set; }
    public decimal? MucGia { get; set; }
    public DateTime? ThoiGianDuKienVao { get; set; }
    public int? ThoiHanThue { get; set; }
    public string? YeuCauKhac { get; set; }

    // Nhân viên sale phụ trách
    public string? MaNV { get; set; }
}
