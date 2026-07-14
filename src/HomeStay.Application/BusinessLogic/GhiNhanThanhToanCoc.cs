namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Application.DataAccess.FileStorage;

public sealed class GhiNhanThanhToanCoc(
    Func<PhienDuLieu> taoPhienDuLieu,
    IChungTuCocStorage chungTuStorage,
    TimeProvider timeProvider)
{
    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoThanhToan(string? text = null)
    {
        using var phien = taoPhienDuLieu();
        return await PhieuCoc.LayDanhSachChoThanhToan(
            timeProvider.GetLocalNow().DateTime, text);
    }

    public async Task<PhieuCoc> LayChiTiet(string maPhieuCoc)
    {
        using var phien = taoPhienDuLieu();
        var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
        phieu.KiemTraTrangThaiChoGhiNhan();
        phieu.KiemTraConHanThanhToan(timeProvider.GetLocalNow().DateTime);
        return phieu;
    }

    public async Task<PhieuCoc> GuiChungTuThanhToan(
        string maPhieuCoc,
        string phuongThucThanhToan,
        TepChungTuCoc tepChungTu,
        CancellationToken cancellationToken = default)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        string? duongDanChungTu = null;
        string? duongDanChungTuCu = null;
        PhieuCoc? phieuDaCapNhat = null;
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.KiemTraCoTheGhiNhanThanhToan(
                phuongThucThanhToan, timeProvider.GetLocalNow().DateTime);
            duongDanChungTuCu = phieu.AnhMinhChung;

            duongDanChungTu = await chungTuStorage.Luu(tepChungTu, cancellationToken);
            var thoiDiemGhiNhan = timeProvider.GetLocalNow().DateTime;
            phieu.GhiNhanThanhToan(
                phuongThucThanhToan, duongDanChungTu, thoiDiemGhiNhan);
            await phieu.CapNhatThanhToan(thoiDiemGhiNhan);
            phien.Commit();
            phieuDaCapNhat = phieu;
        }
        catch
        {
            phien.Rollback();
            if (duongDanChungTu is not null)
                await chungTuStorage.Xoa(duongDanChungTu, CancellationToken.None);
            throw;
        }

        if (!string.IsNullOrWhiteSpace(duongDanChungTuCu) && duongDanChungTuCu != duongDanChungTu)
        {
            try { await chungTuStorage.Xoa(duongDanChungTuCu, CancellationToken.None); }
            catch { /* Dọn tệp cũ không được làm thất bại giao dịch đã commit. */ }
        }
        return phieuDaCapNhat!;
    }
}
