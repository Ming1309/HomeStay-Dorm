using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeStay.Presentation.Controllers;

[ApiController]
[Route("api/refunds")]
[Authorize(Roles = "KeToan")]
public sealed class PhieuHoanCocController(
    LapPhieuHoanCoc lapPhieuHoanCoc,
    ILogger<PhieuHoanCocController> logger) : ControllerBase
{
    [HttpGet("pds-cho-hoan")]
    public async Task<IActionResult> LayDSPhieuDoiSoatCanHoan()
    {
        try
        {
            var results = await lapPhieuHoanCoc.LayDSPhieuDoiSoatCanHoan();
            return Ok(results);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách phiếu đối soát chờ hoàn cọc");
            return StatusCode(500, new { Message = "Không thể tải danh sách hoàn cọc lúc này." });
        }
    }

    [HttpGet("pds-details/{maPDS}")]
    public async Task<IActionResult> LayChiTietPhieuDoiSoat(string maPDS)
    {
        try
        {
            var details = await lapPhieuHoanCoc.LayChiTietPhieuDoiSoatDto(maPDS);
            if (details == null)
                return NotFound(new { Message = "Không tìm thấy thông tin chi tiết phiếu đối soát." });

            return Ok(details);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết hoàn cọc cho {MaPDS}", maPDS);
            return StatusCode(500, new { Message = "Không thể tải chi tiết hoàn cọc lúc này." });
        }
    }

    [HttpPost("phieu-hoan-coc")]
    public async Task<IActionResult> TaoPhieuHoanCoc([FromBody] TaoPhieuHoanCocHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        try
        {
            var phieuHoanCoc = await lapPhieuHoanCoc.ThucHienHoanCoc(
                request.MaPDS,
                request.PhuongThucHoan,
                request.ThongTinNhanTien,
                maNV);
            return Ok(new TaoPhieuHoanCocHttpResponse(
                phieuHoanCoc.MaPHC,
                phieuHoanCoc.SoTienHoan,
                phieuHoanCoc.PhuongThucHoan!,
                phieuHoanCoc.ThoiGian,
                maNV));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể lập phiếu hoàn cọc cho {MaPDS}", request.MaPDS);
            return StatusCode(500, new { Message = "Không thể lập phiếu hoàn cọc lúc này." });
        }
    }

    [HttpGet("phieu-hoan/{maPHC}")]
    public async Task<IActionResult> LayThongTinPhieuHoan(string maPHC)
    {
        try
        {
            var phc = await lapPhieuHoanCoc.LayThongTinPhieuHoanCoc(maPHC);
            if (phc == null) return NotFound(new { Message = "Không tìm thấy phiếu hoàn cọc." });

            return Ok(phc);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải phiếu hoàn cọc {MaPHC}", maPHC);
            return StatusCode(500, new { Message = "Không thể tải phiếu hoàn cọc lúc này." });
        }
    }
}
