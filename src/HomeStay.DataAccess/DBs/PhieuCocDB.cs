namespace HomeStay.DataAccess.DBs;

using Dapper;
using HomeStay.DataAccess.DbConnections;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeStay.DataAccess.DTOs;

public class PhieuCocDB
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public PhieuCocDB(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> ThemPhieuCoc(PhieuCocDTO pc)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = @"
            INSERT INTO PhieuCoc (MaPhieuCoc, HanThanhToan, HinhThucThue, SoGiuongThue, TongTien, ThoiDiemCoc, AnhMinhChung, TrangThai, MaKH, MaPhong, MaNV)
            VALUES (@MaPhieuCoc, @HanThanhToan, @HinhThucThue, @SoGiuongThue, @TongTien, @ThoiDiemCoc, @AnhMinhChung, @TrangThai, @MaKH, @MaPhong, @MaNV)";
        await connection.ExecuteAsync(sql, pc);
        return true;
    }

    public async Task<bool> ThemChiTiet(string maPhieu, List<string> dsGiuong)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = @"
            INSERT INTO ChiTietPhieuCoc (MaPhieuCoc, MaGiuong)
            VALUES (@MaPhieuCoc, @MaGiuong)";
        foreach (var maGiuong in dsGiuong)
        {
            await connection.ExecuteAsync(sql, new { MaPhieuCoc = maPhieu, MaGiuong = maGiuong });
        }
        return true;
    }

    public async Task<bool> ThemThanhVien(string maPhieu, string maKH, string vaiTro)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = @"
            INSERT INTO ThanhVienDangKy (MaPhieuCoc, MaKH, VaiTro, TrangThaiDuyet)
            VALUES (@MaPhieuCoc, @MaKH, @VaiTro, N'ChoDuyet')";
        await connection.ExecuteAsync(sql, new { MaPhieuCoc = maPhieu, MaKH = maKH, VaiTro = vaiTro });
        return true;
    }
}
