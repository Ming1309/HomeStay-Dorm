namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class LapPhieuDangKy
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public LapPhieuDangKy(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<PhieuDangKy> TaoPhieuDangKy(
        string hoTen, string? gioiTinh, string? sdt, string? email,
        string? diaChiThuongTru, string? loaiGiayTo, string soGiayTo,
        string? khuVuc, int? soLuongNguoi, string? loaiDichVu, decimal? mucGia,
        DateTime? thoiGianDuKienVao, int? thoiHanThue, string? yeuCauKhac, string? maNV)
    {
        if (string.IsNullOrWhiteSpace(hoTen))
            throw new InvalidOperationException("Họ tên khách hàng không được để trống.");
        if (string.IsNullOrWhiteSpace(soGiayTo))
            throw new InvalidOperationException("Số giấy tờ không được để trống.");

        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var thoiDiem = _timeProvider.GetLocalNow().DateTime;

            // Kiểm tra khách hàng đã tồn tại theo số giấy tờ
            var khachHang = await KhachHang.KiemTraTonTai(soGiayTo);
            if (khachHang is null)
            {
                // Tạo mới khách hàng nếu chưa tồn tại
                khachHang = KhachHang.TaoMoi(await KhachHang.TaoMaMoi(), hoTen, gioiTinh, sdt, email,
                    diaChiThuongTru, loaiGiayTo, soGiayTo);
                await khachHang.Them();
            }

            var maMoi = await DataAccess.DBs.MaTuDongDB.TaoMaMoi("PhieuDangKy", "MaPDK", "PDK");
            var phieuDangKy = PhieuDangKy.TaoMoi(maMoi, khachHang.MaKH, maNV, khuVuc, soLuongNguoi,
                loaiDichVu, mucGia, thoiGianDuKienVao, thoiHanThue, yeuCauKhac, _timeProvider.GetLocalNow().DateTime);
            phieuDangKy.KiemTraDieuKien(thoiDiem);
            await phieuDangKy.Them();

            phien.Commit();
            phieuDangKy.KhachHang = khachHang;
            return phieuDangKy;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<IReadOnlyList<PhieuDangKy>> TimKiemPhieuDangKy(
        string? sdt, string? soGiayTo, string? email, string? hoTen = null, string? maPDK = null)
    {
        using var phien = _taoPhienDuLieu();
        return await PhieuDangKy.TimKiem(sdt, soGiayTo, email, hoTen, maPDK);
    }

    public async Task<PhieuDangKy?> LayChiTietPhieuDangKy(string maPDK)
    {
        using var phien = _taoPhienDuLieu();
        return await PhieuDangKy.DocChiTiet(maPDK);
    }
}
