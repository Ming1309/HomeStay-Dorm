namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class KiemTraQuyenChungTu(Func<PhienDuLieu> taoPhienDuLieu)
{
    public async Task<bool> DuocDocTaiChinh(string loai, string tenTep, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        _ = await NhanVien.DocPhamVi(maNV);
        return loai switch
        {
            "thu" => await PhieuThu.ThamChieuChungTu(tenTep),
            "hoan" => await PhieuHoanCoc.ThamChieuChungTu(tenTep),
            _ => false,
        };
    }

    public async Task<bool> DuocDocThuHoi(string tenTep, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        _ = await NhanVien.DocPhamVi(maNV);
        return await ChiTietGiaoNhan.ThamChieuMinhChung(tenTep);
    }
}
