namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

// UC 1.4.30 - Quan ly danh muc tai san (chi vai tro QuanTri).
[ApiController]
[Route("api/admin/assets")]
[Authorize(Roles = "QuanTri")]
public sealed class QuanLyTaiSanController(
    QuanLyTaiSan quanLy,
    ILogger<QuanLyTaiSanController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> LayDanhSach()
    {
        try
        {
            return Ok((await quanLy.LayDanhSach()).Select(TaoResponse));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách tài sản.");
            return StatusCode(500, new { message = "Không thể tải danh sách tài sản lúc này." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Them(LuuTaiSanHttpRequest request)
    {
        try
        {
            return Ok(TaoResponse(await quanLy.Them(Map(request))));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể tạo tài sản lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tạo tài sản.");
            return StatusCode(500, new { message = "Không thể tạo tài sản lúc này." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> CapNhat(string id, LuuTaiSanHttpRequest request)
    {
        try
        {
            return Ok(TaoResponse(await quanLy.CapNhat(id, Map(request))));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể cập nhật tài sản lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể cập nhật tài sản {MaTS}.", id);
            return StatusCode(500, new { message = "Không thể cập nhật tài sản lúc này." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Xoa(string id)
    {
        try
        {
            await quanLy.Xoa(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể xóa tài sản lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể xóa tài sản {MaTS}.", id);
            return StatusCode(500, new { message = "Không thể xóa tài sản lúc này." });
        }
    }

    private IActionResult XuLyLoiSql(SqlException ex, string thongDiep500)
    {
        if (ex.Number is 2601 or 2627)
            return Conflict(new { message = "Loại tài sản này đã tồn tại trong danh mục." });
        if (ex.Number == 547)
            return Conflict(new { message = "Không thể xóa tài sản đang được sử dụng trong hệ thống." });
        logger.LogError(ex, "Lỗi SQL khi quản lý tài sản (Number={Number}).", ex.Number);
        return StatusCode(500, new { message = thongDiep500 });
    }

    private static TaiSan Map(LuuTaiSanHttpRequest request) => new()
    {
        TenTaiSan = request.TenTaiSan,
        LoaiTaiSan = request.LoaiTaiSan,
        GiaTri = request.GiaTri,
        MoTa = request.MoTa,
        TrangThai = request.TrangThai,
    };

    private static TaiSanHttpResponse TaoResponse(TaiSan taiSan) => new(
        taiSan.MaTS,
        taiSan.TenTaiSan,
        taiSan.LoaiTaiSan,
        taiSan.GiaTri,
        taiSan.MoTa,
        taiSan.TrangThai);
}
