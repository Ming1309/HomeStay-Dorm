namespace HomeStay.Presentation.Contracts;

using HomeStay.Application.BusinessLogic;

// HTTP transport contract only. MHLapPhieuCoc is the use-case boundary.
public sealed class TaoPhieuCocHttpRequest
{
    public string MaLichHen { get; set; } = string.Empty;
    public KhachHang KhachHang { get; set; } = new();
    public string MaPhong { get; set; } = string.Empty;
    public List<string> DanhSachGiuong { get; set; } = [];
    public string HinhThucThue { get; set; } = string.Empty;
    public string? MaNV { get; set; }
}
