using System.Collections.Generic;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DBs;

namespace HomeStay.Application.BusinessLogic;

public sealed class ChiTietDoiSoat
{
    public string MaPDS { get; set; } = string.Empty;
    public string MaHoaDon { get; set; } = string.Empty;

    public static Task<IReadOnlyList<HoaDon>> LayDSHoaDonThuocPhieuDoiSoat(string maPDS) =>
        ChiTietDoiSoatDB.GetDSHoaDonThuocPhieuDoiSoat(maPDS);
}
