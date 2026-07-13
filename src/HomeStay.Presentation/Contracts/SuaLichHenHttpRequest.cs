namespace HomeStay.Presentation.Contracts;

public sealed class SuaLichHenHttpRequest
{
    public DateTime NgayHen { get; set; }
    public TimeSpan GioHen { get; set; }
    public string MaNV { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
}
