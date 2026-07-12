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
