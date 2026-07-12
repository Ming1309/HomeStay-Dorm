namespace HomeStay.Application.BusinessLogic;

public sealed class Giuong
{
    public string MaGiuong { get; set; } = string.Empty;
    public string SoGiuong { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public string MaPhong { get; set; } = string.Empty;

    public void GiuCho(string maPhong)
    {
        if (MaPhong != maPhong || TrangThai != "Trong")
            throw new InvalidOperationException($"Giường {MaGiuong} không còn hợp lệ để giữ chỗ.");
        TrangThai = "GiuCho";
    }
}
