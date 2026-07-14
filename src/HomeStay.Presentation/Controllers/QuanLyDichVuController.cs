namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

// UC 1.4.26 - Quan ly dich vu (chi vai tro QuanTri).
[ApiController]
[Route("api/admin/services")]
[Authorize(Roles = "QuanTri")]
public sealed class QuanLyDichVuController(
    QuanLyDichVu quanLy,
    ILogger<QuanLyDichVuController> logger) : ControllerBase
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
            logger.LogError(ex, "Không thể tải danh sách dịch vụ.");
            return StatusCode(500, new { message = "Không thể tải danh sách dịch vụ lúc này." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Them(LuuDichVuHttpRequest request)
    {
        try
        {
            return Ok(TaoResponse(await quanLy.Them(Map(request))));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể tạo dịch vụ lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tạo dịch vụ.");
            return StatusCode(500, new { message = "Không thể tạo dịch vụ lúc này." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> CapNhat(string id, LuuDichVuHttpRequest request)
    {
        try
        {
            return Ok(TaoResponse(await quanLy.CapNhat(id, Map(request))));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể cập nhật dịch vụ lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể cập nhật dịch vụ {MaDV}.", id);
            return StatusCode(500, new { message = "Không thể cập nhật dịch vụ lúc này." });
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
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể xóa dịch vụ lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể xóa dịch vụ {MaDV}.", id);
            return StatusCode(500, new { message = "Không thể xóa dịch vụ lúc này." });
        }
    }

    private IActionResult XuLyLoiSql(SqlException ex, string thongDiep500)
    {
        if (ex.Number is 2601 or 2627 or 547)
            return Conflict(new { message = "Dữ liệu dịch vụ đang bị trùng hoặc được tham chiếu trong hệ thống." });
        logger.LogError(ex, "Lỗi SQL khi quản lý dịch vụ (Number={Number}).", ex.Number);
        return StatusCode(500, new { message = thongDiep500 });
    }

    private static DichVu Map(LuuDichVuHttpRequest request) => new()
    {
        TenDV = request.TenDV,
        DonViTinh = request.DonViTinh,
        DonGia = request.DonGia,
        TrangThai = request.TrangThai,
    };

    private static DichVuHttpResponse TaoResponse(DichVu dichVu) => new(
        dichVu.MaDV,
        dichVu.TenDV,
        dichVu.DonViTinh,
        dichVu.DonGia,
        dichVu.TrangThai);
}
