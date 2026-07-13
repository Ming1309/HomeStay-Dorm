namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class PhongTaiSan
{
    public string MaPhong { get; set; } = string.Empty;
    public string MaTS { get; set; } = string.Empty;
    public int SoLuongTieuChuan { get; set; }
    public TaiSan TaiSan { get; set; } = new();

    public static Task<IReadOnlyList<PhongTaiSan>> LayTaiSanTheoPhong(string maPhong) =>
        PhongTaiSanDB.LayTaiSanTheoPhong(maPhong);
}
