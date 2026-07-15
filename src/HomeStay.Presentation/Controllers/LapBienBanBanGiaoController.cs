namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/handover")]
public sealed class LapBienBanBanGiaoController(LapBienBanBanGiao lapBienBanBanGiao) : ControllerBase
{
    [Authorize(Roles = "QuanLy")]
    [HttpGet("contracts")]
    public async Task<IActionResult> LayDanhSach([FromQuery] string? tuKhoa = null)
    {
        try
        {
            var danhSach = await lapBienBanBanGiao.LayDanhSachChoBanGiao(tuKhoa);
            return Ok(danhSach.Select(x => new HandoverListItemHttpResponse(
                x.MaHD, x.TenKhachHang, x.SoPhong, x.ToaNha)));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpGet("contracts/{id}")]
    public async Task<IActionResult> LayChiTiet(string id)
    {
        try
        {
            var chiTiet = await lapBienBanBanGiao.LayChiTietBanGiao(id);
            return Ok(new HandoverDetailHttpResponse(
                chiTiet.MaHD,
                chiTiet.TenKhachHang,
                chiTiet.SoPhong,
                chiTiet.ToaNha,
                chiTiet.MaPhong,
                chiTiet.TaiSan.Select(ts => new HandoverAssetHttpResponse(
                    ts.MaTS, ts.TaiSan.TenTaiSan, ts.SoLuongTieuChuan)).ToList()));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("contracts/{id}")]
    public async Task<IActionResult> ChotBienBan(string id, [FromBody] LapBienBanBanGiaoHttpRequest request)
    {
        var maNhanVien = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            return Unauthorized(new { Message = "Không xác định được Quản lý đang đăng nhập." });

        try
        {
            var assets = (request.Assets ?? []).Select(a => new TaiSanBanGiaoInput(
                a.MaTS, a.SoLuong, a.TinhTrang, a.GhiChu)).ToList();

            var bienBan = await lapBienBanBanGiao.ChotBienBan(id, maNhanVien, assets);
            return Ok(new LapBienBanBanGiaoHttpResponse(
                bienBan.MaBienBan, bienBan.NgayBanGiao, bienBan.MaHD, bienBan.LoaiBienBan));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("contracts/{id}/cancel")]
    public IActionResult HuyBanGiao(string id)
    {
        return Ok(new { Message = $"Đã dừng quá trình bàn giao cho hợp đồng {id}.", MaHD = id });
    }
}
