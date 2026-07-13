namespace HomeStay.Application.BusinessLogic;

public sealed class DichVu
{
    public string MaDV { get; set; } = string.Empty;
    public string TenDV { get; set; } = string.Empty;
    public decimal DonGia { get; set; }
    public string? DonViTinh { get; set; }
}
