namespace HomeStay.Presentation.Controllers;

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/reconciliations")]
public sealed class PhieuDoiSoatController(LapPhieuDoiSoat lapPhieuDoiSoat) : ControllerBase
{
    [Authorize(Roles = "KeToan")]
    [HttpGet("cho-doi-soat")]
    public async Task<IActionResult> LayDanhSachChoDoiSoat([FromQuery] string? text = null) =>
        Ok(await lapPhieuDoiSoat.LayDanhSachChoDoiSoat(text));

    [Authorize(Roles = "KeToan")]
    [HttpGet("chi-tiet-tinh-toan")]
    public async Task<IActionResult> LayChiTietVaTinhToan([FromQuery] string maHoSo, [FromQuery] string loaiHoSo)
    {
        try
        {
            return Ok(await lapPhieuDoiSoat.LayChiTietVaTinhToan(maHoSo, loaiHoSo));
        }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "KeToan")]
    [HttpPost]
    public async Task<IActionResult> TaoPhieuDoiSoat([FromBody] TaoPhieuDoiSoatHttpRequest request)
    {
        try
        {
            string? maNhanVien = User.FindFirstValue("MaNV");
            var phieu = await lapPhieuDoiSoat.TaoPhieuDoiSoat(request.MaHoSo, request.LoaiHoSo, request.GhiChu, maNhanVien);
            return Ok(phieu);
        }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }
}
