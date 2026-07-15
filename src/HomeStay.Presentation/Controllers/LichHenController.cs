namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/appointments")]
[Authorize(Roles = "Sale")]
public sealed class LichHenController(LapPhieuCoc lapPhieuCoc, TaoLichHen taoLichHen, TraCuuLichHen traCuuLichHen, SuaLichHen suaLichHen) : ControllerBase
{
    [HttpGet("documents")]
    public async Task<IActionResult> TaiDanhSachChungTu([FromQuery] string type, [FromQuery] string? keyword)
    {
        try
        {
            return Ok(await taoLichHen.TaiDanhSachChungTu(type, keyword, User.FindFirstValue("MaNV")));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> TaoLichHen([FromBody] TaoLichHenHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Nhân viên Sale đang đăng nhập." });

        try
        {
            var lichHen = await taoLichHen.LuuLichHen(
                request.LoaiLichHen,
                request.MaChungTu,
                request.NgayHen,
                request.GioHen,
                maNV);
            return Ok(lichHen);
        }
        catch (Exception ex) when (ex is InvalidOperationException || ex is ArgumentException)
        {
            return BadRequest(new { ex.Message });
        }
    }

    [HttpGet("pending")]
    public async Task<IActionResult> LayDanhSachKhachChoCoc() =>
        Ok(await lapPhieuCoc.LayDanhSachKhachChoCoc(User.FindFirstValue("MaNV")));

    [HttpGet("search")]
    public async Task<IActionResult> TimKiemKhachChoCoc([FromQuery] string text) =>
        Ok(await lapPhieuCoc.TimKiemKhachChoCoc(text, User.FindFirstValue("MaNV")));

    [HttpGet("{id}")]
    public async Task<IActionResult> LayChiTietLichHen(string id)
    {
        var lichHen = await lapPhieuCoc.LayChiTietLichHen(id, User.FindFirstValue("MaNV"));
        return lichHen is null ? NotFound(new { Message = "Không tìm thấy lịch hẹn" }) : Ok(lichHen);
    }

    [HttpGet("all")]
    public async Task<IActionResult> TraCuuLichHenTongQuat([FromQuery] string? keyword, [FromQuery] DateTime? date, [FromQuery] TimeSpan? time)
    {
        return Ok(await traCuuLichHen.ThucHien(keyword, date, time, User.FindFirstValue("MaNV")));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> SuaLichHen(string id, [FromBody] SuaLichHenHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Nhân viên Sale đang đăng nhập." });

        try
        {
            var lichHen = await suaLichHen.ThucHien(id, request.NgayHen, request.GioHen, maNV, request.TrangThai);
            return Ok(lichHen);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { ex.Message });
        }
    }
}
