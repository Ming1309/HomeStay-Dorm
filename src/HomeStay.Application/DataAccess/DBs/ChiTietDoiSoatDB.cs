using System.Collections.Generic;
using System.Threading.Tasks;
using HomeStay.Application.BusinessLogic;

namespace HomeStay.Application.DataAccess.DBs;

public static class ChiTietDoiSoatDB
{
    public static Task<IReadOnlyList<HoaDon>> GetDSHoaDonThuocPhieuDoiSoat(string maPDS) =>
        HoaDonDB.GetDSHoaDonTheoMaPDS(maPDS);
}
