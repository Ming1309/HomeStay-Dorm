namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Application.DataAccess.FileStorage;

// UC 1.4.29 - Quan ly quy dinh luu tru danh cho vai tro QuanTri.
public sealed class QuanLyQuyDinh(
    Func<PhienDuLieu> taoPhienDuLieu,
    IQuyDinhFileStorage fileStorage,
    TimeProvider timeProvider)
{
    public DateOnly HomNay => DateOnly.FromDateTime(timeProvider.GetLocalNow().DateTime);

    public async Task<IReadOnlyList<QuyDinh>> LayDanhSach()
    {
        using var phien = taoPhienDuLieu();
        return await QuyDinh.LayDanhSach();
    }

    public async Task<QuyDinh> Them(
        QuyDinh quyDinh, TepQuyDinh tep, CancellationToken cancellationToken = default)
    {
        quyDinh.ChuanHoa();
        quyDinh.KiemTraDuLieuHopLe(yeuCauDuongDan: false);
        var duongDanMoi = await fileStorage.Luu(tep, cancellationToken);
        quyDinh.DuongDanFile = duongDanMoi;

        try
        {
            using var phien = taoPhienDuLieu();
            phien.BatDauGiaoDich();
            quyDinh.KiemTraDuLieuHopLe();
            await quyDinh.Them();
            phien.Commit();
            return quyDinh;
        }
        catch
        {
            await XoaTepKhongNemLoi(duongDanMoi);
            throw;
        }
    }

    public async Task<QuyDinh> CapNhat(
        string maQD, QuyDinh thongTin, TepQuyDinh? tepMoi,
        CancellationToken cancellationToken = default)
    {
        thongTin.ChuanHoa();
        thongTin.KiemTraDuLieuHopLe(yeuCauDuongDan: false);
        var duongDanMoi = tepMoi is null ? null : await fileStorage.Luu(tepMoi, cancellationToken);

        string? duongDanCu = null;
        QuyDinh? ketQua = null;
        try
        {
            using var phien = taoPhienDuLieu();
            phien.BatDauGiaoDich();
            var quyDinh = await QuyDinh.Doc(maQD)
                ?? throw new KeyNotFoundException("Không tìm thấy quy định.");
            duongDanCu = quyDinh.DuongDanFile;
            quyDinh.TenQD = thongTin.TenQD;
            quyDinh.LoaiQD = thongTin.LoaiQD;
            quyDinh.NgayApDung = thongTin.NgayApDung;
            quyDinh.NgayKetThuc = thongTin.NgayKetThuc;
            if (duongDanMoi is not null) quyDinh.DuongDanFile = duongDanMoi;
            quyDinh.KiemTraDuLieuHopLe();
            await quyDinh.CapNhat();
            phien.Commit();
            ketQua = quyDinh;
        }
        catch
        {
            if (duongDanMoi is not null)
                await XoaTepKhongNemLoi(duongDanMoi);
            throw;
        }

        if (duongDanMoi is not null && duongDanCu is not null && duongDanCu != duongDanMoi)
            await XoaTepKhongNemLoi(duongDanCu);
        return ketQua!;
    }

    public async Task Xoa(string maQD, CancellationToken cancellationToken = default)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        string duongDan;
        try
        {
            var quyDinh = await QuyDinh.Doc(maQD)
                ?? throw new KeyNotFoundException("Không tìm thấy quy định.");
            if (await QuyDinh.DangDuocThamChieu(maQD))
                throw new InvalidOperationException(
                    "Không thể xóa quy định đang được áp dụng trong hệ thống.");
            duongDan = quyDinh.DuongDanFile;
            await quyDinh.Xoa();
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
        await XoaTepKhongNemLoi(duongDan);
    }

    public Task<NoiDungQuyDinh?> DocVanBan(
        string tenTep, CancellationToken cancellationToken = default) =>
        fileStorage.Doc(tenTep, cancellationToken);

    private async Task XoaTepKhongNemLoi(string duongDan)
    {
        try { await fileStorage.Xoa(duongDan, CancellationToken.None); }
        catch { }
    }
}
