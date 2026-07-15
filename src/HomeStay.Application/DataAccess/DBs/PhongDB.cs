namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhongDB
{
    public static async Task<IReadOnlyList<Phong>> LayPhongOGhep(int soLuong, string? toaNha,
        string? loaiPhong, decimal giaMin, decimal giaMax, string maCN, string? gioiTinh)
    {
        var phongs = await DocPhongVaGiuong(null, maCN);
        return LocTheoYeuCauChung(phongs, toaNha, loaiPhong, giaMin, giaMax, gioiTinh)
            .Where(p => (p.TrangThai == "Trong" || p.TrangThai == "ConGiuongTrong")
                && p.SoGiuongTrong >= Math.Max(soLuong, 1))
            .ToList();
    }

    public static async Task<IReadOnlyList<Phong>> LayPhongNguyenCan(string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax, string maCN, string? gioiTinh)
    {
        var phongs = await DocPhongVaGiuong(null, maCN);
        return LocTheoYeuCauChung(phongs, toaNha, loaiPhong, giaMin, giaMax, gioiTinh)
            .Where(p => p.TrangThai == "Trong" && p.Giuongs.Count > 0
                && p.Giuongs.All(g => g.TrangThai == "Trong"))
            .ToList();
    }

    public static async Task<IReadOnlyList<Phong>> LayPhongTheoBoLoc(string? toaNha, string? tang,
        string? maLP, string? maCN, string? trangThai, decimal giaMin, decimal giaMax)
    {
        var phongs = await DocPhongVaGiuong(null, maCN);
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

    public static Task<Phong?> DocChiTiet(string maPhong) => DocChiTiet(maPhong, null);

    public static async Task<Phong?> DocChiTiet(string maPhong, string? maCN) =>
        (await DocPhongVaGiuong(maPhong, maCN)).SingleOrDefault();

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
        const string updateBed = "UPDATE Giuong SET TrangThai=N'Trong' WHERE MaGiuong=@MaGiuong AND MaPhong=@MaPhong AND TrangThai IN (N'GiuCho',N'DaCoc')";
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

    // ---- UC 1.4.25: Quan ly phong (QuanTri) ----

    public static async Task<IReadOnlyList<Phong>> LayDanhSachQuanTri(string? text, string? maCN,
        string? toaNha, string? trangThai)
    {
        const string sql = """
            SELECT p.MaPhong,p.SoPhong,p.ToaNha,p.Tang,p.GioiTinhChoPhep,p.TrangThai,p.MaCN,
                   cn.TenChiNhanh,
                   lp.MaLP,lp.TenLoaiPhong,lp.SucChua,lp.GiaThue,
                   g.MaGiuong,g.SoGiuong,g.TrangThai,g.MaPhong
            FROM Phong p
            INNER JOIN LoaiPhong lp ON p.MaLP=lp.MaLP
            LEFT JOIN ChiNhanh cn ON p.MaCN=cn.MaCN
            LEFT JOIN Giuong g ON p.MaPhong=g.MaPhong
            WHERE (@Text IS NULL OR p.SoPhong LIKE @Like OR p.ToaNha LIKE @Like OR p.MaPhong LIKE @Like)
              AND (@MaCN IS NULL OR p.MaCN=@MaCN)
              AND (@ToaNha IS NULL OR p.ToaNha=@ToaNha)
              AND (@TrangThai IS NULL OR p.TrangThai=@TrangThai)
            ORDER BY p.MaPhong, g.SoGiuong
            """;
        var text_ = string.IsNullOrWhiteSpace(text) ? null : text.Trim();
        var parameters = new
        {
            Text = text_,
            Like = text_ is null ? null : $"%{text_}%",
            MaCN = string.IsNullOrWhiteSpace(maCN) ? null : maCN,
            ToaNha = string.IsNullOrWhiteSpace(toaNha) ? null : toaNha,
            TrangThai = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai,
        };
        var dict = new Dictionary<string, Phong>();
        await PhienDuLieu.Session.Connection.QueryAsync<Phong, LoaiPhong, Giuong, Phong>(sql,
            (phong, loai, giuong) =>
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
            }, parameters, PhienDuLieu.Session.Transaction, splitOn: "MaLP,MaGiuong");
        return dict.Values.ToList();
    }

    public static async Task<bool> TrungSoPhong(string maCN, string soPhong, string? maPhongBoQua)
    {
        const string sql = """
            SELECT COUNT(1) FROM Phong
            WHERE MaCN=@MaCN AND SoPhong=@SoPhong
              AND (@MaPhongBoQua IS NULL OR MaPhong<>@MaPhongBoQua)
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { MaCN = maCN, SoPhong = soPhong, MaPhongBoQua = maPhongBoQua },
            PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<bool> DangDuocThamChieu(string maPhong)
    {
        // Phong duoc tham chieu boi phieu coc, hop dong (qua giuong), hoac cac giuong dang su dung.
        const string sql = """
            SELECT CASE WHEN
                EXISTS (SELECT 1 FROM PhieuCoc WHERE MaPhong=@MaPhong
                        AND TrangThai NOT IN (N'DaHuy', N'DaDuyet'))
                OR EXISTS (SELECT 1 FROM ChiTietHopDong cthd
                           INNER JOIN Giuong g ON cthd.MaGiuong=g.MaGiuong
                           WHERE g.MaPhong=@MaPhong AND cthd.TrangThaiThue=N'DangThue')
                OR EXISTS (SELECT 1 FROM Giuong WHERE MaPhong=@MaPhong
                           AND TrangThai IN (N'GiuCho', N'DaCoc', N'DangSuDung'))
            THEN 1 ELSE 0 END
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(sql,
            new { MaPhong = maPhong }, PhienDuLieu.Session.Transaction) == 1;
    }

    public static async Task Them(Phong phong)
    {
        phong.MaPhong = await MaSoDB.LayMaMoi("Phong");
        const string sql = """
            INSERT INTO Phong (MaPhong,SoPhong,ToaNha,Tang,GioiTinhChoPhep,TrangThai,MaLP,MaCN)
            VALUES (@MaPhong,@SoPhong,@ToaNha,@Tang,@GioiTinhChoPhep,@TrangThai,@MaLP,@MaCN)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phong, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo phòng.");
    }

    public static async Task CapNhatThongTin(Phong phong)
    {
        const string sql = """
            UPDATE Phong
            SET SoPhong=@SoPhong, ToaNha=@ToaNha, Tang=@Tang, GioiTinhChoPhep=@GioiTinhChoPhep,
                TrangThai=@TrangThai, MaLP=@MaLP, MaCN=@MaCN
            WHERE MaPhong=@MaPhong
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phong, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật phòng.");
    }

    public static async Task Xoa(string maPhong)
    {
        // Xoa tai san gan phong va giuong con lai truoc khi xoa phong (trong cung giao dich).
        await PhienDuLieu.Session.Connection.ExecuteAsync(
            "DELETE FROM Phong_TaiSan WHERE MaPhong=@MaPhong",
            new { MaPhong = maPhong }, PhienDuLieu.Session.Transaction);
        await PhienDuLieu.Session.Connection.ExecuteAsync(
            "DELETE FROM Giuong WHERE MaPhong=@MaPhong",
            new { MaPhong = maPhong }, PhienDuLieu.Session.Transaction);
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            "DELETE FROM Phong WHERE MaPhong=@MaPhong",
            new { MaPhong = maPhong }, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể xóa phòng.");
    }

    private static IEnumerable<Phong> LocTheoYeuCauChung(IEnumerable<Phong> phongs, string? toaNha,
        string? loaiPhong, decimal giaMin, decimal giaMax, string? gioiTinh) =>
        phongs.Where(p => p.PhuHopYeuCau(toaNha, loaiPhong, giaMin, giaMax, gioiTinh));

    private static async Task<IReadOnlyList<Phong>> DocPhongVaGiuong(string? maPhong, string? maCN = null)
    {
        const string sql = """
            SELECT p.MaPhong,p.SoPhong,p.ToaNha,p.Tang,p.GioiTinhChoPhep,p.TrangThai,p.MaCN,
                   cn.TenChiNhanh,
                   lp.MaLP,lp.TenLoaiPhong,lp.SucChua,lp.GiaThue,
                   g.MaGiuong,g.SoGiuong,g.TrangThai,g.MaPhong
            FROM Phong p
            INNER JOIN LoaiPhong lp ON p.MaLP=lp.MaLP
            LEFT JOIN ChiNhanh cn ON p.MaCN=cn.MaCN
            LEFT JOIN Giuong g ON p.MaPhong=g.MaPhong
            WHERE (@MaPhong IS NULL OR p.MaPhong=@MaPhong)
              AND (@MaCN IS NULL OR p.MaCN=@MaCN)
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
        }, new { MaPhong = maPhong, MaCN = maCN }, PhienDuLieu.Session.Transaction, splitOn: "MaLP,MaGiuong");
        return dict.Values.ToList();
    }
}
