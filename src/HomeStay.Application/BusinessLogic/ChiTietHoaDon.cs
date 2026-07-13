namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ChiTietHoaDon
{
    public string MaHoaDon { get; set; } = string.Empty;
    public int STT { get; set; }
    public string LoaiKhoanThu { get; set; } = string.Empty;
    public string? MaDV { get; set; }
    public string? MaTS { get; set; }
    public string? MaGiuong { get; set; }
    public decimal SoLuong { get; set; }
    public string? DonViTinh { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien => SoLuong * DonGia;

    public static async Task<bool> TaoChiTietHoaDon(string maHoaDon, IReadOnlyList<ChiTietHoaDon> dsChiTiet)
    {
        if (string.IsNullOrWhiteSpace(maHoaDon))
            throw new ArgumentException("Mã hóa đơn không được để trống.", nameof(maHoaDon));
        if (dsChiTiet is null || dsChiTiet.Count == 0)
            throw new ArgumentException("Hóa đơn bồi thường phải có ít nhất một dòng chi tiết.");

        var stt = 1;
        foreach (var item in dsChiTiet)
        {
            if (string.IsNullOrWhiteSpace(item.MaTS))
                throw new ArgumentException("Mỗi dòng bồi thường phải gắn mã tài sản.");
            if (item.SoLuong <= 0)
                throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");
            if (item.DonGia < 0)
                throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");

            item.MaHoaDon = maHoaDon;
            item.STT = stt++;
            item.LoaiKhoanThu = "BoiThuong";
            item.MaDV = null;
            item.MaGiuong = null;
            item.DonViTinh ??= "món";

            await ChiTietHoaDonDB.InsertChiTietHoaDon(item);
        }

        return true;
    }
}
