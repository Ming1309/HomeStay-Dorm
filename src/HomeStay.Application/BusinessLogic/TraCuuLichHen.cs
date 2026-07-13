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

    public async Task<IReadOnlyList<LichHen>> ThucHien(string? keyword, DateTime? date, TimeSpan? time)
    {
        using var phien = _taoPhienDuLieu();
        return await LichHenDB.TraCuuLichHenTongQuat(keyword, date, time);
    }
}
