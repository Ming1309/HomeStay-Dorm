namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class XacNhanPhieuDoiSoat(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    DichVuThongBao dichVuThongBao)
{
    public async Task<IReadOnlyList<PhieuDoiSoat>> LayDanhSachChoXacNhan()
    {
        using var phien = taoPhienDuLieu();
        return await PhieuDoiSoat.LayDanhSachChoXacNhan();
    }

    public async Task<PhieuDoiSoat> LayChiTiet(string maPDS)
    {
        using var phien = taoPhienDuLieu();
        var pds = await PhieuDoiSoat.LayChiTietPhieuDoiSoat(maPDS.Trim())
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu đối soát.");
        if (pds.TrangThai != "ChoXacNhan")
            throw new InvalidOperationException("Phiếu đối soát không còn chờ xác nhận.");
        pds.HoaDons = (await HoaDon.LayDSHoaDonTheoPhieuDoiSoat(pds.MaPDS)).ToList();
        return pds;
    }

    public async Task<PhieuDoiSoat> XacNhan(string maPDS, bool khachHangDongY, string? ghiChu, string maNhanVien)
    {
        if (!khachHangDongY)
            throw new ArgumentException("Cần xác nhận khách hàng đã đồng ý kết quả đối soát.", nameof(khachHangDongY));

        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var pds = await PhieuDoiSoat.LayChiTietChoCapNhat(maPDS.Trim())
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu đối soát.");
            await pds.XacNhanKhachHangDongY(maNhanVien, timeProvider.GetLocalNow().DateTime, ghiChu);

            if (pds.TrangThai == "DaChot" && pds.TienThuThem > 0)
            {
                await dichVuThongBao.GuiThongBaoKeToan(
                    "Đối soát đã xác nhận - cần thu thêm",
                    $"Phiếu đối soát {pds.MaPDS} đã được Quản lý xác nhận, cần thu thêm {pds.TienThuThem:N0} VNĐ.",
                    "/accountant/payments", maNhanVien, pds.MaPDS);
            }
            else if (pds.TrangThai == "DaChot" && pds.TienHoan > 0 && pds.MaHD is null)
            {
                await dichVuThongBao.GuiThongBaoKeToan(
                    "Đối soát đã xác nhận - cần hoàn cọc",
                    $"Phiếu đối soát {pds.MaPDS} đã được Quản lý xác nhận, cần hoàn {pds.TienHoan:N0} VNĐ.",
                    "/accountant/refunds", maNhanVien, pds.MaPDS);
            }

            phien.Commit();
            return pds;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
