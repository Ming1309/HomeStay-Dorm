namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/registrations")]
[Authorize(Roles = "Sale")]
public sealed class PhieuDangKyController(LapPhieuDangKy lapPhieuDangKy) : ControllerBase
{
    // UC1 - Lập phiếu đăng ký
    [HttpPost]
    public async Task<IActionResult> TaoPhieuDangKy([FromBody] TaoPhieuDangKyHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Nhân viên Sale đang đăng nhập." });

        try
        {
            var phieu = await lapPhieuDangKy.TaoPhieuDangKy(
                request.HoTen, request.GioiTinh, request.SDT, request.Email,
                request.DiaChiThuongTru, request.LoaiGiayTo, request.SoGiayTo,
                request.KhuVuc, request.SoLuongNguoi, request.LoaiDichVu, request.MucGia,
                request.ThoiGianDuKienVao, request.ThoiHanThue, request.YeuCauKhac,
                maNV);
            return Ok(phieu);
        }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    // UC2 - Tra cứu phiếu đăng ký theo SĐT / Số giấy tờ / Email
    [HttpGet("search")]
    public async Task<IActionResult> TimKiemPhieuDangKy(
        [FromQuery] string? sdt,
        [FromQuery] string? soGiayTo,
        [FromQuery] string? email,
        [FromQuery] string? hoTen,
        [FromQuery] string? maPDK)
    {
        try
        {
            var phieus = await lapPhieuDangKy.TimKiemPhieuDangKy(sdt, soGiayTo, email, hoTen, maPDK);
            return Ok(phieus);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    // UC2 - Xem chi tiết một phiếu đăng ký cụ thể
    [HttpGet("{id}")]
    public async Task<IActionResult> LayChiTietPhieuDangKy(string id)
    {
        var phieu = await lapPhieuDangKy.LayChiTietPhieuDangKy(id);
        return phieu is null
            ? NotFound(new { Message = "Không tìm thấy phiếu đăng ký." })
            : Ok(phieu);
    }
}
