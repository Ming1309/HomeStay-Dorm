namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "QuanTri")]
public sealed class QuanLyNguoiDungController(QuanLyNguoiDung quanLy) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> LayDanhSach() => Ok((await quanLy.LayDanhSach()).Select(TaoResponse));

    [HttpPost]
    public async Task<IActionResult> Tao(TaoTaiKhoanHttpRequest request)
    {
        try
        {
            var taiKhoan = await quanLy.Tao(new TaiKhoan
            {
                MaTK = $"TK_{request.MaNV}", TenDangNhap = request.TenDangNhap, Email = request.Email, PhongBan = request.PhongBan,
            }, new NhanVien { MaNV = request.MaNV, HoTen = request.HoTen, SDT = request.SDT, VaiTro = request.VaiTro, MaCN = request.MaCN }, request.MatKhauTam);
            return Ok(TaoResponse(taiKhoan));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (Exception ex) when (ex is InvalidOperationException || ex.GetType().Name.Contains("SqlException")) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> CapNhat(string id, CapNhatTaiKhoanHttpRequest request)
    {
        try
        {
            var taiKhoan = (await quanLy.LayDanhSach()).SingleOrDefault(x => x.MaTK == id);
            if (taiKhoan is null) return NotFound();
            taiKhoan.TenDangNhap = request.TenDangNhap; taiKhoan.Email = request.Email; taiKhoan.PhongBan = request.PhongBan;
            taiKhoan.NhanVien.HoTen = request.HoTen; taiKhoan.NhanVien.SDT = request.SDT; taiKhoan.NhanVien.VaiTro = request.VaiTro; taiKhoan.NhanVien.MaCN = request.MaCN;
            await quanLy.CapNhat(taiKhoan, taiKhoan.NhanVien);
            return Ok(TaoResponse(taiKhoan));
        }
        catch (Exception ex) when (ex is InvalidOperationException || ex.GetType().Name.Contains("SqlException")) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> DoiTrangThai(string id, DoiTrangThaiTaiKhoanHttpRequest request)
    {
        try { await quanLy.DoiTrangThai(id, request.TrangThai, User.FindFirstValue(ClaimTypes.NameIdentifier)!); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> DatLaiMatKhau(string id, DatLaiMatKhauHttpRequest request)
    {
        try { await quanLy.DatLaiMatKhau(id, request.MatKhauTam); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    private static object TaoResponse(TaiKhoan x) => new
    {
        id = x.MaTK, code = x.NhanVien.MaNV, fullName = x.NhanVien.HoTen, username = x.TenDangNhap,
        email = x.Email ?? string.Empty, phone = x.NhanVien.SDT ?? string.Empty, role = x.NhanVien.VaiTro,
        branch = x.NhanVien.TenChiNhanh ?? x.NhanVien.MaCN, department = x.PhongBan ?? string.Empty,
        status = x.TrangThai, lastLoginAt = x.LanDangNhapCuoi, createdAt = (DateTime?)null, createdBy = "System",
    };
}
