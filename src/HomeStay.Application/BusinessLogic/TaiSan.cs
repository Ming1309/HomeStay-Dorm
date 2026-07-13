namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class TaiSan
{
    public string MaTS { get; set; } = string.Empty;
    public string TenTaiSan { get; set; } = string.Empty;
    public decimal GiaTri { get; set; }

    public static Task<TaiSan?> LayThongTinTaiSan(string maTS) =>
        TaiSanDB.GetTaiSanTheoMaTS(maTS);
}
