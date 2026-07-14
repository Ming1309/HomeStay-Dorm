namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

// UC 1.4.26 - Quan ly danh muc dich vu cua vai tro QuanTri.
public sealed class QuanLyDichVu(Func<PhienDuLieu> taoPhienDuLieu)
{
    public async Task<IReadOnlyList<DichVu>> LayDanhSach()
    {
        using var phien = taoPhienDuLieu();
        return await DichVu.LayDanhSach();
    }

    public async Task<DichVu> Them(DichVu dichVu)
    {
        dichVu.ChuanHoa();
        dichVu.KiemTraDuLieuHopLe();
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            dichVu.MaDV = await DichVu.TaoMaMoi();
            await dichVu.Them();
            phien.Commit();
            return dichVu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<DichVu> CapNhat(string maDV, DichVu thongTin)
    {
        thongTin.ChuanHoa();
        thongTin.KiemTraDuLieuHopLe();
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var dichVu = await DichVu.Doc(maDV)
                ?? throw new KeyNotFoundException("Không tìm thấy dịch vụ.");
            dichVu.TenDV = thongTin.TenDV;
            dichVu.DonViTinh = thongTin.DonViTinh;
            dichVu.DonGia = thongTin.DonGia;
            dichVu.TrangThai = thongTin.TrangThai;
            await dichVu.CapNhat();
            phien.Commit();
            return dichVu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task Xoa(string maDV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var dichVu = await DichVu.Doc(maDV)
                ?? throw new KeyNotFoundException("Không tìm thấy dịch vụ.");
            if (await DichVu.DangDuocThamChieu(maDV))
                throw new InvalidOperationException(
                    "Không thể xóa dịch vụ đã được sử dụng. Hãy chuyển sang Ngừng áp dụng.");
            await dichVu.Xoa();
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
