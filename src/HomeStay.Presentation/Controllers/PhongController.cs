namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/rooms")]
[Authorize(Roles = "Sale,QuanLy,KeToan")]
public sealed class PhongController(LapPhieuCoc lapPhieuCoc, Func<PhienDuLieu> taoPhienDuLieu) : ControllerBase
{
    [HttpGet("available-with-beds")]
    public async Task<IActionResult> LayPhongOGhep([FromQuery] int soLuong = 1,
        [FromQuery] string? toaNha = null, [FromQuery] string? loaiPhong = null,
        [FromQuery] decimal giaMin = 0, [FromQuery] decimal giaMax = 0) =>
        Ok(await lapPhieuCoc.LayPhongOGhep(soLuong, toaNha, loaiPhong, giaMin, giaMax));

    [HttpGet("available")]
    public async Task<IActionResult> LayPhongNguyenCan([FromQuery] string? toaNha = null,
        [FromQuery] string? loaiPhong = null, [FromQuery] decimal giaMin = 0,
        [FromQuery] decimal giaMax = 0) =>
        Ok(await lapPhieuCoc.LayPhongNguyenCan(toaNha, loaiPhong, giaMin, giaMax));

    [HttpGet("search")]
    public async Task<IActionResult> LocPhongTheoTieuChi([FromQuery] string? toaNha = null,
        [FromQuery] string? tang = null, [FromQuery] string? maLP = null,
        [FromQuery] string? maCN = null, [FromQuery] string? trangThai = null,
        [FromQuery] decimal giaMin = 0, [FromQuery] decimal giaMax = 0)
    {
        using var phien = taoPhienDuLieu();
        return Ok(await Phong.LocPhongTheoTieuChi(toaNha, tang, maLP, maCN, trangThai, giaMin, giaMax));
    }

    [HttpGet("{id}/assets")]
    public async Task<IActionResult> LayTaiSan(string id)
    {
        using var phien = taoPhienDuLieu();
        return Ok(await Phong.LayTaiSan(id));
    }
}
