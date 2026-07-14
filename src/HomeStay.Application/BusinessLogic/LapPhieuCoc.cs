namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class LapPhieuCoc
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public LapPhieuCoc(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<LichHen>> LayDanhSachKhachChoCoc()
    {
        using var phien = _taoPhienDuLieu();
        return await LichHen.LayDanhSachKhachChoCoc();
    }

    public async Task<IReadOnlyList<LichHen>> TimKiemKhachChoCoc(string text)
    {
        using var phien = _taoPhienDuLieu();
        return await LichHen.LayDanhSachKhachChoCoc(text);
    }

    public async Task<LichHen?> LayChiTietLichHen(string maLichHen)
    {
        using var phien = _taoPhienDuLieu();
        return await LichHen.DocChiTiet(maLichHen);
    }

    public async Task<IReadOnlyList<Phong>> LayPhongOGhep(int soLuong, string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax)
    {
        using var phien = _taoPhienDuLieu();
        return await Phong.LayPhongOGhep(soLuong, toaNha, loaiPhong, giaMin, giaMax);
    }

    public async Task<IReadOnlyList<Phong>> LayPhongNguyenCan(string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax)
    {
        using var phien = _taoPhienDuLieu();
        return await Phong.LayPhongNguyenCan(toaNha, loaiPhong, giaMin, giaMax);
    }

    public async Task<PhieuCoc> TaoPhieuCoc(string maLichHen, KhachHang thongTinKhachHang,
        string maPhong, IEnumerable<string> danhSachGiuong, string hinhThucThue, string? maNhanVien)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var lichHen = await LichHen.DocChiTiet(maLichHen)
                ?? throw new InvalidOperationException("Không tìm thấy lịch hẹn.");
            lichHen.KiemTraCoTheLapPhieuCoc();

            var khachHang = lichHen.KhachHang!;
            if (khachHang.CapNhatTu(thongTinKhachHang))
                await khachHang.CapNhat();

            var phong = await Phong.DocChiTiet(maPhong)
                ?? throw new InvalidOperationException("Không tìm thấy phòng.");
            var giuongs = hinhThucThue == "NguyenCan"
                ? phong.GiuNguyenPhong()
                : phong.GiuGiuong(danhSachGiuong);

            var maMoi = await DataAccess.DBs.MaTuDongDB.TaoMaMoi("PhieuCoc", "MaPhieuCoc", "PC");
            var phieuCoc = PhieuCoc.TaoMoi(maMoi, hinhThucThue, khachHang, phong, giuongs,
                maNhanVien, _timeProvider.GetLocalNow().DateTime);
            lichHen.GanPhieuCoc(phieuCoc.MaPhieuCoc);

            await phieuCoc.Them();
            await phong.CapNhat();
            await lichHen.LuuPhieuCoc();
            phien.Commit();
            return phieuCoc;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
