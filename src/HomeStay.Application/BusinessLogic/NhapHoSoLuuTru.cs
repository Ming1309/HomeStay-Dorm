namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class NhapHoSoLuuTru
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly DichVuThongBao _thongBao;

    public NhapHoSoLuuTru(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider, DichVuThongBao thongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _thongBao = thongBao;
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

    public async Task<PhieuCoc> NhapHoSo(string maPhieuCoc, string diaChiThuongTru,
        List<KhachHang>? cacThanhVien)
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

            var nguoiDaiDien = phieu.KhachHang;
            if (nguoiDaiDien.MaKH != phieu.MaKH)
                throw new InvalidOperationException("Người đại diện không khớp với Phiếu cọc.");

            KhachHang.KiemTraThongTinBatBuoc(nguoiDaiDien);
            if (!KhachHang.KiemTraDinhDangEmail(nguoiDaiDien.Email))
                throw new InvalidOperationException("Email không đúng định dạng.");
            if (!KhachHang.KiemTraSoGiayTo(nguoiDaiDien.SoGiayTo, nguoiDaiDien.LoaiGiayTo))
                throw new InvalidOperationException("Số giấy tờ không đúng định dạng.");
            if (!KhachHang.KiemTraNgaySinh(nguoiDaiDien.NgaySinh))
                throw new InvalidOperationException("Ngày sinh không hợp lệ.");

            cacThanhVien ??= [];
            foreach (var thanhVien in cacThanhVien)
                thanhVien.ChuanHoaThongTinNhanDang();

            KhachHang.KiemTraTrungSoGiayTo(nguoiDaiDien, cacThanhVien);

            foreach (var tv in cacThanhVien)
            {
                KhachHang.KiemTraThongTinBatBuoc(tv);
                if (!KhachHang.KiemTraDinhDangEmail(tv.Email))
                    throw new InvalidOperationException($"Email của thành viên '{tv.HoTen}' không đúng định dạng.");
                if (!KhachHang.KiemTraSoGiayTo(tv.SoGiayTo, tv.LoaiGiayTo))
                    throw new InvalidOperationException($"Số giấy tờ của thành viên '{tv.HoTen}' không đúng định dạng.");
                if (!KhachHang.KiemTraNgaySinh(tv.NgaySinh))
                    throw new InvalidOperationException($"Ngày sinh của thành viên '{tv.HoTen}' không hợp lệ.");
                if (await KhachHang.TimTheoSoGiayTo(tv.SoGiayTo!) is not null)
                    throw new InvalidOperationException(
                        $"Số giấy tờ '{tv.SoGiayTo}' đã tồn tại trong hệ thống.");
            }

            phieu.KiemTraSoLuongThanhVien(1 + cacThanhVien.Count);
            phieu.Phong.KiemTraSucChua(1 + cacThanhVien.Count);

            nguoiDaiDien.CapNhatDiaChiThuongTru(diaChiThuongTru);
            await nguoiDaiDien.LuuDiaChiThuongTru();

            var dsDangKy = new List<ThanhVienDangKy>
            {
                ThanhVienDangKy.TaoDaiDien(maPhieuCoc, phieu.MaKH)
            };

            foreach (var tv in cacThanhVien)
            {
                tv.MaKH = await KhachHang.TaoMaMoi();
                await tv.Them();
                var tvDangKy = ThanhVienDangKy.TaoThanhVien(maPhieuCoc, tv.MaKH);
                tvDangKy.KiemTraVaiTroHopLe();
                dsDangKy.Add(tvDangKy);
            }

            await ThanhVienDangKy.XoaTheoPhieuCoc(maPhieuCoc);
            await ThanhVienDangKy.ThemHangLoat(dsDangKy);

            phieu.CapNhatTrangThai("ChoDuyet");
            await phieu.LuuCapNhatTrangThai();
            await _thongBao.DongTacVu(
                LoaiSuKienThongBao.TienCocDaXacNhan, phieu.MaPhieuCoc, phieu.MaNV);
            await _thongBao.PhatCanXuLyTheoVaiTro(
                LoaiSuKienThongBao.HoSoLuuTruChoDuyet,
                phieu.MaCN,
                "QuanLy",
                "Hồ sơ lưu trú cần xét duyệt",
                $"Phiếu {phieu.MaPhieuCoc} của {phieu.KhachHang.HoTen} đã gửi hồ sơ lưu trú.",
                $"/manager/approval?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
                phieu.MaPhieuCoc,
                phieu.MaNV);

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
