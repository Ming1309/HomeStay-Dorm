namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/rooms")]
public sealed class PhongController(LapPhieuCoc lapPhieuCoc) : ControllerBase
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
}
