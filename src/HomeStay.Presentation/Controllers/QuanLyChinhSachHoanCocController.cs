namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

// UC 1.4.28 - Quan ly chinh sach hoan coc (chi vai tro QuanTri).
[ApiController]
[Route("api/admin/deposit-policy")]
[Authorize(Roles = "QuanTri")]
public sealed class QuanLyChinhSachHoanCocController(
    QuanLyChinhSachHoanCoc quanLy,
    ILogger<QuanLyChinhSachHoanCocController> logger) : ControllerBase
{
    /// <summary>GET /api/admin/deposit-policy – Lấy lịch sử phiên bản chính sách.</summary>
    [HttpGet]
    public async Task<IActionResult> LayDanhSach()
    {
        try
        {
            var danhSach = await quanLy.LayDanhSach();
            return Ok(danhSach.Select(TaoResponse));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải lịch sử chính sách hoàn cọc.");
            return StatusCode(500, new { message = "Không thể tải lịch sử chính sách hoàn cọc lúc này." });
        }
    }

    /// <summary>GET /api/admin/deposit-policy/current – Lấy chính sách đang hiệu lực.</summary>
    [HttpGet("current")]
    public async Task<IActionResult> LayChinhSachHienHanh()
    {
        try
        {
            return Ok(TaoResponse(await quanLy.LayChinhSachHienHanh()));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chính sách hoàn cọc hiện hành.");
            return StatusCode(500, new { message = "Không thể tải chính sách hoàn cọc lúc này." });
        }
    }

    /// <summary>POST /api/admin/deposit-policy – Tạo một phiên bản chính sách mới.</summary>
    [HttpPost]
    public async Task<IActionResult> TaoPhienBan([FromBody] TaoPhienBanChinhSachHoanCocRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TenChinhSach) ||
            request.TiLe_ChuaKy is null ||
            request.TiLe_TruocHan_NganHan is null ||
            request.TiLe_TruocHan_DaiHan is null ||
            request.TiLe_DungHan is null ||
            request.MocLuuTru is null ||
            request.NgayApDung is null)
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin bắt buộc của chính sách." });

        try
        {
            var chinhSach = await quanLy.TaoPhienBan(new ChinhSachHoanCoc
            {
                TenChinhSach = request.TenChinhSach,
                TiLe_ChuaKy = request.TiLe_ChuaKy.Value,
                TiLe_TruocHan_NganHan = request.TiLe_TruocHan_NganHan.Value,
                TiLe_TruocHan_DaiHan = request.TiLe_TruocHan_DaiHan.Value,
                TiLe_DungHan = request.TiLe_DungHan.Value,
                MocLuuTru = request.MocLuuTru.Value,
                NgayApDung = request.NgayApDung.Value,
                NgayKetThuc = request.NgayKetThuc
            });
            return Created($"/api/admin/deposit-policy/{chinhSach.MaChinhSach}", TaoResponse(chinhSach));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627)
        {
            return Conflict(new { message = "Ngày áp dụng đã được dùng bởi một phiên bản chính sách khác." });
        }
        catch (SqlException ex)
        {
            logger.LogError(ex, "Lỗi cơ sở dữ liệu khi tạo phiên bản chính sách hoàn cọc.");
            return StatusCode(500, new { message = "Không thể tạo phiên bản chính sách hoàn cọc lúc này." });
        }
    }

    private ChinhSachHoanCocResponse TaoResponse(ChinhSachHoanCoc cs) => new(
        cs.MaChinhSach,
        cs.TenChinhSach,
        cs.TiLe_ChuaKy,
        cs.TiLe_TruocHan_NganHan,
        cs.TiLe_TruocHan_DaiHan,
        cs.TiLe_DungHan,
        cs.MocLuuTru,
        cs.NgayApDung,
        cs.NgayKetThuc,
        cs.TinhTrangThai(quanLy.HomNay));
}
