namespace HomeStay.DataAccess.DBs;

using Dapper;
using HomeStay.DataAccess.DbConnections;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeStay.DataAccess.DTOs;

public class PhongDB
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public PhongDB(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<PhongDTO>> LayDanhSachPhongVaGiuongTrong(int soLuong, string toaNha, string loaiPhong, decimal giaMin, decimal giaMax)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        string sql = @"
            SELECT 
                p.MaPhong, p.SoPhong, p.TrangThai, p.ToaNha,
                lp.MaLP, lp.TenLoaiPhong, lp.GiaThue, lp.SucChua,
                g.MaGiuong, g.SoGiuong, g.TrangThai AS TrangThaiGiuong
            FROM Phong p
            INNER JOIN LoaiPhong lp ON p.MaLP = lp.MaLP
            INNER JOIN Giuong g ON p.MaPhong = g.MaPhong
            WHERE g.TrangThai = N'Trong'
              AND p.TrangThai IN (N'Trong', N'ConGiuongTrong')
        ";
        
        // Note: For a real app, apply filters via Dapper parameters.
        if (!string.IsNullOrEmpty(toaNha)) sql += " AND p.ToaNha = @ToaNha";
        if (!string.IsNullOrEmpty(loaiPhong)) sql += " AND lp.MaLP = @LoaiPhong";
        if (giaMin > 0) sql += " AND lp.GiaThue >= @GiaMin";
        if (giaMax > 0) sql += " AND lp.GiaThue <= @GiaMax";

        var phongDict = new Dictionary<string, PhongDTO>();
        var flatResult = await connection.QueryAsync<dynamic>(sql, new { ToaNha = toaNha, LoaiPhong = loaiPhong, GiaMin = giaMin, GiaMax = giaMax });
        
        foreach (var row in flatResult)
        {
            string maPhong = row.MaPhong;
            if (!phongDict.TryGetValue(maPhong, out var phongDto))
            {
                phongDto = new PhongDTO
                {
                    MaPhong = maPhong,
                    SoPhong = row.SoPhong,
                    TrangThai = row.TrangThai,
                    ToaNha = row.ToaNha,
                    MaLP = row.MaLP,
                    TenLoaiPhong = row.TenLoaiPhong,
                    GiaThue = (decimal)row.GiaThue,
                    SucChua = (int)row.SucChua,
                    Giuongs = new List<GiuongDTO>()
                };
                phongDict.Add(maPhong, phongDto);
            }
            
            phongDto.Giuongs.Add(new GiuongDTO
            {
                MaGiuong = row.MaGiuong,
                SoGiuong = row.SoGiuong,
                TrangThai = row.TrangThaiGiuong
            });
            phongDto.SoGiuongTrong = phongDto.Giuongs.Count;
        }

        // Apply SoLuong filter
        var result = new List<PhongDTO>();
        foreach (var p in phongDict.Values)
        {
            if (p.SoGiuongTrong >= soLuong) result.Add(p);
        }
        return result;
    }

    public async Task<IEnumerable<PhongDTO>> LayDanhSachPhongTrong(string toaNha, string loaiPhong, decimal giaMin, decimal giaMax)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = @"
            SELECT 
                p.MaPhong, p.SoPhong, p.TrangThai, p.ToaNha,
                lp.MaLP, lp.TenLoaiPhong, lp.GiaThue, lp.SucChua,
                g.MaGiuong, g.SoGiuong, g.TrangThai AS TrangThaiGiuong
            FROM Phong p
            INNER JOIN LoaiPhong lp ON p.MaLP = lp.MaLP
            INNER JOIN Giuong g ON p.MaPhong = g.MaPhong
            WHERE p.TrangThai = N'Trong'
              AND NOT EXISTS (
                  SELECT 1
                  FROM Giuong giuongKiemTra
                  WHERE giuongKiemTra.MaPhong = p.MaPhong
                    AND giuongKiemTra.TrangThai <> N'Trong'
              )
        ";
        
        if (!string.IsNullOrEmpty(toaNha)) sql += " AND p.ToaNha = @ToaNha";
        if (!string.IsNullOrEmpty(loaiPhong)) sql += " AND lp.MaLP = @LoaiPhong";
        if (giaMin > 0) sql += " AND lp.GiaThue >= @GiaMin";
        if (giaMax > 0) sql += " AND lp.GiaThue <= @GiaMax";

        var phongDict = new System.Collections.Generic.Dictionary<string, PhongDTO>();
        var flatResult = await connection.QueryAsync<dynamic>(sql, new { ToaNha = toaNha, LoaiPhong = loaiPhong, GiaMin = giaMin, GiaMax = giaMax });
        
        foreach (var row in flatResult)
        {
            string maPhong = row.MaPhong;
            if (!phongDict.TryGetValue(maPhong, out var phongDto))
            {
                phongDto = new PhongDTO
                {
                    MaPhong = maPhong,
                    SoPhong = row.SoPhong,
                    TrangThai = row.TrangThai,
                    ToaNha = row.ToaNha,
                    MaLP = row.MaLP,
                    TenLoaiPhong = row.TenLoaiPhong,
                    GiaThue = (decimal)row.GiaThue,
                    SucChua = (int)row.SucChua,
                    Giuongs = new System.Collections.Generic.List<GiuongDTO>()
                };
                phongDict.Add(maPhong, phongDto);
            }
            
            phongDto.Giuongs.Add(new GiuongDTO
            {
                MaGiuong = row.MaGiuong,
                SoGiuong = row.SoGiuong,
                TrangThai = row.TrangThaiGiuong
            });
            phongDto.SoGiuongTrong = phongDto.Giuongs.Count;
        }

        return phongDict.Values;
    }

    public async Task<bool> CapNhatTrangThai(IEnumerable<string> dsGiuong, string trangThai)
    {
        using var connection = _connectionFactory.CreateConnection();
        string sql = "UPDATE Giuong SET TrangThai = @TrangThai WHERE MaGiuong IN @MaGiuongList";
        await connection.ExecuteAsync(sql, new { TrangThai = trangThai, MaGiuongList = dsGiuong });
        
        string updatePhongSql = @"
            UPDATE p
            SET p.TrangThai = CASE 
                WHEN NOT EXISTS (SELECT 1 FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = N'Trong')
                    THEN CASE
                        WHEN EXISTS (SELECT 1 FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai = N'GiuCho') THEN N'GiuCho'
                        ELSE N'DangSuDung'
                    END
                WHEN EXISTS (SELECT 1 FROM Giuong g WHERE g.MaPhong = p.MaPhong AND g.TrangThai <> N'Trong') THEN N'ConGiuongTrong'
                ELSE N'Trong'
            END
            FROM Phong p
            WHERE p.MaPhong IN (SELECT MaPhong FROM Giuong WHERE MaGiuong IN @MaGiuongList)
        ";
        await connection.ExecuteAsync(updatePhongSql, new { MaGiuongList = dsGiuong });
        return true;
    }

    public async Task<bool> CapNhatTrangThaiPhong(string maPhong, string trangThai)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Phong
            SET TrangThai = @TrangThai
            WHERE MaPhong = @MaPhong";
        await connection.ExecuteAsync(sql, new { MaPhong = maPhong, TrangThai = trangThai });
        return true;
    }
}
