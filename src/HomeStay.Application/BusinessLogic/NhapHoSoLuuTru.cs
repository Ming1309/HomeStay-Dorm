namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class NhapHoSoLuuTru
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public NhapHoSoLuuTru(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoNhap(string? text = null)
    {
        using var phien = _taoPhienDuLieu();
        return await PhieuCoc.LayPhieuCocDaThanhToanNhanPhongHomNay(text);
    }

    public async Task<PhieuCoc> LayChiTiet(string maPhieuCoc)
    {
        using var phien = _taoPhienDuLieu();
        var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
        phieu.KiemTraDaThanhToan();
        var lichHen = await LichHen.DocTheoMaPhieuCoc(maPhieuCoc);
        if (lichHen is null)
            throw new InvalidOperationException("Phiếu cọc không có lịch hẹn nhận phòng hợp lệ.");
        lichHen.KiemTraLoaiNhanPhong();
        return phieu;
    }

    public async Task<PhieuCoc> NhapHoSo(string maPhieuCoc, KhachHang nguoiDaiDien,
        string hinhThucThue, List<KhachHang>? cacThanhVien)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.KiemTraDaThanhToan();
            phieu.KiemTraHinhThucThue();

            var lichHen = await LichHen.DocTheoMaPhieuCoc(maPhieuCoc);
            if (lichHen is null)
                throw new InvalidOperationException("Phiếu cọc không có lịch hẹn nhận phòng hợp lệ.");
            lichHen.KiemTraLoaiNhanPhong();
            lichHen.KiemTraTrangThaiHopLe();

            KhachHang.KiemTraThongTinBatBuoc(nguoiDaiDien);

            if (!KhachHang.KiemTraDinhDangEmail(nguoiDaiDien.Email))
                throw new InvalidOperationException("Email không đúng định dạng.");
            if (!KhachHang.KiemTraSoGiayTo(nguoiDaiDien.SoGiayTo, nguoiDaiDien.LoaiGiayTo))
                throw new InvalidOperationException("Số giấy tờ không đúng định dạng.");
            if (!KhachHang.KiemTraNgaySinh(nguoiDaiDien.NgaySinh))
                throw new InvalidOperationException("Ngày sinh không hợp lệ.");

            KhachHang.KiemTraTrungSoGiayTo(nguoiDaiDien, cacThanhVien);

            var now = _timeProvider.GetLocalNow().DateTime;

            if (hinhThucThue == "TheoNhom")
            {
                if (cacThanhVien is null || cacThanhVien.Count == 0)
                    throw new InvalidOperationException("Danh sách thành viên không được để trống khi thuê theo nhóm.");

                foreach (var tv in cacThanhVien)
                {
                    KhachHang.KiemTraThongTinBatBuoc(tv);
                    if (!KhachHang.KiemTraDinhDangEmail(tv.Email))
                        throw new InvalidOperationException($"Email của thành viên '{tv.HoTen}' không đúng định dạng.");
                    if (!KhachHang.KiemTraSoGiayTo(tv.SoGiayTo, tv.LoaiGiayTo))
                        throw new InvalidOperationException($"Số giấy tờ của thành viên '{tv.HoTen}' không đúng định dạng.");
                    if (!KhachHang.KiemTraNgaySinh(tv.NgaySinh))
                        throw new InvalidOperationException($"Ngày sinh của thành viên '{tv.HoTen}' không hợp lệ.");
                }

                phieu.KiemTraSoLuongThanhVien(1 + cacThanhVien.Count);
                phieu.Phong.KiemTraSucChua(1 + cacThanhVien.Count);
            }
            else if (hinhThucThue != "CaNhan")
            {
                throw new InvalidOperationException("Hình thức thuê không hợp lệ.");
            }

            var daiDienCu = await KhachHang.TimTheoSoGiayTo(nguoiDaiDien.SoGiayTo!);
            if (daiDienCu is not null)
            {
                nguoiDaiDien.MaKH = daiDienCu.MaKH;
                nguoiDaiDien.CapNhatTu(nguoiDaiDien);
                await nguoiDaiDien.CapNhat();
            }
            else
            {
                nguoiDaiDien.MaKH = KhachHang.TaoMaMoi(now);
                await nguoiDaiDien.ThemMoi();
            }

            var dsDangKy = new List<ThanhVienDangKy>
            {
                ThanhVienDangKy.TaoDaiDien(maPhieuCoc, nguoiDaiDien.MaKH)
            };

            if (hinhThucThue == "TheoNhom" && cacThanhVien is not null)
            {
                foreach (var tv in cacThanhVien)
                {
                    var tvCu = await KhachHang.TimTheoSoGiayTo(tv.SoGiayTo!);
                    if (tvCu is not null)
                    {
                        tv.MaKH = tvCu.MaKH;
                        tv.CapNhatTu(tv);
                        await tv.CapNhat();
                    }
                    else
                    {
                        tv.MaKH = KhachHang.TaoMaMoi(now);
                        await tv.ThemMoi();
                    }
                    var tvDangKy = ThanhVienDangKy.TaoThanhVien(maPhieuCoc, tv.MaKH);
                    tvDangKy.KiemTraVaiTroHopLe();
                    dsDangKy.Add(tvDangKy);
                }
            }

            await ThanhVienDangKy.XoaTheoPhieuCoc(maPhieuCoc);
            await ThanhVienDangKy.ThemHangLoat(dsDangKy);

            phieu.CapNhatTrangThai("ChoDuyet");
            await phieu.LuuCapNhatTrangThai();

            phien.Commit();
            return phieu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
