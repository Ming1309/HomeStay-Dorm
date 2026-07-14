namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

/// <summary>
/// Dịch vụ thông báo nội bộ theo vai trò.
/// Gọi trong cùng transaction của use-case khi cần; hoặc standalone khi đọc/mark-read.
/// </summary>
public sealed class DichVuThongBao(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
{
    public async Task GuiThongBaoKeToan(
        string tieuDe,
        string noiDung,
        string? lienKet,
        string? maNVGui,
        string? maThamChieu)
    {
        // Gọi trong transaction đã mở của use-case (không tạo session mới).
        var tb = ThongBao.Tao(
            tieuDe,
            noiDung,
            "KeToan",
            lienKet,
            "orange",
            maNVGui,
            maThamChieu,
            timeProvider.GetLocalNow().DateTime);
        await tb.Luu();
    }

    /// <summary>
    /// UC 1.4.18: sau khi lập phiếu đối soát, thông báo Quản lý.
    /// Gọi trong transaction đã mở của use-case.
    /// </summary>
    public async Task GuiThongBaoQuanLy(string maPDS)
    {
        var tb = ThongBao.Tao(
            tieuDe: "Phiếu đối soát mới",
            noiDung: $"Phiếu đối soát {maPDS} đã được lập. Vui lòng xác nhận khách hàng đã đồng ý kết quả.",
            vaiTroNhan: "QuanLy",
            lienKet: "/manager/reconciliation-approval",
            tone: "blue",
            maNVGui: null,
            maThamChieu: maPDS,
            thoiGianTao: timeProvider.GetLocalNow().DateTime);
        await tb.Luu();
    }

    public async Task GuiTheoVaiTro(
        string vaiTroNhan,
        string tieuDe,
        string noiDung,
        string? lienKet = null,
        string tone = "blue",
        string? maNVGui = null,
        string? maThamChieu = null)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var tb = ThongBao.Tao(
                tieuDe,
                noiDung,
                vaiTroNhan,
                lienKet,
                tone,
                maNVGui,
                maThamChieu,
                timeProvider.GetLocalNow().DateTime);
            await tb.Luu();
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task<IReadOnlyList<ThongBao>> LayThongBaoCuaToi(string vaiTro, string maNV)
    {
        using var phien = taoPhienDuLieu();
        return await ThongBao.LayTheoVaiTro(vaiTro, maNV);
    }

    public async Task DanhDauDaDoc(string maTB, string maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            await ThongBao.DanhDauDaDoc(maTB, maNV, timeProvider.GetLocalNow().DateTime);
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task DanhDauTatCaDaDoc(string vaiTro, string maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            await ThongBao.DanhDauTatCaDaDoc(vaiTro, maNV, timeProvider.GetLocalNow().DateTime);
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
