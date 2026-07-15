namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public sealed class XacThucNguoiDungController(XacThucNguoiDung xacThuc) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> DangNhap(DangNhapHttpRequest request)
    {
        try
        {
            var taiKhoan = await xacThuc.DangNhap(request.TenDangNhap, request.MatKhau);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, taiKhoan.MaTK),
                new Claim(ClaimTypes.Name, taiKhoan.TenDangNhap),
                new Claim(ClaimTypes.Role, taiKhoan.NhanVien.VaiTro),
                new Claim("MaNV", taiKhoan.MaNV),
            };
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
            return Ok(TaoResponse(taiKhoan));
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> DangXuat()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> TaiKhoanHienTai()
    {
        var maTK = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(maTK)) return Unauthorized();

        var taiKhoan = await xacThuc.LayTaiKhoanHienTai(maTK);
        return taiKhoan is null ? Unauthorized() : Ok(TaoResponse(taiKhoan));
    }

    private static object TaoResponse(TaiKhoan taiKhoan) => new
    {
        maTK = taiKhoan.MaTK,
        tenDangNhap = taiKhoan.TenDangNhap,
        hoTen = taiKhoan.NhanVien.HoTen,
        maNV = taiKhoan.MaNV,
        vaiTro = taiKhoan.NhanVien.VaiTro,
        maCN = taiKhoan.NhanVien.MaCN,
        tenChiNhanh = taiKhoan.NhanVien.TenChiNhanh,
    };
}
