namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class SuaLichHen
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public SuaLichHen(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<LichHen> ThucHien(string maLH, DateTime ngay, TimeSpan gio, string maNV, string trangThai)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var lichHen = await LichHen.DocChiTiet(maLH)
                ?? throw new InvalidOperationException("Không tìm thấy lịch hẹn để cập nhật.");

            lichHen.CapNhatThongTin(ngay, gio, maNV, trangThai);

            if (lichHen.TrangThai == "DaXacNhan")
                lichHen.KiemTraThoiGianHopLe(_timeProvider.GetLocalNow().DateTime);

            await lichHen.KiemTraTrungLichCapNhat();
            await lichHen.LuuCapNhat();

            phien.Commit();
            return lichHen;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
