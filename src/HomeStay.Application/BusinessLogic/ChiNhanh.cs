namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ChiNhanh
{
    public string MaCN { get; set; } = string.Empty;
    public string TenChiNhanh { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public string SDT { get; set; } = string.Empty;

    public static Task<IReadOnlyList<ChiNhanh>> LayDanhSach() => ChiNhanhDB.LayDanhSach();

    public static Task<bool> TonTai(string maCN) => ChiNhanhDB.TonTai(maCN);
}
