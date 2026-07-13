namespace HomeStay.Presentation.Contracts;

public sealed class TaoPhieuDoiSoatHttpRequest
{
    public string MaHoSo { get; set; } = string.Empty;
    public string LoaiHoSo { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
}
