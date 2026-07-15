namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize(Roles = "Sale,QuanLy,KeToan,QuanTri")]
[Route("api/branches")]
public sealed class ChiNhanhController(Func<PhienDuLieu> taoPhienDuLieu) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> LayDanhSach()
    {
        using var phien = taoPhienDuLieu();
        return Ok(await ChiNhanh.LayDanhSach());
    }
}
