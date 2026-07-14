namespace HomeStay.Presentation.Contracts;

using System.ComponentModel.DataAnnotations;

public sealed class TaoLichHenHttpRequest
{
    [Required]
    public string LoaiLichHen { get; set; } = string.Empty;

    [Required]
    public string MaChungTu { get; set; } = string.Empty;

    public string MaCN { get; set; } = string.Empty;

    [Required]
    public DateTime NgayHen { get; set; }

    [Required]
    public TimeSpan GioHen { get; set; }

}
