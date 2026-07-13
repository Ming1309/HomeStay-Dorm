namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class DichVuHopDong
{
    public string MaHD { get; set; } = string.Empty;
    public string MaDV { get; set; } = string.Empty;
    public decimal DonGiaKyKet { get; set; }
    public DichVu DichVu { get; set; } = new();

    public static Task<IReadOnlyList<DichVuHopDong>> LayDanhSachTheoHopDong(string maHD) =>
        DichVuHopDongDB.LayDanhSachTheoHopDong(maHD);
}
