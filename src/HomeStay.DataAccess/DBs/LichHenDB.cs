namespace HomeStay.DataAccess.DBs;

using Dapper;
using HomeStay.DataAccess.DbConnections;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeStay.DataAccess.DTOs;

public class LichHenDB
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public LichHenDB(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<LichHenDTO>> LayDanhSach(string loaiLich, string trangThai)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = @"
            SELECT lh.*, kh.MaKH, kh.HoTen as TenKhachHang, kh.NgaySinh, kh.SDT, kh.Email, kh.GioiTinh, kh.QuocTich, kh.LoaiGiayTo, kh.SoGiayTo 
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK = pdk.MaPDK
            LEFT JOIN KhachHang kh ON pdk.MaKH = kh.MaKH
            WHERE lh.LoaiLichHen = @LoaiLich AND lh.TrangThai = @TrangThai
              AND (@LoaiLich <> N'XemPhong' OR lh.MaPhieuCoc IS NULL)
        ";
        return await connection.QueryAsync<LichHenDTO>(sql, new { LoaiLich = loaiLich, TrangThai = trangThai });
    }

    public async Task<IEnumerable<LichHenDTO>> TimKiem(string text, string loaiLich, string trangThai)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = @"
            SELECT lh.*, kh.MaKH, kh.HoTen as TenKhachHang, kh.NgaySinh, kh.SDT, kh.Email, kh.GioiTinh, kh.QuocTich, kh.LoaiGiayTo, kh.SoGiayTo
            FROM LichHen lh
            LEFT JOIN PhieuDangKy pdk ON lh.MaPDK = pdk.MaPDK
            LEFT JOIN KhachHang kh ON pdk.MaKH = kh.MaKH
            WHERE lh.LoaiLichHen = @LoaiLich AND lh.TrangThai = @TrangThai
              AND (@LoaiLich <> N'XemPhong' OR lh.MaPhieuCoc IS NULL)
              AND (lh.MaLH LIKE '%' + @Text + '%' OR kh.HoTen LIKE '%' + @Text + '%' OR kh.SDT LIKE '%' + @Text + '%')
        ";
        return await connection.QueryAsync<LichHenDTO>(sql, new { Text = text, LoaiLich = loaiLich, TrangThai = trangThai });
    }

    public async Task<string?> LayMaKhachHang(string maLH)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = @"
            SELECT pdk.MaKH 
            FROM LichHen lh
            INNER JOIN PhieuDangKy pdk ON lh.MaPDK = pdk.MaPDK
            WHERE lh.MaLH = @MaLH
        ";
        return await connection.QueryFirstOrDefaultAsync<string>(sql, new { MaLH = maLH });
    }

    public async Task<bool> GanPhieuCoc(string maLichHen, string maPhieuCoc)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE LichHen
            SET MaPhieuCoc = @MaPhieuCoc,
                TrangThai = N'DaHoanThanh'
            WHERE MaLH = @MaLichHen
              AND LoaiLichHen = N'XemPhong'";
        return await connection.ExecuteAsync(sql, new { MaLichHen = maLichHen, MaPhieuCoc = maPhieuCoc }) == 1;
    }

    public async Task<bool> CapNhatTrangThai(string maLichHen, string trangThai)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE LichHen
            SET TrangThai = @TrangThai
            WHERE MaLH = @MaLichHen";
        return await connection.ExecuteAsync(sql, new { MaLichHen = maLichHen, TrangThai = trangThai }) == 1;
    }
}
