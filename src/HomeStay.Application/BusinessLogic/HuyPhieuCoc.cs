namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class HuyPhieuCoc(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    DichVuThongBao dichVuThongBao)
{
    public async Task<IReadOnlyList<string>> LayDanhSachMaQuaHan(
        DateTime thoiDiemHienTai, int batchSize)
    {
        using var phien = taoPhienDuLieu();
        return await PhieuCoc.LayDanhSachMaQuaHan(thoiDiemHienTai, batchSize);
    }

    public async Task<bool> TuDongHuyQuaHan(string maPhieuCoc, DateTime thoiDiemHienTai)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTietHeThong(maPhieuCoc, khoaCapNhat: true);
            if (phieu is null || !phieu.CoTheTuDongHuy(thoiDiemHienTai))
            {
                phien.Rollback();
                return false;
            }

            if (await HopDong.TonTaiTheoPhieuCoc(maPhieuCoc))
            {
                phien.Rollback();
                return false;
            }

            var phong = await Phong.DocChiTiet(phieu.MaPhong)
                ?? throw new KeyNotFoundException("Không tìm thấy phòng của phiếu cọc quá hạn.");
            var maGiuongs = phieu.Giuongs.Select(g => g.MaGiuong).ToArray();

            phieu.TuDongHuyQuaHan(thoiDiemHienTai);
            phong.GiaiPhongDatCoc(maGiuongs);

            await phieu.CapNhatTuDongHuy(thoiDiemHienTai);
            await phong.CapNhatGiaiPhongDatCoc();
            await DongCacTacVuCoc(phieu.MaPhieuCoc, null, "DaHuy");
            await dichVuThongBao.PhatThongTin(
                LoaiSuKienThongBao.PhieuCocTuDongHuy,
                phieu.MaCN,
                "Sale",
                phieu.MaNV,
                "Phiếu cọc quá hạn đã tự động hủy",
                $"Phiếu cọc {phieu.MaPhieuCoc} của {phieu.KhachHang.HoTen} đã quá hạn thanh toán và được hệ thống giải phóng chỗ.",
                $"/sale/tra-cuu-phieu-coc?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
                phieu.MaPhieuCoc,
                null,
                tone: "red",
                loaiThongBao: "CanhBao");

            phien.Commit();
            return true;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<PhieuCoc> Huy(string maPhieuCoc, string maNhanVien)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNhanVien);
            var phieu = await PhieuCoc.DocChiTietChoCapNhat(maPhieuCoc, nhanVien.MaCN)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            if (await HopDong.TonTaiTheoPhieuCoc(maPhieuCoc))
                throw new InvalidOperationException("Hồ sơ đã chuyển sang giai đoạn Ký hợp đồng. Vui lòng sử dụng chức năng Thanh lý hợp đồng.");

            var phong = await Phong.DocChiTiet(phieu.MaPhong)
                ?? throw new KeyNotFoundException("Không tìm thấy phòng của phiếu cọc.");

            phieu.Huy(maNhanVien, timeProvider.GetLocalNow().DateTime);
            var maGiuongs = phieu.Giuongs.Select(g => g.MaGiuong).ToArray();
            phong.GiaiPhongDatCoc(maGiuongs);
            await phieu.CapNhatHuy();
            await phong.CapNhatGiaiPhongDatCoc();
            await DongCacTacVuCoc(phieu.MaPhieuCoc, maNhanVien, "DaHuy");
            if (phieu.DaDongTien)
            {
                await dichVuThongBao.PhatCanXuLyTheoVaiTro(
                    LoaiSuKienThongBao.PhieuCocHuyChoDoiSoat,
                    phieu.MaCN,
                    "KeToan",
                    "Phiếu cọc đã thu tiền vừa bị hủy",
                    $"Phiếu cọc {phieu.MaPhieuCoc} đã bị hủy và cần được đối soát hoàn cọc.",
                    $"/accountant/doi-soat?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
                    phieu.MaPhieuCoc,
                    maNhanVien,
                    tone: "orange");
            }
            phien.Commit();
            phieu.Phong = phong;
            phieu.Giuongs = phong.Giuongs.Where(g => maGiuongs.Contains(g.MaGiuong)).ToList();
            return phieu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    private async Task DongCacTacVuCoc(string maPhieuCoc, string? maNV, string trangThai)
    {
        foreach (var loaiSuKien in new[]
        {
            LoaiSuKienThongBao.PhieuCocChoTinhTien,
            LoaiSuKienThongBao.PhieuCocChoThanhToan,
            LoaiSuKienThongBao.ChungTuCocChoDoiChieu,
            LoaiSuKienThongBao.ChungTuCocCanBoSung,
            LoaiSuKienThongBao.TienCocDaXacNhan,
            LoaiSuKienThongBao.HoSoLuuTruChoDuyet,
            LoaiSuKienThongBao.HoSoLuuTruDaDuyet,
        })
            await dichVuThongBao.DongTacVu(loaiSuKien, maPhieuCoc, maNV, trangThai);
    }
}
