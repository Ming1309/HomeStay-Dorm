using System.ComponentModel.DataAnnotations;

namespace HomeStay.Presentation.Contracts;

public sealed class TaoPhieuHoanCocHttpRequest
{
    [Required]
    public string MaPDS { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền hoàn phải lớn hơn 0.")]
    public decimal SoTienHoan { get; set; }

    [Required]
    public string PhuongThucHoan { get; set; } = string.Empty;

    public string ThongTinNhanTien { get; set; } = string.Empty;
}
