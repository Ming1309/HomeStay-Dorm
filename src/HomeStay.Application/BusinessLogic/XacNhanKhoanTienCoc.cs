namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed record KetQuaXacNhanKhoanTienCoc(PhieuCoc PhieuCoc, PhieuThu PhieuThu);

public sealed class XacNhanKhoanTienCoc(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    CauHinhHetHanPhieuCoc cauHinhHetHan)
{
    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDoiChieu(string? text = null)
    {
        using var phien = taoPhienDuLieu();
        return await PhieuCoc.LayDanhSachChoDoiChieu(text);
    }

    public async Task<PhieuCoc> LayChiTiet(string maPhieuCoc)
    {
        using var phien = taoPhienDuLieu();
        var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
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
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
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
            phien.Commit();
            return new KetQuaXacNhanKhoanTienCoc(phieu, phieuThu);
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<PhieuCoc> YeuCauBoSung(string maPhieuCoc, string lyDo)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.YeuCauBoSung(
                lyDo,
                timeProvider.GetLocalNow().DateTime,
                cauHinhHetHan.ThoiHanThanhToan);
            await phieu.CapNhatYeuCauBoSung();
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
