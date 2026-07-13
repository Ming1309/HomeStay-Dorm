namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class SuaLichHen
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;

    public SuaLichHen(Func<PhienDuLieu> taoPhienDuLieu)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
    }

    public async Task<LichHen> ThucHien(string maLH, DateTime ngay, TimeSpan gio, string maNV, string trangThai)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();

        var lichHen = await LichHen.DocChiTiet(maLH) 
            ?? throw new InvalidOperationException("Không tìm thấy lịch hẹn để cập nhật.");

        lichHen.CapNhatThongTin(ngay, gio, maNV, trangThai);

        await lichHen.KiemTraTrungLichCapNhat();
        await lichHen.LuuCapNhat();

        phien.Commit();
        
        return lichHen;
    }
}
