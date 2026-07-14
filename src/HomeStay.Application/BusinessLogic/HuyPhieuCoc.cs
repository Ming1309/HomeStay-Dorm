namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class HuyPhieuCoc(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    DichVuThongBao dichVuThongBao)
{
    public async Task<PhieuCoc> Huy(string maPhieuCoc, string maNhanVien)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
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
            if (phieu.DaDongTien)
            {
                await dichVuThongBao.GuiThongBaoKeToan(
                    "Phiếu cọc đã thu tiền vừa bị hủy",
                    $"Phiếu cọc {phieu.MaPhieuCoc} đã bị hủy và cần được đối soát hoàn cọc.",
                    "/accountant/doi-soat",
                    maNhanVien,
                    phieu.MaPhieuCoc);
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
}
