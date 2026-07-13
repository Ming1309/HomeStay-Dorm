namespace HomeStay.Presentation.Contracts;

public sealed class TaoPhieuThuHttpRequest
{
    public string MaPDS { get; set; } = string.Empty;
    public decimal SoTienThu { get; set; }
    public string PhuongThucThanhToan { get; set; } = string.Empty;
    public string? AnhMinhChung { get; set; }
}
