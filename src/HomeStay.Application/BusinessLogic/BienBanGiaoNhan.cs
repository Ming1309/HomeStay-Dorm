namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class BienBanGiaoNhan
{
    public string MaBienBan { get; set; } = string.Empty;
    public DateTime NgayBanGiao { get; set; }
    public string LoaiBienBan { get; set; } = string.Empty;
    public string MaHD { get; set; } = string.Empty;
    public string? MaNV { get; set; }
    public List<ChiTietGiaoNhan> ChiTiet { get; set; } = [];

    // Display fields for UC 1.4.20 list/detail
    public string? TenKhachHang { get; set; }
    public string? SoPhong { get; set; }
    public string? ToaNha { get; set; }
    public string? TenNguoiLap { get; set; }

    public static BienBanGiaoNhan KhoiTaoBanGiao(
        string maBienBan,
        string maHD,
        string? maNV,
        DateTime ngayBanGiao,
        IEnumerable<ChiTietGiaoNhan> chiTiet)
    {
        var bienBan = new BienBanGiaoNhan
        {
            MaBienBan = maBienBan,
            NgayBanGiao = ngayBanGiao.Date,
            LoaiBienBan = "BanGiao",
            MaHD = maHD,
            MaNV = maNV,
            ChiTiet = chiTiet.ToList(),
        };

        foreach (var item in bienBan.ChiTiet)
            item.MaBienBan = bienBan.MaBienBan;

        return bienBan;
    }

    public static BienBanGiaoNhan KhoiTaoThuHoi(
        string maBienBan,
        string maHD,
        string? maNV,
        DateTime ngayBanGiao,
        IEnumerable<ChiTietGiaoNhan> chiTiet)
    {
        var bienBan = new BienBanGiaoNhan
        {
            MaBienBan = maBienBan,
            NgayBanGiao = ngayBanGiao.Date,
            LoaiBienBan = "ThuHoi",
            MaHD = maHD,
            MaNV = maNV,
            ChiTiet = chiTiet.ToList(),
        };

        foreach (var item in bienBan.ChiTiet)
            item.MaBienBan = bienBan.MaBienBan;

        return bienBan;
    }

    public void KiemTraDuLieuTaiSan()
    {
        if (ChiTiet.Count == 0)
            throw new ArgumentException("Vui lòng nhập đầy đủ tình trạng tài sản");

        foreach (var item in ChiTiet)
            item.KiemTraHopLe();
    }

    public static Task<bool> TonTaiThuHoiTheoHD(string maHD) =>
        BienBanGiaoNhanDB.TonTaiThuHoiTheoHD(maHD);

    public static Task<bool> TonTaiBanGiaoTheoHD(string maHD) =>
        BienBanGiaoNhanDB.TonTaiBanGiaoTheoHD(maHD);

    public Task LuuBienBan() => BienBanGiaoNhanDB.Them(this);

    public static Task<IReadOnlyList<BienBanGiaoNhan>> LayDSBienBanThuHoiChuaXuLy(string? text = null) =>
        BienBanGiaoNhanDB.GetDSBienBanThuHoiChuaXuLy(text);

    public static Task<BienBanGiaoNhan?> LayChiTietBienBan(string maBienBan) =>
        BienBanGiaoNhanDB.GetBienBanTheoMaBienBan(maBienBan);

    public static Task<bool> DaCoHoaDonBoiThuongTheoHD(string maHD) =>
        BienBanGiaoNhanDB.DaCoHoaDonBoiThuongTheoHD(maHD);
}
