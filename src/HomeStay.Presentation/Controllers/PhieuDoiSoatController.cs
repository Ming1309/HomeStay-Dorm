namespace HomeStay.Presentation.Controllers;

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/reconciliations")]
[Authorize(Roles = "KeToan")]
public sealed class PhieuDoiSoatController(
    LapPhieuDoiSoat lapPhieuDoiSoat,
    ILogger<PhieuDoiSoatController> logger) : ControllerBase
{
    [HttpGet("cho-doi-soat")]
    public async Task<IActionResult> LayDanhSachChoDoiSoat([FromQuery] string? text = null) =>
        Ok(await lapPhieuDoiSoat.LayDanhSachChoDoiSoat(text));

    [HttpGet("chi-tiet-tinh-toan")]
    public async Task<IActionResult> LayChiTietVaTinhToan([FromQuery] string maHoSo, [FromQuery] string loaiHoSo)
    {
        try
        {
            return Ok(await lapPhieuDoiSoat.LayChiTietVaTinhToan(maHoSo, loaiHoSo));
        }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (SqlException ex) when (ex.Number is 2601 or 2627 or 1205)
        {
            return Conflict(new { Message = "Hồ sơ đã được xử lý bởi yêu cầu khác. Vui lòng tải lại danh sách." });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết đối soát cho {MaHoSo}", maHoSo);
            return StatusCode(500, new { Message = "Không thể xử lý phiếu đối soát lúc này." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> TaoPhieuDoiSoat([FromBody] TaoPhieuDoiSoatHttpRequest request)
    {
        string? maNhanVien = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        try
        {
            var phieu = await lapPhieuDoiSoat.TaoPhieuDoiSoat(request.MaHoSo, request.LoaiHoSo, request.GhiChu, maNhanVien);
            return Ok(phieu);
        }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tạo phiếu đối soát cho {MaHoSo}", request.MaHoSo);
            return StatusCode(500, new { Message = "Không thể tạo phiếu đối soát lúc này." });
        }
    }
}
