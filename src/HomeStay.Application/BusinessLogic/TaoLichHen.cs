namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;
using HomeStay.Application.DataAccess.DbConnections;

public sealed class TaoLichHen
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;

    public TaoLichHen(Func<PhienDuLieu> taoPhienDuLieu)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
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

        var maMoi = await MaTuDongDB.TaoMaMoi("LichHen", "MaLH", "LH");
        var lichHen = LichHen.TaoMoi(maMoi, loai, maChungTu, maCN, ngayHen, gioHen, maNV);

        lichHen.KiemTraThoiGianHopLe(DateTime.Now);
        await lichHen.KiemTraHopLe();
        await lichHen.KiemTraTrungLich();
        await lichHen.Them();

        // (Tùy chọn) Gửi thông báo
        // DichVuThongBao.GuiThongBaoLichHen(lichHen);

        phien.Commit();
        return lichHen;
    }
}
