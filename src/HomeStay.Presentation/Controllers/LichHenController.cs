namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/appointments")]
public sealed class LichHenController(LapPhieuCoc lapPhieuCoc) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<IActionResult> LayDanhSachKhachChoCoc() => Ok(await lapPhieuCoc.LayDanhSachKhachChoCoc());

    [HttpGet("search")]
    public async Task<IActionResult> TimKiemKhachChoCoc([FromQuery] string text) =>
        Ok(await lapPhieuCoc.TimKiemKhachChoCoc(text));

    [HttpGet("{id}")]
    public async Task<IActionResult> LayChiTietLichHen(string id)
    {
        var lichHen = await lapPhieuCoc.LayChiTietLichHen(id);
        return lichHen is null ? NotFound(new { Message = "Không tìm thấy lịch hẹn" }) : Ok(lichHen);
    }
}
