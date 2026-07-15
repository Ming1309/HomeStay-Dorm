namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class TraCuuPhieuCoc(Func<PhienDuLieu> taoPhienDuLieu)
{
    public async Task<bool> DuocDocChungTu(string tenTep, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await PhieuCoc.ThamChieuChungTu(nhanVien.MaCN, tenTep);
    }
    public async Task<IReadOnlyList<PhieuCoc>> TimKiem(
        string? maPhieuCoc, string? sdt, string? email, string? soGiayTo, string? maNV)
    {
        if (new[] { maPhieuCoc, sdt, email, soGiayTo }.All(string.IsNullOrWhiteSpace))
            throw new ArgumentException("Vui lòng nhập ít nhất một tiêu chí tìm kiếm");

        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await PhieuCoc.TraCuu(nhanVien.MaCN, maPhieuCoc, sdt, email, soGiayTo);
    }

    public async Task<PhieuCoc> LayChiTiet(string maPhieuCoc, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await PhieuCoc.DocChiTiet(maPhieuCoc, nhanVien.MaCN)
            ?? throw new KeyNotFoundException("Không tìm thấy Phiếu cọc phù hợp");
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachCoTheHuy(string? text, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await PhieuCoc.LayDanhSachCoTheHuy(nhanVien.MaCN, text);
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachDaHuyChoDoiSoat(string? maNV)
    {
        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await PhieuCoc.LayDanhSachDaHuyChoDoiSoat(nhanVien.MaCN);
    }
}
