namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class TinhTienCoc
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly CauHinhHetHanPhieuCoc _cauHinhHetHan;

    public TinhTienCoc(
        Func<PhienDuLieu> taoPhienDuLieu,
        TimeProvider timeProvider,
        CauHinhHetHanPhieuCoc cauHinhHetHan)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _cauHinhHetHan = cauHinhHetHan;
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachKhoiTao(string? text, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await PhieuCoc.LayDanhSachKhoiTao(nhanVien.MaCN, text);
    }

    public async Task<PhieuCoc> LayChiTietVaTinhTien(string maPhieuCoc, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc, nhanVien.MaCN)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
        phieu.TinhTienDuKien();
        return phieu;
    }

    public async Task<PhieuCoc> XacNhanTinhTien(string maPhieuCoc, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNV);
            var phieu = await PhieuCoc.DocChiTietChoCapNhat(maPhieuCoc, nhanVien.MaCN)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            phieu.XacNhanTinhTien(
                _timeProvider.GetLocalNow().DateTime,
                _cauHinhHetHan.ThoiHanThanhToan);
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
