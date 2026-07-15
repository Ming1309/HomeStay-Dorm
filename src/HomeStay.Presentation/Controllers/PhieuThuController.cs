using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace HomeStay.Presentation.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize(Roles = "KeToan")]
public sealed class PhieuThuController(
    ThanhToanTraPhong thanhToanTraPhong,
    IChungTuTaiChinhStorage chungTuStorage,
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
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> TaoPhieuThu([FromForm] TaoPhieuThuHttpRequest request, CancellationToken cancellationToken)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        string? minhChung = null;
        var daLuu = false;
        try
        {
            if (request.ChungTu is null)
                return BadRequest(new { Message = "Phải tải lên chứng từ xác nhận đã thu tiền." });
            await using var noiDung = request.ChungTu.OpenReadStream();
            minhChung = await chungTuStorage.Luu("thu",
                new TepChungTuTaiChinh(request.ChungTu.FileName, request.ChungTu.Length, noiDung), cancellationToken);
            var phieuThu = await thanhToanTraPhong.TienHanhThuTien(
                request.MaPDS,
                request.PhuongThucThanhToan,
                minhChung,
                maNV);
            daLuu = true;
            return Ok(new TaoPhieuThuHttpResponse(
                phieuThu.MaPT,
                phieuThu.SoTienThu,
                phieuThu.ThoiGian,
                phieuThu.PhuongThucThanhToan!,
                maNV));
        }
        catch (InvalidDataException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { Message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627 or 1205)
        {
            return Conflict(new { Message = "Phiếu đối soát đã được xử lý bởi yêu cầu khác. Vui lòng tải lại." });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể lập phiếu thu cho {MaPDS}", request.MaPDS);
            return StatusCode(500, new { Message = "Không thể lập phiếu thu lúc này." });
        }
        finally
        {
            if (minhChung is not null && !daLuu)
                await chungTuStorage.Xoa(minhChung, cancellationToken);
        }
    }
}
