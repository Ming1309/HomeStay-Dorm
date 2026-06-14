namespace HomeStay.DataAccess.DTOs;

using System;
using System.Collections.Generic;

public class KhachHangDTO
{
    public string? MaKH { get; set; }
    public string HoTen { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? QuocTich { get; set; }
    public string? LoaiGiayTo { get; set; }
    public string? SoGiayTo { get; set; }
    public string? DiaChiThuongTru { get; set; }
    public string? SDT { get; set; }
    public string? Email { get; set; }
}

public class LoaiPhongDTO
{
    public string MaLP { get; set; } = null!;
    public string TenLoaiPhong { get; set; } = null!;
    public int SucChua { get; set; }
    public decimal GiaThue { get; set; }
}

public class PhongDTO
{
    public string MaPhong { get; set; } = null!;
    public string SoPhong { get; set; } = null!;
    public string? ToaNha { get; set; }
    public string? Tang { get; set; }
    public string? GioiTinhChoPhep { get; set; }
    public string TrangThai { get; set; } = null!;
    public string MaLP { get; set; } = null!;
    public string MaCN { get; set; } = null!;

    public string? TenLoaiPhong { get; set; }
    public decimal GiaThue { get; set; }
    public int SucChua { get; set; }
    public int SoGiuongTrong { get; set; }
    public List<GiuongDTO> Giuongs { get; set; } = new();
}

public class GiuongDTO
{
    public string MaGiuong { get; set; } = null!;
    public string SoGiuong { get; set; } = null!;
    public string TrangThai { get; set; } = null!;
    public string MaPhong { get; set; } = null!;
}

public class PhieuCocDTO
{
    public string MaPhieuCoc { get; set; } = null!;
    public DateTime? HanThanhToan { get; set; }
    public string HinhThucThue { get; set; } = null!;
    public int SoGiuongThue { get; set; }
    public decimal TongTien { get; set; }
    public DateTime ThoiDiemCoc { get; set; }
    public string? AnhMinhChung { get; set; }
    public string TrangThai { get; set; } = null!;
    public string MaKH { get; set; } = null!;
    public string MaPhong { get; set; } = null!;
    public string? MaNV { get; set; }
}

public class ChiTietPhieuCocDTO
{
    public string MaPhieuCoc { get; set; } = null!;
    public string MaGiuong { get; set; } = null!;
}

public class ThanhVienDangKyDTO
{
    public string MaPhieuCoc { get; set; } = null!;
    public string MaKH { get; set; } = null!;
    public string VaiTro { get; set; } = null!;
    public string TrangThaiDuyet { get; set; } = null!;
}

public class LichHenDTO
{
    public string MaLH { get; set; } = null!;
    public DateTime NgayHen { get; set; }
    public TimeSpan GioHen { get; set; }
    public string LoaiLichHen { get; set; } = null!;
    public string TrangThai { get; set; } = null!;
    public string? MaPDK { get; set; }
    public string? MaPhieuCoc { get; set; }
    public string? MaHD { get; set; }
    public string? MaNV { get; set; }
    public string? MaCN { get; set; }
    public string? MaKH { get; set; }

    public string? TenKhachHang { get; set; }
    public DateTime? NgaySinh { get; set; }
    public string? SDT { get; set; }
    public string? Email { get; set; }
    public string? GioiTinh { get; set; }
    public string? QuocTich { get; set; }
    public string? LoaiGiayTo { get; set; }
    public string? SoGiayTo { get; set; }
}
