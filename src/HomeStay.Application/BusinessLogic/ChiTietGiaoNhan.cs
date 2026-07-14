namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ChiTietGiaoNhan
{
    public static readonly HashSet<string> TinhTrangHopLe = new(StringComparer.OrdinalIgnoreCase)
    {
        "Mới",
        "Bình thường",
        "Hư hỏng",
        "Mất mát",
    };

    public string MaBienBan { get; set; } = string.Empty;
    public string MaTS { get; set; } = string.Empty;
    public string TinhTrang { get; set; } = string.Empty;
    public int SoLuong { get; set; }
    public string? GhiChu { get; set; }
    public string? MinhChung { get; set; }
    public string? TenTaiSan { get; set; }
    public int SoLuongTieuChuan { get; set; }
    public decimal? GiaTriGoiY { get; set; }

    public void KiemTraHopLe()
    {
        if (string.IsNullOrWhiteSpace(MaTS))
            throw new ArgumentException("Vui lòng nhập đầy đủ tình trạng tài sản");

        if (string.IsNullOrWhiteSpace(TinhTrang) || !TinhTrangHopLe.Contains(TinhTrang.Trim()))
            throw new ArgumentException("Vui lòng nhập đầy đủ tình trạng tài sản");

        if (SoLuong < 0)
            throw new ArgumentException("Số lượng thu hồi không hợp lệ");

        if (SoLuongTieuChuan > 0 && SoLuong > SoLuongTieuChuan)
            throw new ArgumentException($"Số lượng thu hồi của {TenTaiSan ?? MaTS} không thể lớn hơn số lượng chuẩn");
    }

    public static Task ThemNhieu(IEnumerable<ChiTietGiaoNhan> chiTiet) =>
        ChiTietGiaoNhanDB.ThemNhieu(chiTiet);

    public static Task<IReadOnlyList<ChiTietGiaoNhan>> LayDSTaiSanHuHongTheoBienBan(string maBienBan) =>
        ChiTietGiaoNhanDB.GetDSTaiSanHuHongTheoBienBan(maBienBan);
}
