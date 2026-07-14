namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhongDB
{
    public static async Task<IReadOnlyList<Phong>> LayPhongOGhep(int soLuong, string? toaNha,
        string? loaiPhong, decimal giaMin, decimal giaMax)
    {
        var phongs = await DocPhongVaGiuong(null);
        return LocTheoYeuCauChung(phongs, toaNha, loaiPhong, giaMin, giaMax)
            .Where(p => (p.TrangThai == "Trong" || p.TrangThai == "ConGiuongTrong")
                && p.SoGiuongTrong >= Math.Max(soLuong, 1))
            .ToList();
    }

    public static async Task<IReadOnlyList<Phong>> LayPhongNguyenCan(string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax)
    {
        var phongs = await DocPhongVaGiuong(null);
        return LocTheoYeuCauChung(phongs, toaNha, loaiPhong, giaMin, giaMax)
            .Where(p => p.TrangThai == "Trong" && p.Giuongs.Count > 0
                && p.Giuongs.All(g => g.TrangThai == "Trong"))
            .ToList();
    }

    public static async Task<IReadOnlyList<Phong>> LayPhongTheoBoLoc(string? toaNha, string? tang,
        string? maLP, string? maCN, string? trangThai, decimal giaMin, decimal giaMax)
    {
        var phongs = await DocPhongVaGiuong(null);
        return phongs.Where(p => 
            (string.IsNullOrWhiteSpace(toaNha) || p.ToaNha == toaNha) &&
            (string.IsNullOrWhiteSpace(tang) || p.Tang == tang) &&
            (string.IsNullOrWhiteSpace(maLP) || p.MaLP == maLP) &&
            (string.IsNullOrWhiteSpace(maCN) || p.MaCN == maCN) &&
            (string.IsNullOrWhiteSpace(trangThai) || p.TrangThai == trangThai) &&
            (giaMin <= 0 || p.LoaiPhong.GiaThue >= giaMin) &&
            (giaMax <= 0 || p.LoaiPhong.GiaThue <= giaMax)
        ).ToList();
    }

    public static async Task<Phong?> DocChiTiet(string maPhong) =>
        (await DocPhongVaGiuong(maPhong)).SingleOrDefault();

    public static async Task CapNhat(Phong phong)
    {
        const string updateBed = "UPDATE Giuong SET TrangThai=@TrangThai WHERE MaGiuong=@MaGiuong AND MaPhong=@MaPhong AND TrangThai=N'Trong'";
        foreach (var giuong in phong.GiuongsVuaGiu)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(updateBed, giuong, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException($"Giường {giuong.MaGiuong} vừa được người khác chọn.");

        const string updateRoom = "UPDATE Phong SET TrangThai=@TrangThai WHERE MaPhong=@MaPhong";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(updateRoom, phong, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật phòng.");
    }

    public static async Task CapNhatDatCoc(Phong phong)
    {
        const string updateBed = "UPDATE Giuong SET TrangThai=N'DaCoc' WHERE MaGiuong=@MaGiuong AND MaPhong=@MaPhong AND TrangThai=N'GiuCho'";
        foreach (var giuong in phong.GiuongsVuaDatCoc)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(updateBed, giuong, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException($"Giường {giuong.MaGiuong} đã được xử lý bởi người khác hoặc không còn giữ chỗ.");

        const string updateRoom = """
            UPDATE Phong
            SET TrangThai = CASE
                WHEN NOT EXISTS (SELECT 1 FROM Giuong WHERE MaPhong=@MaPhong AND TrangThai<>N'DaCoc') THEN N'DaCoc'
                WHEN EXISTS (SELECT 1 FROM Giuong WHERE MaPhong=@MaPhong AND TrangThai=N'Trong') THEN N'ConGiuongTrong'
                WHEN EXISTS (SELECT 1 FROM Giuong WHERE MaPhong=@MaPhong AND TrangThai=N'GiuCho') THEN N'GiuCho'
                ELSE TrangThai
            END
            WHERE MaPhong=@MaPhong
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(updateRoom, phong, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật trạng thái phòng sau khi xác nhận cọc.");
    }

    public static async Task CapNhatGiaiPhongDatCoc(Phong phong)
    {
        const string updateBed = "UPDATE Giuong SET TrangThai=N'Trong' WHERE MaGiuong=@MaGiuong AND MaPhong=@MaPhong AND TrangThai IN (N'GiuCho',N'DaCoc',N'Trong')";
        foreach (var giuong in phong.GiuongsVuaGiaiPhong)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(updateBed, giuong, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException($"Giường {giuong.MaGiuong} đã được xử lý bởi người khác hoặc không còn thuộc phiếu cọc.");

        const string updateRoom = """
            UPDATE Phong
            SET TrangThai = CASE
                WHEN NOT EXISTS (SELECT 1 FROM Giuong WHERE MaPhong=@MaPhong AND TrangThai<>N'Trong') THEN N'Trong'
                ELSE N'ConGiuongTrong'
            END
            WHERE MaPhong=@MaPhong
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(updateRoom, phong, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật trạng thái phòng sau khi hủy phiếu cọc.");
    }

    private static IEnumerable<Phong> LocTheoYeuCauChung(IEnumerable<Phong> phongs, string? toaNha,
        string? loaiPhong, decimal giaMin, decimal giaMax) =>
        phongs.Where(p => p.PhuHopYeuCau(toaNha, loaiPhong, giaMin, giaMax));

    private static async Task<IReadOnlyList<Phong>> DocPhongVaGiuong(string? maPhong)
    {
        const string sql = """
            SELECT p.MaPhong,p.SoPhong,p.ToaNha,p.Tang,p.GioiTinhChoPhep,p.TrangThai,p.MaCN,
                   lp.MaLP,lp.TenLoaiPhong,lp.SucChua,lp.GiaThue,
                   g.MaGiuong,g.SoGiuong,g.TrangThai,g.MaPhong
            FROM Phong p
            INNER JOIN LoaiPhong lp ON p.MaLP=lp.MaLP
            LEFT JOIN Giuong g ON p.MaPhong=g.MaPhong
            WHERE (@MaPhong IS NULL OR p.MaPhong=@MaPhong)
            ORDER BY p.MaPhong, g.SoGiuong
            """;
        var dict = new Dictionary<string, Phong>();
        await PhienDuLieu.Session.Connection.QueryAsync<Phong, LoaiPhong, Giuong, Phong>(sql, (phong, loai, giuong) =>
        {
            if (!dict.TryGetValue(phong.MaPhong, out var current))
            {
                current = phong;
                current.LoaiPhong = loai;
                current.MaLP = loai.MaLP;
                current.Giuongs = [];
                dict.Add(current.MaPhong, current);
            }
            if (!string.IsNullOrWhiteSpace(giuong?.MaGiuong)) current.Giuongs.Add(giuong);
            return current;
        }, new { MaPhong = maPhong }, PhienDuLieu.Session.Transaction, splitOn: "MaLP,MaGiuong");
        return dict.Values.ToList();
    }
}
