namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class TinhTienCoc
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly CauHinhHetHanPhieuCoc _cauHinhHetHan;
    private readonly DichVuThongBao _thongBao;

    public TinhTienCoc(
        Func<PhienDuLieu> taoPhienDuLieu,
        TimeProvider timeProvider,
        CauHinhHetHanPhieuCoc cauHinhHetHan,
        DichVuThongBao thongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _cauHinhHetHan = cauHinhHetHan;
        _thongBao = thongBao;
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
            await _thongBao.DongTacVu(
                LoaiSuKienThongBao.PhieuCocChoTinhTien, phieu.MaPhieuCoc, nhanVien.MaNV);
            await _thongBao.PhatCanXuLyChoNhanVien(
                LoaiSuKienThongBao.PhieuCocChoThanhToan,
                phieu.MaCN,
                "Sale",
                phieu.MaNV,
                "Đã có số tiền cọc cần thu",
                $"Phiếu {phieu.MaPhieuCoc} cần thu {phieu.TongTien:N0} VNĐ trước {phieu.HanThanhToan:dd/MM/yyyy HH:mm}.",
                $"/sale/ghi-nhan-coc?maPhieuCoc={Uri.EscapeDataString(phieu.MaPhieuCoc)}",
                phieu.MaPhieuCoc,
                nhanVien.MaNV);
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
