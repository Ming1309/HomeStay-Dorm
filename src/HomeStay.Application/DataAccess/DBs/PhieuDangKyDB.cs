namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhieuDangKyDB
{
    // Cài đặt tối thiểu để phục vụ tra cứu tạo lịch hẹn (Tránh conflict với người làm UC1)
    public static async Task<IReadOnlyList<dynamic>> TimKiemPhieuDuDieuKien(string? tuKhoa)
    {
        const string sql = """
            SELECT pdk.MaPDK, pdk.TrangThai, kh.MaKH, kh.HoTen, kh.SDT
            FROM PhieuDangKy pdk
            JOIN KhachHang kh ON pdk.MaKH = kh.MaKH
            WHERE pdk.TrangThai = N'DangXuLy'
              AND (@TuKhoa IS NULL OR pdk.MaPDK LIKE '%' + @TuKhoa + '%' OR kh.HoTen LIKE '%' + @TuKhoa + '%' OR kh.SDT LIKE '%' + @TuKhoa + '%')
            ORDER BY pdk.MaPDK DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync(
            sql, new { TuKhoa = string.IsNullOrWhiteSpace(tuKhoa) ? null : tuKhoa.Trim() }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> KiemTraConHopLe(string maPDK)
    {
        const string sql = "SELECT COUNT(1) FROM PhieuDangKy WHERE MaPDK = @MaPDK AND TrangThai = N'DangXuLy'";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaPDK = maPDK }, PhienDuLieu.Session.Transaction) > 0;
    }
}
