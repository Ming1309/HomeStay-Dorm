namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.DataAccess.DbConnections;

public static class HopDongDB
{
    public static async Task<bool> TonTaiTheoPhieuCoc(string maPhieuCoc)
    {
        const string sql = "SELECT COUNT(1) FROM HopDong WHERE MaPhieuCoc=@MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction) > 0;
    }

    // Cài đặt tối thiểu phục vụ tra cứu tạo lịch hẹn (Tránh conflict với UC khác)
    public static async Task<IReadOnlyList<dynamic>> TimKiemHopDongHieuLuc(string? tuKhoa)
    {
        const string sql = """
            SELECT hd.MaHD, hd.TrangThai, kh.MaKH, kh.HoTen, kh.SDT
            FROM HopDong hd
            JOIN PhieuCoc pc ON hd.MaPhieuCoc = pc.MaPhieuCoc
            JOIN KhachHang kh ON pc.MaKH = kh.MaKH
            WHERE hd.TrangThai = N'DangHieuLuc'
              AND (@TuKhoa IS NULL OR hd.MaHD LIKE '%' + @TuKhoa + '%' OR kh.HoTen LIKE '%' + @TuKhoa + '%' OR kh.SDT LIKE '%' + @TuKhoa + '%')
            ORDER BY hd.NgayBatDau DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync(
            sql, new { TuKhoa = string.IsNullOrWhiteSpace(tuKhoa) ? null : tuKhoa.Trim() }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> KiemTraConHopLe(string maHD)
    {
        const string sql = "SELECT COUNT(1) FROM HopDong WHERE MaHD = @MaHD AND TrangThai = N'DangHieuLuc'";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction) > 0;
    }
}
