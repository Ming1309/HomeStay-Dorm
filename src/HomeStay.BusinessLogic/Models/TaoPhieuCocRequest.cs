namespace HomeStay.BusinessLogic.Models;

using HomeStay.DataAccess.DTOs;
using System.Collections.Generic;

public class TaoPhieuCocRequest
{
    public string MaLichHen { get; set; } = null!;
    public KhachHangDTO KhachHang { get; set; } = null!;
    public string MaPhong { get; set; } = null!;
    public List<string> DanhSachGiuong { get; set; } = new();
    public string HinhThucThue { get; set; } = null!; // NguyenPhong, OGhep
    public decimal TongTien { get; set; }
    public string? MaNV { get; set; }
}
