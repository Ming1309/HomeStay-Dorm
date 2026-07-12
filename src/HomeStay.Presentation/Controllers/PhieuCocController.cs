namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/deposits")]
public sealed class PhieuCocController(LapPhieuCoc lapPhieuCoc, TinhTienCoc tinhTienCoc) : ControllerBase
{
    [Authorize(Roles = "KeToan")]
    [HttpGet("initial")]
    public async Task<IActionResult> LayDanhSachKhoiTao([FromQuery] string? text = null) =>
        Ok((await tinhTienCoc.LayDanhSachKhoiTao(text)).Select(TaoDanhSachResponse));

    [Authorize(Roles = "KeToan")]
    [HttpGet("{id}")]
    public async Task<IActionResult> LayChiTietTinhTien(string id)
    {
        try { return Ok(TaoChiTietResponse(await tinhTienCoc.LayChiTietVaTinhTien(id))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "KeToan")]
    [HttpPost("{id}/xac-nhan-tinh-tien")]
    public async Task<IActionResult> XacNhanTinhTien(string id)
    {
        try { return Ok(TaoChiTietResponse(await tinhTienCoc.XacNhanTinhTien(id))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

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

    private static PhieuCocKhoiTaoHttpResponse TaoDanhSachResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.MaKH, phieu.KhachHang.HoTen, phieu.MaPhong,
        phieu.Phong.SoPhong, phieu.Phong.ToaNha, phieu.HinhThucThue, phieu.ThoiDiemCoc);

    private static ChiTietTinhTienCocHttpResponse TaoChiTietResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.MaKH, phieu.KhachHang.HoTen, phieu.KhachHang.SDT, phieu.KhachHang.Email,
        phieu.MaPhong, phieu.Phong.SoPhong, phieu.Phong.ToaNha, phieu.HinhThucThue,
        phieu.Phong.LoaiPhong.GiaThue, phieu.Phong.LoaiPhong.SucChua, phieu.SoGiuongThue,
        phieu.TongTien, phieu.TrangThai,
        phieu.Giuongs.Select(g => new GiuongTinhTienHttpResponse(g.MaGiuong, g.SoGiuong, g.TrangThai)).ToList());
}
