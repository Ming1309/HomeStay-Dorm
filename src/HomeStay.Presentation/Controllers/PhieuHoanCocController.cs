using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace HomeStay.Presentation.Controllers;

[ApiController]
[Route("api/refunds")]
[Authorize(Roles = "KeToan")]
public sealed class PhieuHoanCocController(
    LapPhieuHoanCoc lapPhieuHoanCoc,
    IChungTuTaiChinhStorage chungTuStorage,
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
        catch (InvalidOperationException ex)
        {
            return Conflict(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết hoàn cọc cho {MaPDS}", maPDS);
            return StatusCode(500, new { Message = "Không thể tải chi tiết hoàn cọc lúc này." });
        }
    }

    [HttpPost("phieu-hoan-coc")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> TaoPhieuHoanCoc([FromForm] TaoPhieuHoanCocHttpRequest request, CancellationToken cancellationToken)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        string? minhChung = null;
        var daLuu = false;
        try
        {
            if (request.ChungTu is null)
                return BadRequest(new { Message = "Phải tải lên chứng từ xác nhận khách hàng đã nhận tiền." });
            await using var noiDung = request.ChungTu.OpenReadStream();
            minhChung = await chungTuStorage.Luu("hoan",
                new TepChungTuTaiChinh(request.ChungTu.FileName, request.ChungTu.Length, noiDung), cancellationToken);
            var phieuHoanCoc = await lapPhieuHoanCoc.ThucHienHoanCoc(
                request.MaPDS,
                request.PhuongThucHoan,
                request.ThongTinNhanTien,
                request.MaGiaoDich,
                minhChung,
                maNV);
            daLuu = true;
            return Ok(new TaoPhieuHoanCocHttpResponse(
                phieuHoanCoc.MaPHC,
                phieuHoanCoc.SoTienHoan,
                phieuHoanCoc.PhuongThucHoan!,
                phieuHoanCoc.ThoiGian,
                maNV));
        }
        catch (InvalidDataException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (SqlException ex) when (ex.Number is 2601 or 2627 or 1205)
        {
            return Conflict(new { Message = "Phiếu đối soát đã được xử lý bởi yêu cầu khác. Vui lòng tải lại danh sách." });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể lập phiếu hoàn cọc cho {MaPDS}", request.MaPDS);
            return StatusCode(500, new { Message = "Không thể lập phiếu hoàn cọc lúc này." });
        }
        finally
        {
            if (minhChung is not null && !daLuu)
                await chungTuStorage.Xoa(minhChung, cancellationToken);
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
