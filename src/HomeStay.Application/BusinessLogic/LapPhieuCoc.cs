namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class LapPhieuCoc
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly DichVuThongBao _thongBao;

    public LapPhieuCoc(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider, DichVuThongBao thongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _thongBao = thongBao;
    }

    public async Task<IReadOnlyList<LichHen>> LayDanhSachKhachChoCoc(string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await LichHen.LayDanhSachKhachChoCoc(nhanVien.MaCN);
    }

    public async Task<IReadOnlyList<LichHen>> TimKiemKhachChoCoc(string text, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await LichHen.LayDanhSachKhachChoCoc(nhanVien.MaCN, text);
    }

    public async Task<LichHen?> LayChiTietLichHen(string maLichHen, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await LichHen.DocChiTiet(maLichHen, nhanVien.MaCN);
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
            var nhanVien = await NhanVien.DocPhamVi(maNhanVien);
            var lichHen = await LichHen.DocChiTiet(maLichHen, nhanVien.MaCN, khoaCapNhat: true)
                ?? throw new InvalidOperationException("Không tìm thấy lịch hẹn.");
            lichHen.KiemTraCoTheLapPhieuCoc();

            var khachHang = lichHen.KhachHang!;
            if (khachHang.CapNhatTu(thongTinKhachHang))
                await khachHang.CapNhat();

            var phong = await Phong.DocChiTiet(maPhong)
                ?? throw new InvalidOperationException("Không tìm thấy phòng.");
            nhanVien.KiemTraCungChiNhanh(phong.MaCN);
            var giuongs = hinhThucThue == "NguyenCan"
                ? phong.GiuNguyenPhong()
                : phong.GiuGiuong(danhSachGiuong);

            var phieuCoc = PhieuCoc.TaoMoi(hinhThucThue, khachHang, phong, giuongs,
                maNhanVien, _timeProvider.GetLocalNow().DateTime);
            lichHen.GanPhieuCoc(phieuCoc.MaPhieuCoc);

            await phieuCoc.Them();
            await phong.CapNhat();
            await lichHen.LuuPhieuCoc();
            await _thongBao.PhatCanXuLyTheoVaiTro(
                LoaiSuKienThongBao.PhieuCocChoTinhTien,
                phieuCoc.MaCN,
                "KeToan",
                "Phiếu cọc mới cần tính tiền",
                $"Phiếu cọc {phieuCoc.MaPhieuCoc} của {khachHang.HoTen} đang chờ xác định số tiền cọc.",
                $"/accountant/deposit-calc?maPhieuCoc={Uri.EscapeDataString(phieuCoc.MaPhieuCoc)}",
                phieuCoc.MaPhieuCoc,
                maNhanVien);
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
