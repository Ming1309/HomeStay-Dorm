namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class TraCuuHopDong(Func<PhienDuLieu> taoPhienDuLieu)
{
    public async Task<IReadOnlyList<HopDong>> TimKiem(string? tuKhoa, string? trangThai)
    {
        using var phien = taoPhienDuLieu();
        // "all" = người dùng chọn "Tất cả" → trả mọi trạng thái
        var locTatCa = string.Equals(trangThai?.Trim(), "all", StringComparison.OrdinalIgnoreCase);
        // A2: không nhập tiêu chí (không từ khóa, không chọn trạng thái) → HĐ đang hiệu lực
        if (string.IsNullOrWhiteSpace(tuKhoa) && string.IsNullOrWhiteSpace(trangThai))
            return await HopDong.LayDanhSachHieuLuc();
        return await HopDong.TimKiem(tuKhoa, locTatCa ? null : trangThai);
    }

    public async Task<HopDong> LayChiTiet(string maHD)
    {
        using var phien = taoPhienDuLieu();
        return await HopDong.DocChiTiet(maHD)
            ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng phù hợp");
    }
}
