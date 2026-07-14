namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Application.DataAccess.DBs;

public sealed class LapHopDongThue
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public LapHopDongThue(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachPhieuCocDaDuyet(string? text = null)
    {
        using var phien = _taoPhienDuLieu();
        return await PhieuCocDB.LayDanhSachDaDuyet(text);
    }

    public async Task<object> LayThongTinPhieuCoc(string maPhieuCoc)
    {
        using var phien = _taoPhienDuLieu();
        var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
        if (phieu.TrangThai != "DaDuyet")
            throw new InvalidOperationException("Phiếu cọc chưa được duyệt.");

        var thanhViens = await ThanhVienDangKyDB.LayTheoMaPhieuCoc(maPhieuCoc);
        var dichVus = await DichVu.LayDanhSach();
        var quyDinhs = await QuyDinh.LayDanhSach();
        var ngayHienTai = DateOnly.FromDateTime(_timeProvider.GetLocalNow().DateTime);
        var chinhSach = await ChinhSachHoanCoc.LayChinhSachDangApDung(ngayHienTai);

        return new
        {
            PhieuCoc = phieu,
            ThanhViens = thanhViens,
            DichVus = dichVus,
            QuyDinhs = quyDinhs,
            ChinhSachHoanCoc = chinhSach,
        };
    }

    public async Task<HopDong> TaoHopDong(string maPhieuCoc, string? maNV, DateTime ngayBatDau,
        DateTime ngayKetThuc, int? kyThanhToan, decimal giaThue,
        string? maQD, List<string> dsMaDV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var phieu = await PhieuCoc.DocChiTiet(maPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc.");
            if (phieu.TrangThai != "DaDuyet")
                throw new InvalidOperationException("Phiếu cọc chưa được duyệt.");

            if (await HopDongDB.TonTaiTheoPhieuCoc(maPhieuCoc))
                throw new InvalidOperationException("Phiếu cọc này đã có hợp đồng hợp lệ.");

            if (ngayKetThuc <= ngayBatDau)
                throw new InvalidOperationException("Ngày kết thúc phải lớn hơn ngày bắt đầu.");

            var thoiDiem = _timeProvider.GetLocalNow().DateTime;
            var maHD = $"HD{thoiDiem:yyyyMMddHHmmssfff}";
            var hopDong = new HopDong
            {
                MaHD = maHD,
                NgayBatDau = ngayBatDau,
                NgayKetThuc = ngayKetThuc,
                KyThanhToan = kyThanhToan,
                GiaThue = giaThue,
                TrangThai = "ChoKy",
                MaNV = maNV,
                MaPhieuCoc = maPhieuCoc,
            };

            await HopDongDB.Them(hopDong);

            if (dsMaDV.Count > 0)
            {
                var dichVus = await DichVu.LayDanhSach();
                var selectedDv = dichVus.Where(d => dsMaDV.Contains(d.MaDV)).ToList();
                foreach (var dv in selectedDv)
                {
                    await DichVuHopDongDB.Them(maHD, dv.MaDV, dv.DonGia);
                }
            }

            phien.Commit();
            return hopDong;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<HopDong> XacNhanKhachDaKy(string maHD)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            if (!await HopDongDB.UpdateTrangThai(maHD, "ChoThanhToan"))
                throw new InvalidOperationException("Không thể cập nhật trạng thái hợp đồng.");
            phien.Commit();
            return new HopDong { MaHD = maHD, TrangThai = "ChoThanhToan" };
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task HuyHopDong(string maHD)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            if (!await HopDongDB.UpdateTrangThai(maHD, "DaHuy"))
                throw new InvalidOperationException("Không thể cập nhật trạng thái hợp đồng.");
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
