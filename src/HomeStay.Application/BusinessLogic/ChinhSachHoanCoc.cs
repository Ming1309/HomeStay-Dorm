namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ChinhSachHoanCoc
{
    public string MaChinhSach { get; set; } = string.Empty;
    public string TenChinhSach { get; set; } = string.Empty;
    public decimal TiLe_ChuaKy { get; set; }
    public decimal TiLe_TruocHan_NganHan { get; set; }
    public decimal TiLe_TruocHan_DaiHan { get; set; }
    public decimal TiLe_DungHan { get; set; }
    public int? MocLuuTru { get; set; }

    public static Task<ChinhSachHoanCoc?> LayChinhSachDangApDung() =>
        ChinhSachHoanCocDB.LayChinhSachDangApDung();

    public static Task<ChinhSachHoanCoc?> LayChinhSachTheoMa(string maChinhSach) =>
        ChinhSachHoanCocDB.GetChinhSachTheoMa(maChinhSach);

    public decimal XacDinhTyLeHoan(int soThangThucTe, int soThangHopDong)
    {
        if (soThangThucTe >= soThangHopDong)
        {
            return TiLe_DungHan;
        }

        int moc = MocLuuTru ?? 6;
        if (soThangThucTe < moc)
        {
            return TiLe_TruocHan_NganHan;
        }

        return TiLe_TruocHan_DaiHan;
    }
}
