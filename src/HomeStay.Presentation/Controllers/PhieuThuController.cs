using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeStay.Presentation.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = "KeToan")]
public sealed class PhieuThuController(
    ThanhToanTraPhong thanhToanTraPhong,
    ILogger<PhieuThuController> logger) : ControllerBase
{
    [HttpGet("pds-cho-thu")]
    public async Task<IActionResult> LayDSPhieuDoiSoatDaChot()
    {
        try
        {
            var results = await thanhToanTraPhong.LayDSPhieuDoiSoatDaChot();
            return Ok(results);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách phiếu đối soát chờ thu");
            return StatusCode(500, new { Message = "Không thể tải danh sách thanh toán lúc này." });
        }
    }

    [HttpGet("pds-details/{maPDS}")]
    public async Task<IActionResult> LayChiTietPhieuDoiSoat(string maPDS)
    {
        try
        {
            var detail = await thanhToanTraPhong.LayChiTietPhieuDoiSoat(maPDS);
            return Ok(detail);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải phiếu đối soát {MaPDS}", maPDS);
            return StatusCode(500, new { Message = "Không thể tải chi tiết thanh toán lúc này." });
        }
    }

    [HttpPost("phieu-thu")]
    public async Task<IActionResult> TaoPhieuThu([FromBody] TaoPhieuThuHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        try
        {
            var phieuThu = await thanhToanTraPhong.TienHanhThuTien(
                request.MaPDS,
                request.PhuongThucThanhToan,
                request.AnhMinhChung,
                maNV);
            return Ok(new TaoPhieuThuHttpResponse(
                phieuThu.MaPT,
                phieuThu.SoTienThu,
                phieuThu.ThoiGian,
                phieuThu.PhuongThucThanhToan!,
                maNV));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { Message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể lập phiếu thu cho {MaPDS}", request.MaPDS);
            return StatusCode(500, new { Message = "Không thể lập phiếu thu lúc này." });
        }
    }
}
