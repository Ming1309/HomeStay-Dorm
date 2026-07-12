namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class TinhTienCoc
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public TinhTienCoc(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachKhoiTao(string? text = null)
    {
        using var phien = _taoPhienDuLieu();
        return await PhieuCoc.LayDanhSachKhoiTao(text);
    }

    public async Task<PhieuCoc> LayChiTietVaTinhTien(string maPhieuCoc)
    {
        using var phien = _taoPhienDuLieu();
        var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
        phieu.TinhTienDuKien();
        return phieu;
    }

    public async Task<PhieuCoc> XacNhanTinhTien(string maPhieuCoc)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.XacNhanTinhTien(_timeProvider.GetLocalNow().DateTime);
            await phieu.CapNhatTinhTien();
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
