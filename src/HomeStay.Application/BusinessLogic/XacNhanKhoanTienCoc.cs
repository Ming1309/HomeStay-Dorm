namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed record KetQuaXacNhanKhoanTienCoc(PhieuCoc PhieuCoc, PhieuThu PhieuThu);

public sealed class XacNhanKhoanTienCoc(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    CauHinhHetHanPhieuCoc cauHinhHetHan,
    DichVuThongBao thongBao)
{
    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDoiChieu(string? text, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await PhieuCoc.LayDanhSachChoDoiChieu(nhanVien.MaCN, text);
    }

    public async Task<PhieuCoc> LayChiTiet(string maPhieuCoc, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc, nhanVien.MaCN)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
        phieu.KiemTraCoTheXacNhanThanhToan();
        return phieu;
    }

    public async Task<KetQuaXacNhanKhoanTienCoc> XacNhanHopLe(string maPhieuCoc, string maNhanVienQuanLy)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNhanVienQuanLy);
            var phieu = await PhieuCoc.DocChiTietChoCapNhat(maPhieuCoc, nhanVien.MaCN)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.KiemTraCoTheXacNhanThanhToan();

            var phong = await Phong.DocChiTiet(phieu.MaPhong)
                ?? throw new KeyNotFoundException("Không tìm thấy phòng của phiếu cọc.");
            phong.XacNhanDatCoc(phieu.Giuongs.Select(g => g.MaGiuong));

            var phieuThu = PhieuThu.TaoChoTienCoc(
                phieu, maNhanVienQuanLy, timeProvider.GetLocalNow().DateTime);
            phieu.XacNhanThanhToan();

            await phieu.CapNhatXacNhanThanhToan();
            await phieuThu.Them();
            await phong.CapNhatDatCoc();
            await thongBao.DongTacVu(
                LoaiSuKienThongBao.ChungTuCocChoDoiChieu, phieu.MaPhieuCoc, nhanVien.MaNV);
            await thongBao.PhatCanXuLyChoNhanVien(
                LoaiSuKienThongBao.TienCocDaXacNhan,
                phieu.MaCN,
                "Sale",
                phieu.MaNV,
                "Khoản tiền cọc đã được xác nhận",
                $"Phiếu {phieu.MaPhieuCoc} đã được xác nhận và lập phiếu thu {phieuThu.MaPT}. Hãy tiếp tục hồ sơ lưu trú.",
                $"/sale/ho-so-luu-tru?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
                phieu.MaPhieuCoc,
                nhanVien.MaNV);
            phien.Commit();
            return new KetQuaXacNhanKhoanTienCoc(phieu, phieuThu);
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<PhieuCoc> YeuCauBoSung(string maPhieuCoc, string lyDo, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNV);
            var phieu = await PhieuCoc.DocChiTietChoCapNhat(maPhieuCoc, nhanVien.MaCN)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.YeuCauBoSung(
                lyDo,
                timeProvider.GetLocalNow().DateTime,
                cauHinhHetHan.ThoiHanThanhToan);
            await phieu.CapNhatYeuCauBoSung();
            await thongBao.DongTacVu(
                LoaiSuKienThongBao.ChungTuCocChoDoiChieu, phieu.MaPhieuCoc, nhanVien.MaNV);
            await thongBao.PhatCanXuLyChoNhanVien(
                LoaiSuKienThongBao.ChungTuCocCanBoSung,
                phieu.MaCN,
                "Sale",
                phieu.MaNV,
                "Chứng từ cọc cần bổ sung",
                $"Phiếu {phieu.MaPhieuCoc}: {phieu.LyDoYeuCauBoSung}. Hạn mới {phieu.HanThanhToan:dd/MM/yyyy HH:mm}.",
                $"/sale/ghi-nhan-coc?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
                phieu.MaPhieuCoc,
                nhanVien.MaNV,
                khoaChongTrung: $"{LoaiSuKienThongBao.ChungTuCocCanBoSung}:{phieu.MaPhieuCoc}",
                capNhatNeuTonTai: true);
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
