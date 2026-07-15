namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;
using HomeStay.Application.DataAccess.DbConnections;

public sealed class TraCuuLichHen
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;

    public TraCuuLichHen(Func<PhienDuLieu> taoPhienDuLieu)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
    }

    public async Task<IReadOnlyList<LichHen>> ThucHien(string? keyword, DateTime? date, TimeSpan? time, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await LichHenDB.TraCuuLichHenTongQuat(nhanVien.MaCN, keyword, date, time);
    }
}
