namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/residence-profiles")]
public sealed class HoSoLuuTruController(NhapHoSoLuuTru nhapHoSoLuuTru) : ControllerBase
{
    [Authorize(Roles = "Sale")]
    [HttpGet("pending")]
    public async Task<IActionResult> LayDanhSachChoNhap([FromQuery] string? text = null) =>
        Ok((await nhapHoSoLuuTru.LayDanhSachChoNhap(text)).Select(TaoDanhSachResponse));

    [Authorize(Roles = "Sale")]
    [HttpGet("{id}")]
    public async Task<IActionResult> LayChiTiet(string id)
    {
        try { return Ok(TaoChiTietResponse(await nhapHoSoLuuTru.LayChiTiet(id))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpPost("{id}")]
    public async Task<IActionResult> NhapHoSo(string id, [FromBody] NhapHoSoLuuTruHttpRequest request)
    {
        try
        {
            var cacThanhVien = request.DanhSachThanhVien?.Select(Map).ToList();
            var phieu = await nhapHoSoLuuTru.NhapHoSo(id, request.DiaChiThuongTru, cacThanhVien);
            return Ok(TaoChiTietResponse(phieu));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    private static PhieuCocChoNhapHoSoHttpResponse TaoDanhSachResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.MaKH, phieu.KhachHang.HoTen, phieu.KhachHang.SDT ?? "",
        phieu.MaPhong, phieu.Phong.SoPhong, phieu.Phong.ToaNha,
        phieu.HinhThucThue, phieu.SoGiuongThue, phieu.ThoiDiemCoc);

    private static ChiTietNhapHoSoHttpResponse TaoChiTietResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.MaKH, phieu.KhachHang.HoTen,
        phieu.KhachHang.SDT, phieu.KhachHang.Email, phieu.KhachHang.GioiTinh,
        phieu.KhachHang.NgaySinh, phieu.KhachHang.QuocTich,
        phieu.KhachHang.LoaiGiayTo, phieu.KhachHang.SoGiayTo, phieu.KhachHang.DiaChiThuongTru,
        phieu.MaPhong, phieu.Phong.SoPhong, phieu.Phong.ToaNha,
        phieu.HinhThucThue, phieu.SoGiuongThue, phieu.Phong.LoaiPhong.SucChua);

    private static KhachHang Map(KhachHangRequest request) => new()
    {
        HoTen = request.HoTen,
        NgaySinh = request.NgaySinh,
        GioiTinh = request.GioiTinh,
        QuocTich = request.QuocTich,
        LoaiGiayTo = request.LoaiGiayTo,
        SoGiayTo = request.SoGiayTo,
        DiaChiThuongTru = request.DiaChiThuongTru,
        SDT = request.SDT,
        Email = request.Email,
    };
}
