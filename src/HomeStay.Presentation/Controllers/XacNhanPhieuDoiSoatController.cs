namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/reconciliation-approvals")]
[Authorize(Roles = "QuanLy")]
public sealed class XacNhanPhieuDoiSoatController(
    XacNhanPhieuDoiSoat xacNhan,
    ILogger<XacNhanPhieuDoiSoatController> logger) : ControllerBase
{
    [HttpGet("cho-xac-nhan")]
    public async Task<IActionResult> LayDanhSach()
    {
        try { return Ok(await xacNhan.LayDanhSachChoXacNhan()); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách phiếu đối soát chờ xác nhận");
            return StatusCode(500, new { Message = "Không thể tải hàng đợi xác nhận đối soát lúc này." });
        }
    }

    [HttpGet("{maPDS}")]
    public async Task<IActionResult> LayChiTiet(string maPDS)
    {
        try { return Ok(await xacNhan.LayChiTiet(maPDS)); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết phiếu đối soát {MaPDS}", maPDS);
            return StatusCode(500, new { Message = "Không thể tải chi tiết phiếu đối soát lúc này." });
        }
    }

    [HttpPost("{maPDS}/xac-nhan")]
    public async Task<IActionResult> XacNhan(string maPDS, [FromBody] XacNhanPhieuDoiSoatHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Quản lý đang đăng nhập." });
        try { return Ok(await xacNhan.XacNhan(maPDS, request.KhachHangDongY, maNV)); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể xác nhận phiếu đối soát {MaPDS}", maPDS);
            return StatusCode(500, new { Message = "Không thể xác nhận phiếu đối soát lúc này." });
        }
    }
}
