namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhieuCocDB
{
    public static async Task<IReadOnlyList<PhieuCoc>> LayDanhSachKhoiTao(string? text = null)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
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
            TrangThai = x.TrangThai,
            MaKH = x.MaKH,
            MaPhong = x.MaPhong,
            MaNV = x.MaNV,
            KhachHang = new KhachHang { MaKH = x.MaKH, HoTen = x.TenKhachHang },
            Phong = new Phong { MaPhong = x.MaPhong, SoPhong = x.SoPhong, ToaNha = x.ToaNha },
        }).ToList();
    }

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

    public static async Task<PhieuCoc?> DocChiTiet(string maPhieuCoc)
    {
        const string sql = """
            SELECT pc.MaPhieuCoc,pc.HanThanhToan,pc.HinhThucThue,pc.SoGiuongThue,pc.TongTien,
                   pc.ThoiDiemCoc,pc.AnhMinhChung,pc.TrangThai,pc.MaKH,pc.MaPhong,pc.MaNV,
                   kh.HoTen AS TenKhachHang, kh.SDT, kh.Email,
                   p.SoPhong, p.ToaNha, p.Tang, p.TrangThai AS TrangThaiPhong,
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
            TrangThai = row.TrangThai,
            MaKH = row.MaKH,
            MaPhong = row.MaPhong,
            MaNV = row.MaNV,
            KhachHang = new KhachHang
            {
                MaKH = row.MaKH, HoTen = row.TenKhachHang, SDT = row.SDT, Email = row.Email,
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
            throw new InvalidOperationException("Phiếu cọc đã được xử lý bởi người khác hoặc không còn ở trạng thái khởi tạo.");
    }

    public static async Task Them(PhieuCoc phieu)
    {
        const string insertDeposit = """
            INSERT INTO PhieuCoc (MaPhieuCoc,HanThanhToan,HinhThucThue,SoGiuongThue,TongTien,ThoiDiemCoc,AnhMinhChung,TrangThai,MaKH,MaPhong,MaNV)
            VALUES (@MaPhieuCoc,@HanThanhToan,@HinhThucThue,@SoGiuongThue,@TongTien,@ThoiDiemCoc,@AnhMinhChung,@TrangThai,@MaKH,@MaPhong,@MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertDeposit, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo phiếu cọc.");
        const string insertBed = "INSERT INTO ChiTietPhieuCoc (MaPhieuCoc,MaGiuong) VALUES (@MaPhieuCoc,@MaGiuong)";
        foreach (var giuong in phieu.Giuongs)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertBed, new { phieu.MaPhieuCoc, giuong.MaGiuong }, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("Không thể lưu chi tiết giường của phiếu cọc.");
        const string insertMember = "INSERT INTO ThanhVienDangKy (MaPhieuCoc,MaKH,VaiTro,TrangThaiDuyet) VALUES (@MaPhieuCoc,@MaKH,@VaiTro,@TrangThaiDuyet)";
        foreach (var thanhVien in phieu.ThanhViens)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertMember, thanhVien, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("Không thể lưu thành viên đăng ký của phiếu cọc.");
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
        public string TrangThai { get; set; } = string.Empty;
        public string MaKH { get; set; } = string.Empty;
        public string MaPhong { get; set; } = string.Empty;
        public string? MaNV { get; set; }
        public string TenKhachHang { get; set; } = string.Empty;
        public string SoPhong { get; set; } = string.Empty;
        public string? ToaNha { get; set; }
    }

    private sealed class PhieuCocDetailRow : PhieuCocListRow
    {
        public string? SDT { get; set; }
        public string? Email { get; set; }
        public string? Tang { get; set; }
        public string? TrangThaiPhong { get; set; }
        public string MaLP { get; set; } = string.Empty;
        public string TenLoaiPhong { get; set; } = string.Empty;
        public int SucChua { get; set; }
        public decimal GiaThue { get; set; }
    }
}
