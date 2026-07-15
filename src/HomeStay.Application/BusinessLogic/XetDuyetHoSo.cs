namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class XetDuyetHoSo(
    Func<PhienDuLieu> taoPhienDuLieu,
    DichVuThongBao thongBao)
{
    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDuyet(string? text = null)
    {
        using var phien = taoPhienDuLieu();
        return await PhieuCoc.LayDanhSachChoDuyet(text);
    }

    public async Task<PhieuCoc> LayChiTiet(string maPhieuCoc)
    {
        using var phien = taoPhienDuLieu();
        var phieu = await PhieuCoc.LayChiTietChoDuyet(maPhieuCoc)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
        return phieu;
    }

    public async Task<PhieuCoc> DuyetToanBo(string maPhieuCoc, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.LayChiTietChoDuyet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.KiemTraCoTheXetDuyet();

            var coDaiDien = await ThanhVienDangKy.KiemTraTonTaiDaiDien(maPhieuCoc);
            if (!coDaiDien)
                throw new InvalidOperationException("Phiếu cọc không có người đại diện hợp lệ.");

            var dsKhach = await KhachHang.LayDanhSachKhachTheoPhieuCoc(maPhieuCoc);
            if (!phieu.Phong.KiemTraSucChua(dsKhach.Count, phieu.SoGiuongThue, phieu.Phong.LoaiPhong.SucChua, phieu.HinhThucThue))
                throw new InvalidOperationException("Số lượng thành viên vượt quá sức chứa.");
            if (!phieu.Phong.KiemTraGioiTinhChoPhep(dsKhach))
                throw new InvalidOperationException("Phòng không phù hợp giới tính với khách hàng.");

            await ThanhVienDangKy.DuyetTatCaThanhVien(maPhieuCoc);
            phieu.CapNhatTrangThaiDaDuyet();
            await phieu.CapNhatTrangThaiDaDuyetDB();

            await Giuong.CapNhatDanhSachDaCoc(
                phieu.Giuongs.Select(g => g.MaGiuong).ToList());

            await ThongBaoDuyetThanhCong(phieu, maNV);

            phien.Commit();
            return phieu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task TuChoiThanhVien(string maPhieuCoc, string maKH)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.KiemTraCoTheXetDuyet();

            var thanhVien = (await ThanhVienDangKy.LayDanhSachThanhVien(maPhieuCoc))
                .FirstOrDefault(tv => tv.MaKH == maKH)
                ?? throw new KeyNotFoundException("Không tìm thấy thành viên trong phiếu cọc.");

            if (thanhVien.VaiTro == "DaiDien")
                throw new InvalidOperationException("Không thể từ chối người đại diện. Vui lòng từ chối toàn bộ hồ sơ.");

            await ThanhVienDangKy.DanhDauTuChoi(maPhieuCoc, maKH);
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<PhieuCoc> DuyetThanhVienConLai(string maPhieuCoc, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.LayChiTietChoDuyet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.KiemTraCoTheXetDuyet();

            var coDaiDien = await ThanhVienDangKy.KiemTraTonTaiDaiDien(maPhieuCoc);
            if (!coDaiDien)
                throw new InvalidOperationException("Không thể duyệt: người đại diện đã bị từ chối.");

            await ThanhVienDangKy.DuyetThanhVienConLai(maPhieuCoc);

            var dsThanhVienMoi = await ThanhVienDangKy.LayDanhSachThanhVien(maPhieuCoc);
            phieu.ThanhViens = dsThanhVienMoi.ToList();
            var soLuongHopLe = await ThanhVienDangKy.DemThanhVienHopLe(maPhieuCoc);
            var dsKhach = await KhachHang.LayDanhSachKhachTheoPhieuCoc(maPhieuCoc);
            var dsKhachHopLe = dsKhach.Where(k =>
                dsThanhVienMoi.Any(tv => tv.MaKH == k.MaKH && tv.TrangThaiDuyet == "HopLe")).ToList();

            if (!phieu.Phong.KiemTraSucChua(soLuongHopLe, phieu.SoGiuongThue, phieu.Phong.LoaiPhong.SucChua, phieu.HinhThucThue))
                throw new InvalidOperationException("Số lượng thành viên vượt quá sức chứa.");
            if (!phieu.Phong.KiemTraGioiTinhChoPhep(dsKhachHopLe))
                throw new InvalidOperationException("Phòng không phù hợp giới tính với khách hàng.");

            phieu.CapNhatTrangThaiDaDuyet();
            await phieu.CapNhatTrangThaiDaDuyetDB();

            await Giuong.CapNhatDanhSachDaCoc(
                phieu.Giuongs.Select(g => g.MaGiuong).ToList());

            await ThongBaoDuyetThanhCong(phieu, maNV);

            phien.Commit();
            return phieu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task TuChoiHoSo(string maPhieuCoc, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.LayChiTietChoDuyet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");

            await ThanhVienDangKy.TuChoiTatCaThanhVien(maPhieuCoc);

            phieu.CapNhatTrangThaiDaHuy();
            await phieu.CapNhatTrangThaiDaHuyDB();

            await Giuong.CapNhatDanhSachTrong(
                phieu.Giuongs.Select(g => g.MaGiuong).ToList());

            await thongBao.DongTacVu(
                LoaiSuKienThongBao.HoSoLuuTruChoDuyet, phieu.MaPhieuCoc, maNV);
            await thongBao.PhatThongTin(
                LoaiSuKienThongBao.HoSoLuuTruBiTuChoi,
                phieu.MaCN,
                "Sale",
                phieu.MaNV,
                "Hồ sơ lưu trú bị từ chối",
                $"Hồ sơ {phieu.MaPhieuCoc} đã bị Quản lý từ chối. Vui lòng thông báo lại cho khách hàng.",
                $"/sale/tra-cuu-phieu-coc?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
                phieu.MaPhieuCoc,
                maNV,
                tone: "red",
                loaiThongBao: "CanhBao");

            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task HoanTacThanhVien(string maPhieuCoc, string maKH)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            if (phieu.TrangThai != "ChoDuyet")
                throw new InvalidOperationException("Phiếu cọc không còn ở trạng thái chờ duyệt.");

            await ThanhVienDangKy.HoanTac(maPhieuCoc, maKH);
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    private async Task ThongBaoDuyetThanhCong(PhieuCoc phieu, string? maNV)
    {
        await thongBao.DongTacVu(
            LoaiSuKienThongBao.HoSoLuuTruChoDuyet, phieu.MaPhieuCoc, maNV);
        await thongBao.PhatCanXuLyChoNhanVien(
            LoaiSuKienThongBao.HoSoLuuTruDaDuyet,
            phieu.MaCN,
            "Sale",
            phieu.MaNV,
            "Hồ sơ lưu trú đã được duyệt",
            $"Phiếu {phieu.MaPhieuCoc} đã được duyệt. Hãy lập và hướng dẫn khách ký hợp đồng.",
            $"/sale/lap-hop-dong?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
            phieu.MaPhieuCoc,
            maNV,
            tone: "green");
    }
}
