namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/deposits")]
public sealed class PhieuCocController(LapPhieuCoc lapPhieuCoc) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> TaoPhieuCoc([FromBody] TaoPhieuCocHttpRequest request)
    {
        try
        {
            var phieuCoc = await lapPhieuCoc.TaoPhieuCoc(
                request.MaLichHen,
                request.KhachHang,
                request.MaPhong,
                request.DanhSachGiuong,
                request.HinhThucThue,
                request.MaNV);
            return Ok(phieuCoc);
        }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }
}
