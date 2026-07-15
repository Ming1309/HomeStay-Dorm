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

    public async Task<IReadOnlyList<dynamic>> TaiDanhSachChungTu(string loaiLichHen, string? tuKhoa, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return loaiLichHen switch
        {
            "XemPhong" => await PhieuDangKyDB.TimKiemPhieuDuDieuKien(nhanVien.MaCN, tuKhoa),
            "NhanPhong" => await PhieuCocDB.TimKiemPhieuDaDuyet(nhanVien.MaCN, tuKhoa),
            "TraPhong" => await HopDongDB.TimKiemHopDongHieuLuc(nhanVien.MaCN, tuKhoa),
            _ => throw new ArgumentException("Loại lịch hẹn không hợp lệ.")
        };
    }

    public async Task<LichHen> LuuLichHen(string loai, string maChungTu, DateTime ngayHen, TimeSpan gioHen, string maNV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var thoiDiem = _timeProvider.GetLocalNow().DateTime;
            var nhanVien = await NhanVien.DocPhamVi(maNV);
            var lichHen = LichHen.TaoMoi(loai, maChungTu, nhanVien.MaCN, ngayHen, gioHen, maNV, thoiDiem);

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
