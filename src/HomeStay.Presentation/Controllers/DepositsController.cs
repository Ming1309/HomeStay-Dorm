namespace HomeStay.Presentation.Controllers;

using Microsoft.AspNetCore.Mvc;
using HomeStay.BusinessLogic.Services;
using HomeStay.BusinessLogic.Models;
using HomeStay.DataAccess.DTOs;
using System;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class DepositsController : ControllerBase
{
    private readonly PhieuCoc _phieuCoc;

    public DepositsController(PhieuCoc phieuCoc)
    {
        _phieuCoc = phieuCoc;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDeposit([FromBody] TaoPhieuCocRequest request)
    {
        var khachHang = request.KhachHang;
        if (string.IsNullOrEmpty(khachHang.MaKH))
        {
            khachHang.MaKH = "KH" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
        }

        var thoiDiemCoc = DateTime.Now;
        string maPhieuCoc = "PC" + thoiDiemCoc.ToString("yyyyMMddHHmmss");

        var phieuCoc = new PhieuCocDTO
        {
            MaPhieuCoc = maPhieuCoc,
            HinhThucThue = request.HinhThucThue,
            SoGiuongThue = request.DanhSachGiuong.Count,
            TongTien = request.TongTien,
            ThoiDiemCoc = thoiDiemCoc,
            HanThanhToan = thoiDiemCoc.AddHours(24),
            TrangThai = "KhoiTao",
            MaKH = khachHang.MaKH,
            MaPhong = request.MaPhong,
            MaNV = request.MaNV
        };

        var result = await _phieuCoc.TaoPhieuCoc(
            request.MaLichHen,
            khachHang,
            phieuCoc,
            request.DanhSachGiuong);
        
        if (result)
        {
            return Ok(new { MaPhieuCoc = maPhieuCoc, Message = "Tạo phiếu cọc thành công" });
        }
        return BadRequest(new { Message = "Lỗi khi tạo phiếu cọc" });
    }
}
