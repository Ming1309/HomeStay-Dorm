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

    public void XacNhanDaCoc(string maPhong)
    {
        if (MaPhong != maPhong || TrangThai != "GiuCho")
            throw new InvalidOperationException($"Giường {MaGiuong} không còn ở trạng thái giữ chỗ.");
        TrangThai = "DaCoc";
    }

    public void GiaiPhong(string maPhong)
    {
        if (MaPhong != maPhong || TrangThai is not ("GiuCho" or "DaCoc"))
            throw new InvalidOperationException($"Giường {MaGiuong} không còn hợp lệ để giải phóng.");
        TrangThai = "Trong";
    }
}
