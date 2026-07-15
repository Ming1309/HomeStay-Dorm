namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class GiuongDB
{
    // ---- UC 1.4.25: Quan ly giuong (QuanTri) ----

    public static async Task<IReadOnlyList<Giuong>> LayDanhSachQuanTri(string? text, string? maPhong,
        string? trangThai)
    {
        const string sql = """
            SELECT g.MaGiuong, g.SoGiuong, g.TrangThai, g.MaPhong,
                   p.SoPhong, p.ToaNha
            FROM Giuong g
            INNER JOIN Phong p ON g.MaPhong=p.MaPhong
            WHERE (@Text IS NULL OR g.SoGiuong LIKE @Like OR g.MaGiuong LIKE @Like
                   OR p.SoPhong LIKE @Like OR p.ToaNha LIKE @Like)
              AND (@MaPhong IS NULL OR g.MaPhong=@MaPhong)
              AND (@TrangThai IS NULL OR g.TrangThai=@TrangThai)
            ORDER BY p.MaPhong, g.SoGiuong
            """;
        var text_ = string.IsNullOrWhiteSpace(text) ? null : text.Trim();
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<GiuongRow>(sql, new
        {
            Text = text_,
            Like = text_ is null ? null : $"%{text_}%",
            MaPhong = string.IsNullOrWhiteSpace(maPhong) ? null : maPhong,
            TrangThai = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai,
        }, PhienDuLieu.Session.Transaction);
        return rows.Select(r => r.ToGiuong()).ToList();
    }

    public static async Task<Giuong?> DocChiTiet(string maGiuong)
    {
        const string sql = """
            SELECT g.MaGiuong, g.SoGiuong, g.TrangThai, g.MaPhong, p.SoPhong, p.ToaNha
            FROM Giuong g
            INNER JOIN Phong p ON g.MaPhong=p.MaPhong
            WHERE g.MaGiuong=@MaGiuong
            """;
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<GiuongRow>(sql,
            new { MaGiuong = maGiuong }, PhienDuLieu.Session.Transaction);
        return row?.ToGiuong();
    }

    public static async Task<bool> TrungSoGiuong(string maPhong, string soGiuong, string? maGiuongBoQua)
    {
        const string sql = """
            SELECT COUNT(1) FROM Giuong
            WHERE MaPhong=@MaPhong AND SoGiuong=@SoGiuong
              AND (@MaGiuongBoQua IS NULL OR MaGiuong<>@MaGiuongBoQua)
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { MaPhong = maPhong, SoGiuong = soGiuong, MaGiuongBoQua = maGiuongBoQua },
            PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<bool> DangDuocThamChieu(string maGiuong)
    {
        const string sql = """
            SELECT CASE WHEN
                EXISTS (SELECT 1 FROM ChiTietPhieuCoc ctpc
                        INNER JOIN PhieuCoc pc ON ctpc.MaPhieuCoc=pc.MaPhieuCoc
                        WHERE ctpc.MaGiuong=@MaGiuong AND pc.TrangThai NOT IN (N'DaHuy', N'DaDuyet'))
                OR EXISTS (SELECT 1 FROM ChiTietHopDong WHERE MaGiuong=@MaGiuong AND TrangThaiThue=N'DangThue')
                OR EXISTS (SELECT 1 FROM ChiTietHoaDon WHERE MaGiuong=@MaGiuong)
                OR EXISTS (SELECT 1 FROM PhieuDoiSoat WHERE MaGiuong=@MaGiuong)
            THEN 1 ELSE 0 END
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { MaGiuong = maGiuong }, PhienDuLieu.Session.Transaction) == 1;
    }

    public static async Task Them(Giuong giuong)
    {
        giuong.MaGiuong = await MaSoDB.LayMaMoi("Giuong");
        const string sql = """
            INSERT INTO Giuong (MaGiuong,SoGiuong,TrangThai,MaPhong)
            VALUES (@MaGiuong,@SoGiuong,@TrangThai,@MaPhong)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, giuong, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo giường.");
    }

    public static async Task CapNhatThongTin(Giuong giuong)
    {
        const string sql = """
            UPDATE Giuong SET SoGiuong=@SoGiuong, TrangThai=@TrangThai, MaPhong=@MaPhong
            WHERE MaGiuong=@MaGiuong
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, giuong, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật giường.");
    }

    public static async Task Xoa(string maGiuong)
    {
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            "DELETE FROM Giuong WHERE MaGiuong=@MaGiuong",
            new { MaGiuong = maGiuong }, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể xóa giường.");
    }

    private sealed class GiuongRow
    {
        public string MaGiuong { get; set; } = string.Empty;
        public string SoGiuong { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public string MaPhong { get; set; } = string.Empty;
        public string SoPhong { get; set; } = string.Empty;
        public string? ToaNha { get; set; }

        public Giuong ToGiuong() => new()
        {
            MaGiuong = MaGiuong,
            SoGiuong = SoGiuong,
            TrangThai = TrangThai,
            MaPhong = MaPhong,
            SoPhong = SoPhong,
            ToaNha = ToaNha,
        };
    }

    public static async Task<bool> UpdateTrangThai(string maGiuong, string trangThai)
    {
        const string sql = "UPDATE Giuong SET TrangThai=@TrangThai WHERE MaGiuong=@MaGiuong";
        return await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaGiuong = maGiuong, TrangThai = trangThai },
            PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task UpdateTrangThaiBatch(IReadOnlyList<string> dsMaGiuong, string trangThai)
    {
        const string sql = "UPDATE Giuong SET TrangThai=@TrangThai WHERE MaGiuong=@MaGiuong";
        foreach (var maGiuong in dsMaGiuong)
        {
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
                    new { MaGiuong = maGiuong, TrangThai = trangThai },
                    PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException($"Giường {maGiuong} không thể cập nhật trạng thái.");
        }
    }

    public static async Task UpdateTrangThaiTheoHopDong(string maHD, string trangThai)
    {
        const string sql = """
            UPDATE g
            SET g.TrangThai = @TrangThai
            FROM Giuong g
            INNER JOIN ChiTietHopDong cthd ON g.MaGiuong = cthd.MaGiuong
            WHERE cthd.MaHD = @MaHD
            """;
        await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaHD = maHD, TrangThai = trangThai }, PhienDuLieu.Session.Transaction);
    }
}
