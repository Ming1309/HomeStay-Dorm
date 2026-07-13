namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class TraCuuPhieuCoc(Func<PhienDuLieu> taoPhienDuLieu)
{
    public async Task<IReadOnlyList<PhieuCoc>> TimKiem(
        string? maPhieuCoc, string? sdt, string? email, string? soGiayTo)
    {
        if (new[] { maPhieuCoc, sdt, email, soGiayTo }.All(string.IsNullOrWhiteSpace))
            throw new ArgumentException("Vui lòng nhập ít nhất một tiêu chí tìm kiếm");

        using var phien = taoPhienDuLieu();
        return await PhieuCoc.TraCuu(maPhieuCoc, sdt, email, soGiayTo);
    }

    public async Task<PhieuCoc> LayChiTiet(string maPhieuCoc)
    {
        using var phien = taoPhienDuLieu();
        return await PhieuCoc.DocChiTiet(maPhieuCoc)
            ?? throw new KeyNotFoundException("Không tìm thấy Phiếu cọc phù hợp");
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachCoTheHuy(string? text = null)
    {
        using var phien = taoPhienDuLieu();
        return await PhieuCoc.LayDanhSachCoTheHuy(text);
    }

    public async Task<IReadOnlyList<PhieuCoc>> LayDanhSachDaHuyChoDoiSoat()
    {
        using var phien = taoPhienDuLieu();
        return await PhieuCoc.LayDanhSachDaHuyChoDoiSoat();
    }
}
