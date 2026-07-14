namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/contract-payments")]
[Authorize(Roles = "KeToan")]
public sealed class XuLyThanhToanHopDongController(
    XuLyThanhToanHopDong xuLyThanhToanHopDong,
    ILogger<XuLyThanhToanHopDongController> logger) : ControllerBase
{
    [HttpGet("queue")]
    public async Task<IActionResult> LayDSChoThanhToan()
    {
        try
        {
            var ds = await xuLyThanhToanHopDong.LayDSChoThanhToan();
            return Ok(ds.Select(x => new HopDongChoThanhToanHttpResponse(
                x.MaHD,
                x.TenKhachHang,
                x.SoPhong,
                x.ToaNha,
                x.GiaThue,
                x.KyThanhToan,
                x.TongTienCanThu)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách hợp đồng chờ thanh toán");
            return StatusCode(500, new { Message = "Không thể tải danh sách hợp đồng chờ thanh toán lúc này." });
        }
    }

    [HttpGet("{maHD}")]
    public async Task<IActionResult> LayChiTietThanhToan(string maHD)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(maHD))
                throw new ArgumentException("Mã hợp đồng không được để trống.");

            var ct = await xuLyThanhToanHopDong.LayChiTietThanhToan(maHD.Trim());
            return Ok(new ChiTietThanhToanHopDongHttpResponse(
                ct.MaHD,
                ct.TenKhachHang,
                ct.SoPhong,
                ct.ToaNha,
                ct.GiaThue,
                ct.KyThanhToan,
                ct.TienThueKyDau,
                ct.TienDichVu,
                ct.TongCong,
                ct.KhoanThus.Select(k => new KhoanThuHttpResponse(
                    k.TenKhoanThu,
                    k.SoLuongKy,
                    k.DonGia,
                    k.ThanhTien)).ToList()));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết thanh toán hợp đồng {MaHD}", maHD);
            return StatusCode(500, new { Message = "Không thể tải chi tiết thanh toán lúc này." });
        }
    }

    [HttpPost("collect")]
    public async Task<IActionResult> TienHanhThuTien([FromBody] TienHanhThuTienHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        if (request is null || string.IsNullOrWhiteSpace(request.MaHD))
            return BadRequest(new { Message = "Mã hợp đồng không được để trống." });

        if (string.IsNullOrWhiteSpace(request.PhuongThucThanhToan))
            return BadRequest(new { Message = "Phương thức thanh toán không được để trống." });

        try
        {
            var pt = await xuLyThanhToanHopDong.TienHanhThuTien(
                request.MaHD.Trim(),
                request.PhuongThucThanhToan,
                request.AnhMinhChung,
                maNV);

            return Ok(new TienHanhThuTienHttpResponse(
                pt.MaPT,
                pt.SoTienThu,
                pt.PhuongThucThanhToan ?? request.PhuongThucThanhToan,
                pt.ThoiGian));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể xử lý thanh toán hợp đồng {MaHD}", request.MaHD);
            return StatusCode(500, new { Message = "Không thể xử lý thanh toán lúc này." });
        }
    }
}
