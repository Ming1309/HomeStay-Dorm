namespace HomeStay.Application.BusinessLogic;

using System.Globalization;
using System.Text;
using HomeStay.Application.DataAccess.DbConnections;

public sealed record TrangThongBao(
    IReadOnlyList<ThongBao> Items,
    int SoChuaDoc,
    string? CursorTiepTheo);

/// <summary>
/// Thông báo nội bộ theo chi nhánh. Các hàm Phat/Dong phải được gọi trong
/// transaction của use case; các hàm đọc tự mở phiên dữ liệu riêng.
/// </summary>
public sealed class DichVuThongBao(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
{
    public Task PhatCanXuLyTheoVaiTro(
        string loaiSuKien,
        string maCN,
        string vaiTroNhan,
        string tieuDe,
        string noiDung,
        string lienKet,
        string maThamChieu,
        string? maNVGui = null,
        string tone = "blue",
        string? khoaChongTrung = null,
        bool capNhatNeuTonTai = false) =>
        Phat(loaiSuKien, "CanXuLy", maCN, vaiTroNhan, null, tieuDe, noiDung,
            lienKet, maThamChieu, maNVGui, tone, khoaChongTrung, capNhatNeuTonTai);

    public Task PhatCanXuLyChoNhanVien(
        string loaiSuKien,
        string maCN,
        string vaiTroNhan,
        string? maNVNhan,
        string tieuDe,
        string noiDung,
        string lienKet,
        string maThamChieu,
        string? maNVGui = null,
        string tone = "orange",
        string? khoaChongTrung = null,
        bool capNhatNeuTonTai = false) =>
        Phat(loaiSuKien, "CanXuLy", maCN, vaiTroNhan, maNVNhan, tieuDe, noiDung,
            lienKet, maThamChieu, maNVGui, tone, khoaChongTrung, capNhatNeuTonTai);

    public Task PhatThongTin(
        string loaiSuKien,
        string maCN,
        string vaiTroNhan,
        string? maNVNhan,
        string tieuDe,
        string noiDung,
        string? lienKet,
        string maThamChieu,
        string? maNVGui = null,
        string tone = "green",
        string loaiThongBao = "ThongTin",
        string? khoaChongTrung = null,
        bool capNhatNeuTonTai = false) =>
        Phat(loaiSuKien, loaiThongBao, maCN, vaiTroNhan, maNVNhan, tieuDe, noiDung,
            lienKet, maThamChieu, maNVGui, tone, khoaChongTrung, capNhatNeuTonTai);

    public Task DongTacVu(
        string loaiSuKien,
        string maThamChieu,
        string? maNVXuLy,
        string trangThai = "DaXuLy") =>
        ThongBao.DongTacVu(
            loaiSuKien,
            maThamChieu,
            maNVXuLy,
            timeProvider.GetLocalNow().DateTime,
            trangThai);

    public async Task<TrangThongBao> LayThongBaoCuaToi(
        string? maNV,
        string boLoc = "unread",
        int soLuong = 20,
        string? cursor = null)
    {
        if (boLoc is not ("open" or "unread" or "all"))
            throw new ArgumentException("Bộ lọc thông báo không hợp lệ.");
        soLuong = Math.Clamp(soLuong, 1, 50);
        var (truocThoiDiem, truocMaTB) = DocCursor(cursor);

        using var phien = taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        var items = await ThongBao.LayCuaNhanVien(
            nhanVien, boLoc, soLuong + 1, truocThoiDiem, truocMaTB);
        var coTrangSau = items.Count > soLuong;
        var page = items.Take(soLuong).ToList();
        var soChuaDoc = await ThongBao.DemChuaDoc(nhanVien);
        var cursorTiepTheo = coTrangSau && page.Count > 0 ? TaoCursor(page[^1]) : null;
        return new TrangThongBao(page, soChuaDoc, cursorTiepTheo);
    }

    public async Task DanhDauDaDoc(string maTB, string? maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNV);
            if (!await ThongBao.DanhDauDaDoc(maTB.Trim(), nhanVien, timeProvider.GetLocalNow().DateTime))
                throw new KeyNotFoundException("Không tìm thấy thông báo.");
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    public async Task DanhDauTatCaDaDoc(string? maNV)
    {
        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNV);
            await ThongBao.DanhDauTatCaDaDoc(nhanVien, timeProvider.GetLocalNow().DateTime);
            phien.Commit();
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    private async Task Phat(
        string loaiSuKien,
        string loaiThongBao,
        string maCN,
        string vaiTroNhan,
        string? maNVNhan,
        string tieuDe,
        string noiDung,
        string? lienKet,
        string maThamChieu,
        string? maNVGui,
        string tone,
        string? khoaChongTrung,
        bool capNhatNeuTonTai)
    {
        var khoa = string.IsNullOrWhiteSpace(khoaChongTrung)
            ? $"{loaiSuKien}:{maThamChieu}"
            : khoaChongTrung.Trim();
        var thongBao = ThongBao.Tao(
            loaiSuKien,
            loaiThongBao,
            tieuDe,
            noiDung,
            maCN,
            vaiTroNhan,
            maNVNhan,
            lienKet,
            tone,
            khoa,
            maNVGui,
            maThamChieu,
            timeProvider.GetLocalNow().DateTime);
        await thongBao.Luu(capNhatNeuTonTai);
    }

    private static string TaoCursor(ThongBao thongBao)
    {
        var raw = $"{thongBao.ThoiGianTao.Ticks.ToString(CultureInfo.InvariantCulture)}|{thongBao.MaTB}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(raw));
    }

    private static (DateTime? ThoiDiem, string? MaTB) DocCursor(string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor)) return (null, null);
        try
        {
            var raw = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            var parts = raw.Split('|', 2);
            if (parts.Length != 2 || !long.TryParse(parts[0], CultureInfo.InvariantCulture, out var ticks))
                throw new FormatException();
            return (new DateTime(ticks), parts[1]);
        }
        catch (Exception ex) when (ex is FormatException or ArgumentOutOfRangeException)
        {
            throw new ArgumentException("Cursor thông báo không hợp lệ.");
        }
    }
}
