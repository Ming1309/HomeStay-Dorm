namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class LichHenDB
{
    public static Task<IReadOnlyList<LichHen>> LayDanhSachKhachChoCoc(string? text = null) => DocDanhSach(text);

    public static async Task<LichHen?> DocChiTiet(string maLichHen)
    {
        const string sql = """
            SELECT lh.*, kh.*
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK=pdk.MaPDK
            LEFT JOIN KhachHang kh ON pdk.MaKH=kh.MaKH
            WHERE lh.MaLH=@MaLichHen
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<LichHen, KhachHang, LichHen>(sql, (lich, khach) =>
        {
            lich.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
            return lich;
        }, new { MaLichHen = maLichHen }, PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return rows.SingleOrDefault();
    }

    public static async Task GanPhieuCoc(LichHen lichHen)
    {
        const string sql = """
            UPDATE LichHen SET MaPhieuCoc=@MaPhieuCoc
            WHERE MaLH=@MaLH AND LoaiLichHen=N'XemPhong'
              AND TrangThai=N'DaHoanThanh' AND MaPhieuCoc IS NULL
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, lichHen, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Lịch hẹn đã thay đổi, không thể gắn phiếu cọc.");
    }

    private static async Task<IReadOnlyList<LichHen>> DocDanhSach(string? text)
    {
        const string sql = """
            SELECT lh.*, kh.*
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK=pdk.MaPDK
            LEFT JOIN KhachHang kh ON pdk.MaKH=kh.MaKH
            WHERE lh.LoaiLichHen=N'XemPhong' AND lh.TrangThai=N'DaHoanThanh' AND lh.MaPhieuCoc IS NULL
              AND (@Text IS NULL OR lh.MaLH LIKE '%' + @Text + '%' OR kh.HoTen LIKE '%' + @Text + '%' OR kh.SDT LIKE '%' + @Text + '%')
            ORDER BY lh.NgayHen, lh.GioHen
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<LichHen, KhachHang, LichHen>(sql, (lich, khach) =>
        {
            lich.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
            return lich;
        }, new { Text = string.IsNullOrWhiteSpace(text) ? null : text.Trim() }, PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return rows.ToList();
    }
}
