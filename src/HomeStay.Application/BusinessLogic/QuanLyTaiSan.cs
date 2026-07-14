namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

// UC 1.4.30 - Quan ly danh muc tai san cua vai tro QuanTri.
public sealed class QuanLyTaiSan(Func<PhienDuLieu> taoPhienDuLieu)
{
    public async Task<IReadOnlyList<TaiSan>> LayDanhSach()
    {
        using var phien = taoPhienDuLieu();
        return await TaiSan.LayDanhSach();
    }

    public async Task<TaiSan> Them(TaiSan taiSan)
    {
        taiSan.ChuanHoa();
        taiSan.KiemTraDuLieuHopLe();
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            if (await TaiSan.TrungTen(taiSan.TenTaiSan, null))
                throw new InvalidOperationException("Loại tài sản này đã tồn tại trong danh mục.");
            taiSan.MaTS = await TaiSan.TaoMaMoi();
            await taiSan.Them();
            phien.Commit();
            return taiSan;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<TaiSan> CapNhat(string maTS, TaiSan thongTin)
    {
        thongTin.ChuanHoa();
        thongTin.KiemTraDuLieuHopLe();
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var taiSan = await TaiSan.Doc(maTS)
                ?? throw new KeyNotFoundException("Không tìm thấy tài sản.");
            if (await TaiSan.TrungTen(thongTin.TenTaiSan, maTS))
                throw new InvalidOperationException("Loại tài sản này đã tồn tại trong danh mục.");
            taiSan.TenTaiSan = thongTin.TenTaiSan;
            taiSan.LoaiTaiSan = thongTin.LoaiTaiSan;
            taiSan.GiaTri = thongTin.GiaTri;
            taiSan.MoTa = thongTin.MoTa;
            taiSan.TrangThai = thongTin.TrangThai;
            await taiSan.CapNhat();
            phien.Commit();
            return taiSan;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task Xoa(string maTS)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var taiSan = await TaiSan.Doc(maTS)
                ?? throw new KeyNotFoundException("Không tìm thấy tài sản.");
            if (await TaiSan.DangDuocThamChieu(maTS))
                throw new InvalidOperationException(
                    "Không thể xóa tài sản đang được sử dụng trong phòng, biên bản bàn giao hoặc hóa đơn.");
            await taiSan.Xoa();
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
