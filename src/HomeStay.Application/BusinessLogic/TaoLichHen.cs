namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;
using HomeStay.Application.DataAccess.DbConnections;

public sealed class TaoLichHen
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public TaoLichHen(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<dynamic>> TaiDanhSachChungTu(string loaiLichHen, string? tuKhoa)
    {
        using var phien = _taoPhienDuLieu();
        return loaiLichHen switch
        {
            "XemPhong" => await PhieuDangKyDB.TimKiemPhieuDuDieuKien(tuKhoa),
            "NhanPhong" => await PhieuCocDB.TimKiemPhieuDaDuyet(tuKhoa),
            "TraPhong" => await HopDongDB.TimKiemHopDongHieuLuc(tuKhoa),
            _ => throw new ArgumentException("Loại lịch hẹn không hợp lệ.")
        };
    }

    public async Task<LichHen> LuuLichHen(string loai, string maChungTu, string maCN, DateTime ngayHen, TimeSpan gioHen, string maNV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var thoiDiem = _timeProvider.GetLocalNow().DateTime;
            var lichHen = LichHen.TaoMoi(loai, maChungTu, maCN, ngayHen, gioHen, maNV, thoiDiem);

            lichHen.KiemTraThoiGianHopLe(thoiDiem);
            await lichHen.KiemTraHopLe();
            await lichHen.KiemTraTrungLich();
            await lichHen.Them();

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
