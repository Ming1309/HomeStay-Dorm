namespace HomeStay.DataAccess.DBs;

using Dapper;
using HomeStay.DataAccess.DbConnections;
using HomeStay.DataAccess.DTOs;
using System.Data;
using System.Threading.Tasks;

public class KhachHangDB
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public KhachHangDB(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<KhachHangDTO> DocThongTin(string maKH)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = "SELECT * FROM KhachHang WHERE MaKH = @MaKH";
        return await connection.QueryFirstOrDefaultAsync<KhachHangDTO>(sql, new { MaKH = maKH });
    }

    public async Task<bool> CapNhat(KhachHangDTO kh)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string checkSql = @"
            SELECT TOP 1 MaKH
            FROM KhachHang
            WHERE MaKH = @MaKH
               OR (NULLIF(@SoGiayTo, '') IS NOT NULL AND SoGiayTo = @SoGiayTo)
            ORDER BY CASE WHEN MaKH = @MaKH THEN 0 ELSE 1 END";
        var existingMaKH = await connection.QueryFirstOrDefaultAsync<string>(checkSql, kh);

        if (!string.IsNullOrEmpty(existingMaKH))
        {
            kh.MaKH = existingMaKH;
            string updateSql = @"
                UPDATE KhachHang 
                SET HoTen = @HoTen, NgaySinh = @NgaySinh, GioiTinh = @GioiTinh,
                    QuocTich = @QuocTich, LoaiGiayTo = @LoaiGiayTo, SoGiayTo = @SoGiayTo,
                    DiaChiThuongTru = @DiaChiThuongTru, SDT = @SDT, Email = @Email
                WHERE MaKH = @MaKH";
            await connection.ExecuteAsync(updateSql, kh);
        }
        else
        {
            string insertSql = @"
                INSERT INTO KhachHang (MaKH, HoTen, NgaySinh, GioiTinh, QuocTich, LoaiGiayTo, SoGiayTo, SDT, Email)
                VALUES (@MaKH, @HoTen, @NgaySinh, @GioiTinh, @QuocTich, @LoaiGiayTo, @SoGiayTo, @SDT, @Email)";
            await connection.ExecuteAsync(insertSql, kh);
        }
        return true;
    }
}
