namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhieuCocDB
{
    public static async Task<IReadOnlyList<PhieuCoc>> TraCuu(
        string? maPhieuCoc, string? sdt, string? email, string? soGiayTo)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.ThoiDiemHuy,pc.MaNVHuy,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   CASE WHEN pt.MaPT IS NOT NULL OR pc.TrangThai IN (N'DaThanhToan', N'DaDuyet', N'HoanThanh') THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS DaDongTien,
                   kh.HoTen AS TenKhachHang,kh.SDT,kh.Email,kh.SoGiayTo,p.SoPhong,p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            LEFT JOIN PhieuThu pt ON pt.MaPhieuCoc=pc.MaPhieuCoc
            WHERE (@MaPhieuCoc IS NULL OR pc.MaPhieuCoc LIKE '%' + @MaPhieuCoc + '%')
              AND (@SDT IS NULL OR kh.SDT LIKE '%' + @SDT + '%')
              AND (@Email IS NULL OR kh.Email LIKE '%' + @Email + '%')
              AND (@SoGiayTo IS NULL OR kh.SoGiayTo LIKE '%' + @SoGiayTo + '%')
            ORDER BY pc.ThoiDiemCoc DESC,pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql, new
        {
            MaPhieuCoc = ChuanHoa(maPhieuCoc), SDT = ChuanHoa(sdt),
            Email = ChuanHoa(email), SoGiayTo = ChuanHoa(soGiayTo),
        }, PhienDuLieu.Session.Transaction);
        return rows.Select(TaoPhieuCocDanhSach).ToList();
    }

    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachCoTheHuy(string? text = null)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.ThoiDiemHuy,pc.MaNVHuy,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   CASE WHEN pt.MaPT IS NOT NULL OR pc.TrangThai IN (N'DaThanhToan', N'DaDuyet', N'HoanThanh') THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS DaDongTien,
                   kh.HoTen AS TenKhachHang,kh.SDT,kh.Email,kh.SoGiayTo,p.SoPhong,p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            LEFT JOIN PhieuThu pt ON pt.MaPhieuCoc=pc.MaPhieuCoc
            WHERE pc.TrangThai<>N'DaHuy'
              AND NOT EXISTS (SELECT 1 FROM HopDong hd WHERE hd.MaPhieuCoc=pc.MaPhieuCoc)
              AND (@Text IS NULL OR pc.MaPhieuCoc LIKE '%' + @Text + '%'
                   OR kh.HoTen LIKE '%' + @Text + '%' OR kh.SDT LIKE '%' + @Text + '%'
                   OR p.SoPhong LIKE '%' + @Text + '%')
            ORDER BY pc.ThoiDiemCoc DESC,pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql,
            new { Text = ChuanHoa(text) }, PhienDuLieu.Session.Transaction);
        return rows.Select(TaoPhieuCocDanhSach).ToList();
    }

    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachDaHuyChoDoiSoat()
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.ThoiDiemHuy,pc.MaNVHuy,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   CAST(1 AS bit) AS DaDongTien,kh.HoTen AS TenKhachHang,kh.SDT,kh.Email,kh.SoGiayTo,
                   p.SoPhong,p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.TrangThai=N'DaHuy'
              AND EXISTS (SELECT 1 FROM PhieuThu pt WHERE pt.MaPhieuCoc=pc.MaPhieuCoc)
              AND NOT EXISTS (SELECT 1 FROM PhieuDoiSoat pds WHERE pds.MaPhieuCoc=pc.MaPhieuCoc)
            ORDER BY pc.ThoiDiemHuy,pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql,
            transaction: PhienDuLieu.Session.Transaction);
        return rows.Select(TaoPhieuCocDanhSach).ToList();
    }

    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachKhoiTao(string? text = null)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.PhuongThucThanhToan,pc.LyDoYeuCauBoSung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   kh.HoTen AS TenKhachHang, p.SoPhong, p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.TrangThai=N'KhoiTao'
              AND (@Text IS NULL OR pc.MaPhieuCoc LIKE '%' + @Text + '%'
                   OR kh.HoTen LIKE '%' + @Text + '%' OR p.SoPhong LIKE '%' + @Text + '%')
            ORDER BY pc.ThoiDiemCoc, pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql,
            new { Text = string.IsNullOrWhiteSpace(text) ? null : text.Trim() },
            PhienDuLieu.Session.Transaction);
        return rows.Select(x => new PhieuCoc
        {
            MaPhieuCoc = x.MaPhieuCoc,
            HanThanhToan = x.HanThanhToan,
            HinhThucThue = x.HinhThucThue,
            SoGiuongThue = x.SoGiuongThue,
            TongTien = x.TongTien,
            ThoiDiemCoc = x.ThoiDiemCoc,
            AnhMinhChung = x.AnhMinhChung,
            PhuongThucThanhToan = x.PhuongThucThanhToan,
            LyDoYeuCauBoSung = x.LyDoYeuCauBoSung,
            TrangThai = x.TrangThai,
            MaKH = x.MaKH,
            MaPhong = x.MaPhong,
            MaNV = x.MaNV,
            KhachHang = new KhachHang { MaKH = x.MaKH, HoTen = x.TenKhachHang },
            Phong = new Phong { MaPhong = x.MaPhong, SoPhong = x.SoPhong, ToaNha = x.ToaNha },
        }).ToList();
    }

    // ==========================================================
    // Methods from feat/lap-phieu-doi-soat branch
    // ==========================================================
    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachDaHuyDaThanhToan()
    {
        const string sql = """
            SELECT pc.MaPhieuCoc, pc.HinhThucThue, pc.SoGiuongThue, pc.TongTien, pc.ThoiDiemCoc, pc.TrangThai, pc.MaKH, pc.MaPhong, pc.MaNV,
                   kh.HoTen AS TenKhachHang, p.SoPhong, p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.TrangThai IN (N'DaHuy', N'DaThanhToan')
              AND NOT EXISTS (SELECT 1 FROM PhieuDoiSoat pds WHERE pds.MaPhieuCoc = pc.MaPhieuCoc)
            ORDER BY pc.ThoiDiemCoc, pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql,
            null, PhienDuLieu.Session.Transaction);
        return rows.Select(x => new PhieuCoc
        {
            MaPhieuCoc = x.MaPhieuCoc,
            HinhThucThue = x.HinhThucThue,
            SoGiuongThue = x.SoGiuongThue,
            TongTien = x.TongTien,
            ThoiDiemCoc = x.ThoiDiemCoc,
            TrangThai = x.TrangThai,
            MaKH = x.MaKH,
            MaPhong = x.MaPhong,
            MaNV = x.MaNV,
            KhachHang = new KhachHang { MaKH = x.MaKH, HoTen = x.TenKhachHang },
            Phong = new Phong { MaPhong = x.MaPhong, SoPhong = x.SoPhong, ToaNha = x.ToaNha },
        }).ToList();
    }

    public static async Task<decimal> LaySoTienCoc(string maPhieuCoc)
    {
        const string sql = "SELECT TongTien FROM PhieuCoc WHERE MaPhieuCoc = @MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<decimal>(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
    }

    // ==========================================================
    // Methods from develop branch
    // ==========================================================
    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoThanhToan(string? text = null)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.PhuongThucThanhToan,pc.LyDoYeuCauBoSung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   kh.HoTen AS TenKhachHang, p.SoPhong, p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.TrangThai=N'ChoThanhToan'
              AND (@Text IS NULL OR pc.MaPhieuCoc LIKE '%' + @Text + '%'
                   OR kh.HoTen LIKE '%' + @Text + '%' OR p.SoPhong LIKE '%' + @Text + '%')
            ORDER BY pc.HanThanhToan, pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql,
            new { Text = string.IsNullOrWhiteSpace(text) ? null : text.Trim() },
            PhienDuLieu.Session.Transaction);
        return rows.Select(TaoPhieuCocDanhSach).ToList();
    }

    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDoiChieu(string? text = null)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.PhuongThucThanhToan,pc.LyDoYeuCauBoSung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   kh.HoTen AS TenKhachHang, p.SoPhong, p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.TrangThai=N'ChoDoiChieu'
              AND (@Text IS NULL OR pc.MaPhieuCoc LIKE '%' + @Text + '%'
                   OR kh.HoTen LIKE '%' + @Text + '%' OR p.SoPhong LIKE '%' + @Text + '%')
            ORDER BY pc.HanThanhToan, pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql,
            new { Text = string.IsNullOrWhiteSpace(text) ? null : text.Trim() },
            PhienDuLieu.Session.Transaction);
        return rows.Select(TaoPhieuCocDanhSach).ToList();
    }

    public static async Task<PhieuCoc?> DocChiTiet(string maPhieuCoc)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.ThoiDiemHuy,pc.MaNVHuy,pc.AnhMinhChung,pc.PhuongThucThanhToan,pc.LyDoYeuCauBoSung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   CASE WHEN pt.MaPT IS NOT NULL OR pc.TrangThai IN (N'DaThanhToan', N'DaDuyet', N'HoanThanh') THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS DaDongTien,
                   kh.HoTen AS TenKhachHang, kh.SDT, kh.Email,
                   kh.GioiTinh, kh.NgaySinh, kh.QuocTich, kh.LoaiGiayTo, kh.SoGiayTo, kh.DiaChiThuongTru,
                   p.SoPhong, p.ToaNha, p.Tang, p.TrangThai AS TrangThaiPhong,
                   lp.MaLP, lp.TenLoaiPhong, lp.SucChua, lp.GiaThue
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            INNER JOIN LoaiPhong lp ON lp.MaLP=p.MaLP
            LEFT JOIN PhieuThu pt ON pt.MaPhieuCoc=pc.MaPhieuCoc
            WHERE pc.MaPhieuCoc=@MaPhieuCoc
            """;
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuCocDetailRow>(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
        if (row is null) return null;

        const string bedSql = """
            SELECT g.MaGiuong,g.SoGiuong,g.TrangThai,g.MaPhong
            FROM ChiTietPhieuCoc ct
            INNER JOIN Giuong g ON g.MaGiuong=ct.MaGiuong
            WHERE ct.MaPhieuCoc=@MaPhieuCoc
            ORDER BY g.SoGiuong
            """;
        var giuongs = await PhienDuLieu.Session.Connection.QueryAsync<Giuong>(bedSql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
        return new PhieuCoc
        {
            MaPhieuCoc = row.MaPhieuCoc,
            HanThanhToan = row.HanThanhToan,
            HinhThucThue = row.HinhThucThue,
            SoGiuongThue = row.SoGiuongThue,
            TongTien = row.TongTien,
            ThoiDiemCoc = row.ThoiDiemCoc,
            AnhMinhChung = row.AnhMinhChung,
            PhuongThucThanhToan = row.PhuongThucThanhToan,
            LyDoYeuCauBoSung = row.LyDoYeuCauBoSung,
            TrangThai = row.TrangThai,
            MaKH = row.MaKH,
            MaPhong = row.MaPhong,
            MaNV = row.MaNV,
            ThoiDiemHuy = row.ThoiDiemHuy,
            MaNVHuy = row.MaNVHuy,
            DaDongTien = row.DaDongTien,
            KhachHang = new KhachHang
            {
                MaKH = row.MaKH, HoTen = row.TenKhachHang, SDT = row.SDT, Email = row.Email,
                GioiTinh = row.GioiTinh, NgaySinh = row.NgaySinh, QuocTich = row.QuocTich,
                LoaiGiayTo = row.LoaiGiayTo, SoGiayTo = row.SoGiayTo, DiaChiThuongTru = row.DiaChiThuongTru,
            },
            Phong = new Phong
            {
                MaPhong = row.MaPhong, SoPhong = row.SoPhong, ToaNha = row.ToaNha, Tang = row.Tang,
                TrangThai = row.TrangThaiPhong!,
                LoaiPhong = new LoaiPhong
                {
                    MaLP = row.MaLP, TenLoaiPhong = row.TenLoaiPhong, SucChua = row.SucChua, GiaThue = row.GiaThue,
                },
                Giuongs = giuongs.ToList(),
            },
            Giuongs = giuongs.ToList(),
        };
    }

    public static async Task CapNhatTinhTien(PhieuCoc phieu)
    {
        const string sql = """
            UPDATE PhieuCoc
            SET HanThanhToan=@HanThanhToan, SoGiuongThue=@SoGiuongThue,
                TongTien=@TongTien, TrangThai=@TrangThai
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai=N'KhoiTao'
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ bá»Ÿi ngÆ°á»i khÃ¡c hoáº·c khÃ´ng cÃ²n á»Ÿ tráº¡ng thÃ¡i khá»Ÿi táº¡o.");
    }

    public static async Task CapNhatThanhToan(PhieuCoc phieu)
    {
        const string sql = """
            UPDATE PhieuCoc
            SET AnhMinhChung=@AnhMinhChung,
                PhuongThucThanhToan=@PhuongThucThanhToan,
                LyDoYeuCauBoSung=NULL,
                TrangThai=@TrangThai
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai=N'ChoThanhToan'
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ bá»Ÿi ngÆ°á»i khÃ¡c hoáº·c khÃ´ng cÃ²n á»Ÿ tráº¡ng thÃ¡i chá» thanh toÃ¡n.");
    }

    public static async Task CapNhatXacNhanThanhToan(PhieuCoc phieu)
    {
        const string sql = """
            UPDATE PhieuCoc
            SET TrangThai=N'DaThanhToan', LyDoYeuCauBoSung=NULL
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai=N'ChoDoiChieu'
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ bá»Ÿi ngÆ°á»i khÃ¡c hoáº·c khÃ´ng cÃ²n á»Ÿ tráº¡ng thÃ¡i chá» Ä‘á»‘i chiáº¿u.");
    }

    public static async Task CapNhatYeuCauBoSung(PhieuCoc phieu)
    {
        const string sql = """
            UPDATE PhieuCoc
            SET TrangThai=N'ChoThanhToan', LyDoYeuCauBoSung=@LyDoYeuCauBoSung
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai=N'ChoDoiChieu'
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ bá»Ÿi ngÆ°á»i khÃ¡c hoáº·c khÃ´ng cÃ²n á»Ÿ tráº¡ng thÃ¡i chá» Ä‘á»‘i chiáº¿u.");
    }

    public static async Task CapNhatHuy(PhieuCoc phieu)
    {
        const string sql = """
            UPDATE PhieuCoc
            SET TrangThai=N'DaHuy',ThoiDiemHuy=@ThoiDiemHuy,MaNVHuy=@MaNVHuy
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai<>N'DaHuy'
              AND NOT EXISTS (SELECT 1 FROM HopDong hd WHERE hd.MaPhieuCoc=PhieuCoc.MaPhieuCoc)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ hoáº·c Ä‘Ã£ chuyá»ƒn sang giai Ä‘oáº¡n KÃ½ há»£p Ä‘á»“ng. Vui lÃ²ng sá»­ dá»¥ng chá»©c nÄƒng Thanh lÃ½ há»£p Ä‘á»“ng.");
    }

    public static async Task Them(PhieuCoc phieu)
    {
        const string insertDeposit = """
            INSERT INTO PhieuCoc (MaPhieuCoc,HanThanhToan,HinhThucThue,SoGiuongThue,TongTien,ThoiDiemCoc,AnhMinhChung,PhuongThucThanhToan,LyDoYeuCauBoSung,TrangThai,MaKH,MaPhong,MaNV)
            VALUES (@MaPhieuCoc,@HanThanhToan,@HinhThucThue,@SoGiuongThue,@TongTien,@ThoiDiemCoc,@AnhMinhChung,@PhuongThucThanhToan,@LyDoYeuCauBoSung,@TrangThai,@MaKH,@MaPhong,@MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertDeposit, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("KhÃ´ng thá»ƒ táº¡o phiáº¿u cá»c.");
        const string insertBed = "INSERT INTO ChiTietPhieuCoc (MaPhieuCoc,MaGiuong) VALUES (@MaPhieuCoc,@MaGiuong)";
        foreach (var giuong in phieu.Giuongs)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertBed, new { phieu.MaPhieuCoc, giuong.MaGiuong }, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("KhÃ´ng thá»ƒ lÆ°u chi tiáº¿t giÆ°á»ng cá»§a phiáº¿u cá»c.");
        const string insertMember = "INSERT INTO ThanhVienDangKy (MaPhieuCoc,MaKH,VaiTro,TrangThaiDuyet) VALUES (@MaPhieuCoc,@MaKH,@VaiTro,@TrangThaiDuyet)";
        foreach (var thanhVien in phieu.ThanhViens)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertMember, thanhVien, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("KhÃ´ng thá»ƒ lÆ°u thÃ nh viÃªn Ä‘Äƒng kÃ½ cá»§a phiáº¿u cá»c.");
    }

    public static async Task<IReadOnlyList<PhieuCoc>> LayPhieuCocDaThanhToanNhanPhongHomNay(string? text = null)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   kh.HoTen AS TenKhachHang, kh.SDT,
                   p.SoPhong, p.ToaNha,
                   lh.NgayHen, lh.GioHen
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            INNER JOIN LichHen lh ON lh.MaPhieuCoc=pc.MaPhieuCoc
            WHERE pc.TrangThai=N'DaThanhToan'
              AND lh.LoaiLichHen=N'NhanPhong'
              AND CAST(lh.NgayHen AS DATE)=CAST(GETDATE() AS DATE)
              AND (@Text IS NULL OR pc.MaPhieuCoc LIKE '%' + @Text + '%'
                   OR kh.HoTen LIKE '%' + @Text + '%' OR kh.SDT LIKE '%' + @Text + '%'
                   OR p.SoPhong LIKE '%' + @Text + '%')
            ORDER BY lh.GioHen, pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocNhapHoSoRow>(sql,
            new { Text = string.IsNullOrWhiteSpace(text) ? null : text.Trim() },
            PhienDuLieu.Session.Transaction);
        return rows.Select(x => new PhieuCoc
        {
            MaPhieuCoc = x.MaPhieuCoc,
            HinhThucThue = x.HinhThucThue,
            SoGiuongThue = x.SoGiuongThue,
            TongTien = x.TongTien,
            ThoiDiemCoc = x.ThoiDiemCoc,
            TrangThai = x.TrangThai,
            MaKH = x.MaKH,
            MaPhong = x.MaPhong,
            MaNV = x.MaNV,
            KhachHang = new KhachHang { MaKH = x.MaKH, HoTen = x.TenKhachHang, SDT = x.SDT },
            Phong = new Phong { MaPhong = x.MaPhong, SoPhong = x.SoPhong, ToaNha = x.ToaNha },
        }).ToList();
    }

    public static async Task CapNhatTrangThai(string maPhieuCoc, string trangThai)
    {
        const string sql = """
            UPDATE PhieuCoc SET TrangThai=@TrangThai
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai=N'DaThanhToan'
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaPhieuCoc = maPhieuCoc, TrangThai = trangThai },
            PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ bá»Ÿi ngÆ°á»i khÃ¡c hoáº·c khÃ´ng cÃ²n á»Ÿ tráº¡ng thÃ¡i thanh toÃ¡n.");
    }

    public static async Task<IReadOnlyList<dynamic>> TimKiemPhieuDaDuyet(string? tuKhoa)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc, pc.TrangThai, kh.MaKH, kh.HoTen, kh.SDT
            FROM PhieuCoc pc
            JOIN KhachHang kh ON pc.MaKH = kh.MaKH
            WHERE pc.TrangThai IN (N'DaThanhToan', N'DaDuyet')
              AND (@TuKhoa IS NULL OR pc.MaPhieuCoc LIKE '%' + @TuKhoa + '%' OR kh.HoTen COLLATE SQL_Latin1_General_CP1_CI_AI LIKE '%' + @TuKhoa + '%' OR kh.SDT LIKE '%' + @TuKhoa + '%' OR kh.SoGiayTo LIKE '%' + @TuKhoa + '%')
            ORDER BY pc.ThoiDiemCoc DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync(
            sql, new { TuKhoa = string.IsNullOrWhiteSpace(tuKhoa) ? null : tuKhoa.Trim() }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> KiemTraConHopLe(string maPhieuCoc)
    {
        const string sql = "SELECT COUNT(1) FROM PhieuCoc WHERE MaPhieuCoc = @MaPhieuCoc AND TrangThai IN (N'DaThanhToan', N'DaDuyet')";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDuyet(string? text = null)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   kh.HoTen AS TenKhachHang, p.SoPhong, p.ToaNha
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            WHERE pc.TrangThai=N'ChoDuyet'
              AND (@Text IS NULL OR pc.MaPhieuCoc LIKE '%' + @Text + '%'
                   OR kh.HoTen LIKE '%' + @Text + '%' OR p.SoPhong LIKE '%' + @Text + '%')
            ORDER BY pc.ThoiDiemCoc DESC, pc.MaPhieuCoc
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuCocListRow>(sql,
            new { Text = string.IsNullOrWhiteSpace(text) ? null : text.Trim() },
            PhienDuLieu.Session.Transaction);
        return rows.Select(TaoPhieuCocDanhSach).ToList();
    }

    public static async Task<PhieuCoc?> LayChiTietChoDuyet(string maPhieuCoc)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   kh.HoTen AS TenKhachHang, kh.SDT, kh.NgaySinh, kh.GioiTinh, kh.QuocTich,
                   kh.LoaiGiayTo, kh.SoGiayTo, kh.Email, kh.DiaChiThuongTru,
                   p.SoPhong, p.ToaNha, p.Tang, p.GioiTinhChoPhep, p.TrangThai AS TrangThaiPhong,
                   lp.MaLP, lp.TenLoaiPhong, lp.SucChua, lp.GiaThue
            FROM PhieuCoc pc
            INNER JOIN KhachHang kh ON kh.MaKH=pc.MaKH
            INNER JOIN Phong p ON p.MaPhong=pc.MaPhong
            INNER JOIN LoaiPhong lp ON lp.MaLP=p.MaLP
            WHERE pc.MaPhieuCoc=@MaPhieuCoc
            """;
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<PhieuCocDetailRow>(sql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction);
        if (row is null) return null;

        const string bedSql = """
            SELECT g.MaGiuong,g.SoGiuong,g.TrangThai,g.MaPhong
            FROM ChiTietPhieuCoc ct
            INNER JOIN Giuong g ON g.MaGiuong=ct.MaGiuong
            WHERE ct.MaPhieuCoc=@MaPhieuCoc
            ORDER BY g.SoGiuong
            """;
        var giuongs = (await PhienDuLieu.Session.Connection.QueryAsync<Giuong>(bedSql,
            new { MaPhieuCoc = maPhieuCoc }, PhienDuLieu.Session.Transaction)).ToList();

        var thanhViens = await ThanhVienDangKyDB.GetByMaPhieuCoc(maPhieuCoc);

        return new PhieuCoc
        {
            MaPhieuCoc = row.MaPhieuCoc,
            HanThanhToan = row.HanThanhToan,
            HinhThucThue = row.HinhThucThue,
            SoGiuongThue = row.SoGiuongThue,
            TongTien = row.TongTien,
            ThoiDiemCoc = row.ThoiDiemCoc,
            AnhMinhChung = row.AnhMinhChung,
            TrangThai = row.TrangThai,
            MaKH = row.MaKH,
            MaPhong = row.MaPhong,
            MaNV = row.MaNV,
            KhachHang = new KhachHang
            {
                MaKH = row.MaKH, HoTen = row.TenKhachHang, SDT = row.SDT,
                NgaySinh = row.NgaySinh, GioiTinh = row.GioiTinh, QuocTich = row.QuocTich,
                LoaiGiayTo = row.LoaiGiayTo, SoGiayTo = row.SoGiayTo,
                Email = row.Email, DiaChiThuongTru = row.DiaChiThuongTru,
            },
            Phong = new Phong
            {
                MaPhong = row.MaPhong, SoPhong = row.SoPhong, ToaNha = row.ToaNha, Tang = row.Tang,
                GioiTinhChoPhep = row.GioiTinhChoPhep, TrangThai = row.TrangThaiPhong!,
                LoaiPhong = new LoaiPhong
                {
                    MaLP = row.MaLP, TenLoaiPhong = row.TenLoaiPhong, SucChua = row.SucChua, GiaThue = row.GiaThue,
                },
                Giuongs = giuongs,
            },
            Giuongs = giuongs,
            ThanhViens = thanhViens.ToList(),
        };
    }

    public static async Task CapNhatDaDuyet(PhieuCoc phieu)
    {
        const string sql = """
            UPDATE PhieuCoc
            SET TrangThai=N'DaDuyet'
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai=N'ChoDuyet'
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c xá»­ lÃ½ bá»Ÿi ngÆ°á»i khÃ¡c hoáº·c khÃ´ng cÃ²n á»Ÿ tráº¡ng thÃ¡i chá» duyá»‡t.");
    }

    public static async Task CapNhatDaHuy(PhieuCoc phieu)
    {
        const string sql = """
            UPDATE PhieuCoc
            SET TrangThai=N'DaHuy'
            WHERE MaPhieuCoc=@MaPhieuCoc AND TrangThai<>N'DaHuy'
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Phiáº¿u cá»c Ä‘Ã£ Ä‘Æ°á»£c há»§y trÆ°á»›c Ä‘Ã³.");
    }

    public static async Task<bool> CapNhatTrangThaiKhongDieuKien(string maPhieuCoc, string trangThai)
    {
        const string sql = "UPDATE PhieuCoc SET TrangThai=@TrangThai WHERE MaPhieuCoc=@MaPhieuCoc";
        return await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaPhieuCoc = maPhieuCoc, TrangThai = trangThai },
            PhienDuLieu.Session.Transaction) > 0;
    }

    private class PhieuCocListRow
    {
        public string MaPhieuCoc { get; set; } = string.Empty;
        public DateTime? HanThanhToan { get; set; }
        public string HinhThucThue { get; set; } = string.Empty;
        public int SoGiuongThue { get; set; }
        public decimal TongTien { get; set; }
        public DateTime ThoiDiemCoc { get; set; }
        public string? AnhMinhChung { get; set; }
        public string? PhuongThucThanhToan { get; set; }
        public string? LyDoYeuCauBoSung { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string MaKH { get; set; } = string.Empty;
        public string MaPhong { get; set; } = string.Empty;
        public string? MaNV { get; set; }
        public DateTime? ThoiDiemHuy { get; set; }
        public string? MaNVHuy { get; set; }
        public bool DaDongTien { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? SoGiayTo { get; set; }
        public string SoPhong { get; set; } = string.Empty;
        public string? ToaNha { get; set; }
    }

    private sealed class PhieuCocDetailRow : PhieuCocListRow
    {
        public string? Tang { get; set; }
        public string? GioiTinhChoPhep { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? QuocTich { get; set; }
        public string? LoaiGiayTo { get; set; }
        public string? DiaChiThuongTru { get; set; }
        public string? TrangThaiPhong { get; set; }
        public string MaLP { get; set; } = string.Empty;
        public string TenLoaiPhong { get; set; } = string.Empty;
        public int SucChua { get; set; }
        public decimal GiaThue { get; set; }
    }

    private sealed class PhieuCocNhapHoSoRow
    {
        public string MaPhieuCoc { get; set; } = string.Empty;
        public DateTime? HanThanhToan { get; set; }
        public string HinhThucThue { get; set; } = string.Empty;
        public int SoGiuongThue { get; set; }
        public decimal TongTien { get; set; }
        public DateTime ThoiDiemCoc { get; set; }
        public string? AnhMinhChung { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string MaKH { get; set; } = string.Empty;
        public string MaPhong { get; set; } = string.Empty;
        public string? MaNV { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public string? SDT { get; set; }
        public string SoPhong { get; set; } = string.Empty;
        public string? ToaNha { get; set; }
    }

    private static PhieuCoc TaoPhieuCocDanhSach(PhieuCocListRow x) => new()
    {
        MaPhieuCoc = x.MaPhieuCoc,
        HanThanhToan = x.HanThanhToan,
        HinhThucThue = x.HinhThucThue,
        SoGiuongThue = x.SoGiuongThue,
        TongTien = x.TongTien,
        ThoiDiemCoc = x.ThoiDiemCoc,
        AnhMinhChung = x.AnhMinhChung,
        PhuongThucThanhToan = x.PhuongThucThanhToan,
        LyDoYeuCauBoSung = x.LyDoYeuCauBoSung,
        TrangThai = x.TrangThai,
        MaKH = x.MaKH,
        MaPhong = x.MaPhong,
        MaNV = x.MaNV,
        ThoiDiemHuy = x.ThoiDiemHuy,
        MaNVHuy = x.MaNVHuy,
        DaDongTien = x.DaDongTien,
        KhachHang = new KhachHang
        {
            MaKH = x.MaKH, HoTen = x.TenKhachHang, SDT = x.SDT, Email = x.Email, SoGiayTo = x.SoGiayTo,
        },
        Phong = new Phong { MaPhong = x.MaPhong, SoPhong = x.SoPhong, ToaNha = x.ToaNha },
    };

    private static string? ChuanHoa(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
