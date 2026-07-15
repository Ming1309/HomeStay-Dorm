namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/rooms")]
[Authorize(Roles = "Sale,QuanLy,KeToan")]
public sealed class PhongController(LapPhieuCoc lapPhieuCoc, Func<PhienDuLieu> taoPhienDuLieu) : ControllerBase
{
    [HttpGet("available-with-beds")]
    [Authorize(Roles = "Sale")]
    public async Task<IActionResult> LayPhongOGhep([FromQuery] int soLuong = 1,
        [FromQuery] string? toaNha = null, [FromQuery] string? loaiPhong = null,
        [FromQuery] decimal giaMin = 0, [FromQuery] decimal giaMax = 0,
        [FromQuery] string? gioiTinh = null)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Nhân viên Sale đang đăng nhập." });
        try
        {
            var phongs = await lapPhieuCoc.LayPhongOGhep(soLuong, toaNha, loaiPhong,
                giaMin, giaMax, gioiTinh, maNV);
            return Ok(phongs.Select(TaoPhongDatCocResponse));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [HttpGet("available")]
    [Authorize(Roles = "Sale")]
    public async Task<IActionResult> LayPhongNguyenCan([FromQuery] string? toaNha = null,
        [FromQuery] string? loaiPhong = null, [FromQuery] decimal giaMin = 0,
        [FromQuery] decimal giaMax = 0, [FromQuery] string? gioiTinh = null)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Nhân viên Sale đang đăng nhập." });
        try
        {
            var phongs = await lapPhieuCoc.LayPhongNguyenCan(toaNha, loaiPhong,
                giaMin, giaMax, gioiTinh, maNV);
            return Ok(phongs.Select(TaoPhongDatCocResponse));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }

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

    private static PhongDatCocHttpResponse TaoPhongDatCocResponse(Phong phong) => new(
        phong.MaPhong,
        phong.SoPhong,
        phong.ToaNha,
        phong.GioiTinhChoPhep,
        phong.TrangThai,
        new LoaiPhongDatCocHttpResponse(
            phong.LoaiPhong.MaLP,
            phong.LoaiPhong.TenLoaiPhong,
            phong.LoaiPhong.GiaThue,
            phong.LoaiPhong.SucChua),
        phong.Giuongs.Select(g => new GiuongDatCocHttpResponse(
            g.MaGiuong, g.SoGiuong, g.TrangThai)).ToList());
}
