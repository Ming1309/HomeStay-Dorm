namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/notifications")]
[Authorize(Roles = "Sale,QuanLy,KeToan,QuanTri")]
public sealed class ThongBaoController(DichVuThongBao dichVuThongBao) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> LayDanhSach(
        [FromQuery] string filter = "unread",
        [FromQuery] int limit = 20,
        [FromQuery] string? cursor = null)
    {
        var maNV = User.FindFirst("MaNV")?.Value;
        if (maNV is null)
            return Unauthorized(new { Message = "Không xác định được người dùng đang đăng nhập." });
        try
        {
            var page = await dichVuThongBao.LayThongBaoCuaToi(maNV, filter, limit, cursor);
            return Ok(new TrangThongBaoHttpResponse(
                page.Items.Select(x => new ThongBaoHttpResponse(
                    x.MaTB,
                    x.LoaiSuKien,
                    x.LoaiThongBao,
                    x.TieuDe,
                    x.NoiDung,
                    x.LienKet,
                    x.Tone,
                    x.TrangThai,
                    x.ThoiGianTao,
                    x.DaDoc,
                    x.MaThamChieu,
                    x.MaNVXuLy,
                    x.TenNguoiXuLy,
                    x.ThoiGianXuLy)).ToList(),
                page.SoChuaDoc,
                page.CursorTiepTheo));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> DanhDauDaDoc(string id)
    {
        var maNV = User.FindFirst("MaNV")?.Value;
        if (maNV is null)
            return Unauthorized(new { Message = "Không xác định được người dùng đang đăng nhập." });

        try
        {
            await dichVuThongBao.DanhDauDaDoc(id, maNV);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> DanhDauTatCaDaDoc()
    {
        var maNV = User.FindFirst("MaNV")?.Value;
        if (maNV is null)
            return Unauthorized(new { Message = "Không xác định được người dùng đang đăng nhập." });

        try
        {
            await dichVuThongBao.DanhDauTatCaDaDoc(maNV);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

}
