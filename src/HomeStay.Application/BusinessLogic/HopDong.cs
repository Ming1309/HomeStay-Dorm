namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class HopDong
{
    public string MaHD { get; set; } = string.Empty;
    public string MaPhieuCoc { get; set; } = string.Empty;

    public static Task<bool> TonTaiTheoPhieuCoc(string maPhieuCoc) =>
        HopDongDB.TonTaiTheoPhieuCoc(maPhieuCoc);
}
