namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/room-types")]
public sealed class LoaiPhongController(Func<PhienDuLieu> taoPhienDuLieu) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> LayDanhSach()
    {
        using var phien = taoPhienDuLieu();
        return Ok(await LoaiPhong.LayDanhSach());
    }
}
