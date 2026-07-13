namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class BienBanGiaoNhanDB
{
    public static async Task Them(BienBanGiaoNhan bienBan)
    {
        const string sql = """
            INSERT INTO BienBanGiaoNhan (MaBienBan, NgayBanGiao, LoaiBienBan, MaHD, MaNV)
            VALUES (@MaBienBan, @NgayBanGiao, @LoaiBienBan, @MaHD, @MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, bienBan, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu biên bản thu hồi.");
    }

    public static async Task<bool> TonTaiThuHoiTheoHD(string maHD)
    {
        const string sql = """
            SELECT COUNT(1)
            FROM BienBanGiaoNhan
            WHERE MaHD = @MaHD AND LoaiBienBan = N'ThuHoi'
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<IReadOnlyList<BienBanGiaoNhan>> GetDSBienBanThuHoiChuaXuLy(string? text = null)
    {
        const string sql = """
            SELECT
                bb.MaBienBan,
                bb.NgayBanGiao,
                bb.LoaiBienBan,
                bb.MaHD,
                bb.MaNV,
                kh.HoTen AS TenKhachHang,
                p.SoPhong,
                p.ToaNha,
                nv.HoTen AS TenNguoiLap
            FROM BienBanGiaoNhan bb
            INNER JOIN HopDong hd ON hd.MaHD = bb.MaHD
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            LEFT JOIN NhanVien nv ON nv.MaNV = bb.MaNV
            WHERE bb.LoaiBienBan = N'ThuHoi'
              AND EXISTS (
                  SELECT 1
                  FROM ChiTietGiaoNhan ct
                  WHERE ct.MaBienBan = bb.MaBienBan
                    AND ct.TinhTrang IN (N'Hư hỏng', N'Mất mát')
              )
              AND NOT EXISTS (
                  SELECT 1
                  FROM HoaDon hdon
                  WHERE hdon.MaHD = bb.MaHD
                    AND hdon.LoaiHoaDon = N'BoiThuong'
              )
              AND (
                  @Text IS NULL
                  OR bb.MaBienBan LIKE '%' + @Text + '%'
                  OR bb.MaHD LIKE '%' + @Text + '%'
                  OR kh.HoTen LIKE N'%' + @Text + '%'
                  OR p.SoPhong LIKE '%' + @Text + '%'
              )
            ORDER BY bb.NgayBanGiao DESC, bb.MaBienBan DESC
            """;

        var keyword = string.IsNullOrWhiteSpace(text) ? null : text.Trim();
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<BienBanGiaoNhan>(
            sql, new { Text = keyword }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<BienBanGiaoNhan?> GetBienBanTheoMaBienBan(string maBienBan)
    {
        const string sql = """
            SELECT
                bb.MaBienBan,
                bb.NgayBanGiao,
                bb.LoaiBienBan,
                bb.MaHD,
                bb.MaNV,
                kh.HoTen AS TenKhachHang,
                p.SoPhong,
                p.ToaNha,
                nv.HoTen AS TenNguoiLap
            FROM BienBanGiaoNhan bb
            INNER JOIN HopDong hd ON hd.MaHD = bb.MaHD
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            LEFT JOIN NhanVien nv ON nv.MaNV = bb.MaNV
            WHERE bb.MaBienBan = @MaBienBan
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<BienBanGiaoNhan>(
            sql, new { MaBienBan = maBienBan }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<bool> DaCoHoaDonBoiThuongTheoHD(string maHD)
    {
        const string sql = """
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM HoaDon
                WHERE MaHD = @MaHD AND LoaiHoaDon = N'BoiThuong'
            ) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END
            """;
        return await PhienDuLieu.Session.Connection.QuerySingleAsync<bool>(
            sql, new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
    }
}
