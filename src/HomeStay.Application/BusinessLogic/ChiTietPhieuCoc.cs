namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ChiTietPhieuCoc
{
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string MaGiuong { get; set; } = string.Empty;

    public static Task<IReadOnlyList<ChiTietPhieuCoc>> LayDanhSachGiuongTheoPhieuCoc(string maPhieuCoc) =>
        ChiTietPhieuCocDB.GetByMaPhieuCoc(maPhieuCoc);

    public static Task<int> DemSoGiuongDaCoc(string maPhieuCoc) =>
        ChiTietPhieuCocDB.CountByMaPhieuCoc(maPhieuCoc);
}
