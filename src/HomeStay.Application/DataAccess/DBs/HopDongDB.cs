namespace HomeStay.Application.DataAccess.DBs;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class HopDongDB
{
    public static async Task<IReadOnlyList<HopDong>> LayDanhSachChoDoiSoat()
    {
        const string sql = """
            SELECT hd.MaHD, hd.NgayBatDau, hd.NgayKetThuc, hd.GiaThue, hd.TrangThai, hd.MaPhieuCoc, hd.MaChinhSach, hd.MaQD,
                   kh.MaKH, kh.HoTen AS TenKhachHang,
                   pc.MaPhieuCoc, pc.TongTien AS TienCoc,
                   p.MaPhong, p.SoPhong, p.ToaNha
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            WHERE hd.TrangThai = N'DaThanhLy'
              AND NOT EXISTS (SELECT 1 FROM PhieuDoiSoat pds WHERE pds.MaHD = hd.MaHD)
            ORDER BY hd.NgayKetThuc, hd.MaHD
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<HopDongRow>(sql,
            null, PhienDuLieu.Session.Transaction);
        return rows.Select(x => new HopDong
        {
            MaHD = x.MaHD,
            NgayBatDau = x.NgayBatDau,
            NgayKetThuc = x.NgayKetThuc,
            GiaThue = x.GiaThue,
            TrangThai = x.TrangThai,
            MaPhieuCoc = x.MaPhieuCoc,
            MaChinhSach = x.MaChinhSach,
            MaQD = x.MaQD,
            KhachHang = new KhachHang { MaKH = x.MaKH, HoTen = x.TenKhachHang },
            PhieuCoc = new PhieuCoc
            {
                MaPhieuCoc = x.MaPhieuCoc,
                TongTien = x.TienCoc,
                Phong = new Phong { MaPhong = x.MaPhong, SoPhong = x.SoPhong, ToaNha = x.ToaNha }
            }
        }).ToList();
    }

    public static async Task<HopDong?> LayThongTinLuuTru(string maHD)
    {
        const string sql = """
            SELECT hd.MaHD, hd.NgayBatDau, hd.NgayKetThuc, hd.GiaThue, hd.TrangThai, hd.MaPhieuCoc, hd.MaChinhSach, hd.MaQD,
                   kh.MaKH, kh.HoTen AS TenKhachHang,
                   pc.MaPhieuCoc, pc.TongTien AS TienCoc,
                   p.MaPhong, p.SoPhong, p.ToaNha
            FROM HopDong hd
            INNER JOIN PhieuCoc pc ON pc.MaPhieuCoc = hd.MaPhieuCoc
            INNER JOIN KhachHang kh ON kh.MaKH = pc.MaKH
            INNER JOIN Phong p ON p.MaPhong = pc.MaPhong
            WHERE hd.MaHD = @MaHD
            """;
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<HopDongRow>(sql,
            new { MaHD = maHD }, PhienDuLieu.Session.Transaction);
        if (row is null) return null;

        return new HopDong
        {
            MaHD = row.MaHD,
            NgayBatDau = row.NgayBatDau,
            NgayKetThuc = row.NgayKetThuc,
            GiaThue = row.GiaThue,
            TrangThai = row.TrangThai,
            MaPhieuCoc = row.MaPhieuCoc,
            MaChinhSach = row.MaChinhSach,
            MaQD = row.MaQD,
            KhachHang = new KhachHang { MaKH = row.MaKH, HoTen = row.TenKhachHang },
            PhieuCoc = new PhieuCoc
            {
                MaPhieuCoc = row.MaPhieuCoc,
                TongTien = row.TienCoc,
                Phong = new Phong { MaPhong = row.MaPhong, SoPhong = row.SoPhong, ToaNha = row.ToaNha }
            }
        };
    }

    private class HopDongRow
    {
        public string MaHD { get; set; } = string.Empty;
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public decimal GiaThue { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string MaPhieuCoc { get; set; } = string.Empty;
        public string? MaChinhSach { get; set; }
        public string? MaQD { get; set; }
        public string MaKH { get; set; } = string.Empty;
        public string TenKhachHang { get; set; } = string.Empty;
        public string MaPhong { get; set; } = string.Empty;
        public string SoPhong { get; set; } = string.Empty;
        public string? ToaNha { get; set; }
        public decimal TienCoc { get; set; }
    }
}
