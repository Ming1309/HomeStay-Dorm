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
    public IActionResult TaiKhoanHienTai() => Ok(new
    {
        maTK = User.FindFirstValue(ClaimTypes.NameIdentifier),
        tenDangNhap = User.Identity?.Name,
        maNV = User.FindFirstValue("MaNV"),
        vaiTro = User.FindFirstValue(ClaimTypes.Role),
    });

    private static object TaoResponse(TaiKhoan taiKhoan) => new
    {
        maTK = taiKhoan.MaTK,
        tenDangNhap = taiKhoan.TenDangNhap,
        maNV = taiKhoan.MaNV,
        vaiTro = taiKhoan.NhanVien.VaiTro,
    };
}
