namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

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

    public static Task CapNhatDanhSachDaCoc(IReadOnlyList<string> dsMaGiuong) =>
        GiuongDB.UpdateTrangThaiBatch(dsMaGiuong, "DaCoc");

    public static Task CapNhatDanhSachTrong(IReadOnlyList<string> dsMaGiuong) =>
        GiuongDB.UpdateTrangThaiBatch(dsMaGiuong, "Trong");

    public static async Task CapNhatTrangThaiTrong(string maGiuong)
    {
        if (string.IsNullOrWhiteSpace(maGiuong))
            throw new ArgumentException("Mã giường không được để trống.");
        if (!await GiuongDB.UpdateTrangThai(maGiuong.Trim(), "Trong"))
            throw new InvalidOperationException($"Giường {maGiuong} không thể cập nhật trạng thái Trống.");
    }

    public static Task CapNhatDangSuDungTheoHD(string maHD) =>
        GiuongDB.UpdateTrangThaiTheoHopDong(maHD, "DangSuDung");

    public void GiaiPhong(string maPhong)
    {
        if (MaPhong != maPhong)
            throw new InvalidOperationException($"Giường {MaGiuong} không thuộc phòng {maPhong}.");
            
        if (TrangThai == "Trong") return;

        if (TrangThai is not ("GiuCho" or "DaCoc"))
            throw new InvalidOperationException($"Giường {MaGiuong} không còn hợp lệ để giải phóng.");
            
        TrangThai = "Trong";
    }
}
