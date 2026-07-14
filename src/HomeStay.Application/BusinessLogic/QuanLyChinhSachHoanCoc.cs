namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

// UC 1.4.28 - Quan ly cac phien ban chinh sach hoan coc cua vai tro QuanTri.
public sealed class QuanLyChinhSachHoanCoc(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider)
{
    public DateOnly HomNay => DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);

    public async Task<IReadOnlyList<ChinhSachHoanCoc>> LayDanhSach()
    {
        using var phien = taoPhienDuLieu();
        return await ChinhSachHoanCoc.LayDanhSach();
    }

    public async Task<ChinhSachHoanCoc> LayChinhSachHienHanh()
    {
        using var phien = taoPhienDuLieu();
        return await ChinhSachHoanCoc.LayChinhSachDangApDung(HomNay)
            ?? throw new KeyNotFoundException("Không có chính sách hoàn cọc đang áp dụng.");
    }

    public async Task<ChinhSachHoanCoc> TaoPhienBan(ChinhSachHoanCoc chinhSachMoi)
    {
        chinhSachMoi.KiemTraDuLieuHopLe();

        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phienBanMoiNhat = await ChinhSachHoanCoc.LayPhienBanMoiNhat();
            if (phienBanMoiNhat is not null)
            {
                if (chinhSachMoi.NgayApDung <= phienBanMoiNhat.NgayApDung)
                    throw new InvalidOperationException(
                        $"Ngày áp dụng phải sau ngày {phienBanMoiNhat.NgayApDung:dd/MM/yyyy} " +
                        "của phiên bản mới nhất.");

                if (phienBanMoiNhat.NgayKetThuc is null ||
                    phienBanMoiNhat.NgayKetThuc >= chinhSachMoi.NgayApDung)
                    await phienBanMoiNhat.CapNhatNgayKetThuc(
                        chinhSachMoi.NgayApDung.AddDays(-1));
            }

            chinhSachMoi.MaChinhSach = await ChinhSachHoanCoc.TaoMaMoi();
            await chinhSachMoi.Them();
            phien.Commit();
            return chinhSachMoi;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
