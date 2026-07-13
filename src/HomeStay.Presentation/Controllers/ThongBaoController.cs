namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
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
    public async Task<IActionResult> LayDanhSach()
    {
        var (maNV, vaiTro) = LayNguoiDung();
        if (maNV is null || vaiTro is null)
            return Unauthorized(new { Message = "Không xác định được người dùng đang đăng nhập." });

        var list = await dichVuThongBao.LayThongBaoCuaToi(vaiTro, maNV);
        return Ok(list.Select(x => new ThongBaoHttpResponse(
            x.MaTB,
            x.TieuDe,
            x.NoiDung,
            x.VaiTroNhan,
            x.LienKet,
            x.Tone,
            x.ThoiGianTao,
            x.DaDoc,
            x.MaThamChieu)));
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> DanhDauDaDoc(string id)
    {
        var (maNV, _) = LayNguoiDung();
        if (maNV is null)
            return Unauthorized(new { Message = "Không xác định được người dùng đang đăng nhập." });

        try
        {
            await dichVuThongBao.DanhDauDaDoc(id, maNV);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> DanhDauTatCaDaDoc()
    {
        var (maNV, vaiTro) = LayNguoiDung();
        if (maNV is null || vaiTro is null)
            return Unauthorized(new { Message = "Không xác định được người dùng đang đăng nhập." });

        try
        {
            await dichVuThongBao.DanhDauTatCaDaDoc(vaiTro, maNV);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    private (string? MaNV, string? VaiTro) LayNguoiDung()
    {
        var maNV = User.FindFirstValue("MaNV");
        var vaiTro = User.FindFirstValue(ClaimTypes.Role);
        return (maNV, vaiTro);
    }
}
