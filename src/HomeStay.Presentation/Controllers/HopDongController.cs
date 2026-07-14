namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/contracts")]
public sealed class HopDongController(
    TraCuuHopDong traCuuHopDong,
    LapHopDongThue lapHopDongThue) : ControllerBase
{
    [Authorize(Roles = "Sale,QuanLy,KeToan")]
    [HttpGet("lookup")]
    public async Task<IActionResult> TraCuu(
        [FromQuery] string? tuKhoa = null,
        [FromQuery] string? trangThai = null)
    {
        try
        {
            return Ok((await traCuuHopDong.TimKiem(tuKhoa, trangThai)).Select(TaoHopDongResponse));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale,QuanLy,KeToan")]
    [HttpGet("{id}/lookup")]
    public async Task<IActionResult> LayChiTiet(string id)
    {
        try { return Ok(TaoChiTietResponse(await traCuuHopDong.LayChiTiet(id))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }

    private static HopDongTraCuuHttpResponse TaoHopDongResponse(HopDong hd) => new(
        hd.MaHD,
        hd.KhachHang.HoTen,
        hd.KhachHang.SDT,
        hd.KhachHang.SoGiayTo,
        hd.Phong.MaPhong,
        hd.Phong.SoPhong,
        hd.Phong.ToaNha,
        hd.Phong.LoaiPhong.TenLoaiPhong,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.KyThanhToan,
        hd.GiaThue,
        hd.TienCoc,
        hd.TrangThai);

    private static ChiTietHopDongTraCuuHttpResponse TaoChiTietResponse(HopDong hd) => new(
        hd.MaHD,
        hd.KhachHang.HoTen,
        hd.KhachHang.SDT,
        hd.KhachHang.Email,
        hd.KhachHang.SoGiayTo,
        hd.KhachHang.DiaChiThuongTru,
        hd.KhachHang.GioiTinh,
        hd.KhachHang.QuocTich,
        hd.KhachHang.NgaySinh,
        hd.KhachHang.LoaiGiayTo,
        hd.Phong.MaPhong,
        hd.Phong.SoPhong,
        hd.Phong.ToaNha,
        hd.Phong.Tang,
        hd.Phong.LoaiPhong.TenLoaiPhong,
        hd.Phong.LoaiPhong.SucChua,
        hd.Phong.LoaiPhong.GiaThue,
        hd.NgayKy,
        hd.NgayBatDau,
        hd.NgayKetThuc,
        hd.KyThanhToan,
        hd.GiaThue,
        hd.TienCoc,
        hd.DieuKhoan,
        hd.TrangThai,
        hd.MaPhieuCoc,
        hd.ThanhViens.Select(tv => new ThanhVienTraCuuHttpResponse(
            tv.MaKH,
            tv.KhachHang.HoTen,
            tv.KhachHang.SDT,
            tv.KhachHang.GioiTinh,
            tv.KhachHang.NgaySinh,
            tv.KhachHang.LoaiGiayTo,
            tv.KhachHang.SoGiayTo,
            tv.KhachHang.QuocTich,
            tv.KhachHang.DiaChiThuongTru,
            tv.Giuong.SoGiuong,
            tv.TrangThaiThue)).ToList(),
        hd.DichVus.Select(dv => new DichVuTraCuuHttpResponse(
            dv.MaDV,
            dv.DichVu.TenDV,
            dv.DonGiaKyKet,
            dv.DichVu.DonViTinh)).ToList());

    // ── Contract creation (UC 1.4.13) ───────────────────────────

    [Authorize(Roles = "Sale")]
    [HttpGet("approved-deposits")]
    public async Task<IActionResult> LayDanhSachPhieuCocDaDuyet(
        [FromQuery] string? text = null)
    {
        try
        {
            var ds = await lapHopDongThue.LayDanhSachPhieuCocDaDuyet(text);
            return Ok(ds.Select(p => new PhieuCocDaDuyetHttpResponse(
                p.MaPhieuCoc, p.KhachHang.HoTen, p.KhachHang.SDT,
                p.Phong.SoPhong, p.Phong.ToaNha, p.Phong.LoaiPhong.TenLoaiPhong,
                p.HinhThucThue, p.SoGiuongThue, p.TongTien, p.TongTien,
                0, p.ThoiDiemCoc)).ToList());
        }
        catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpGet("approved-deposits/{id}")]
    public async Task<IActionResult> LayChiTietPhieuCocDaDuyet(string id)
    {
        try { return Ok(await lapHopDongThue.LayThongTinPhieuCoc(id)); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpPost]
    public async Task<IActionResult> TaoHopDong([FromBody] LapHopDongHttpRequest request)
    {
        try
        {
            var maNV = User.FindFirst("MaNV")?.Value;
            var hopDong = await lapHopDongThue.TaoHopDong(
                request.MaPhieuCoc, maNV, request.NgayBatDau, request.NgayKetThuc,
                request.KyThanhToan, request.GiaThue, request.MaQD, request.MaDichVus ?? []);
            return Ok(new HopDongDaTaoHttpResponse(
                hopDong.MaHD, hopDong.MaPhieuCoc, hopDong.NgayBatDau, hopDong.NgayKetThuc,
                hopDong.KyThanhToan, hopDong.GiaThue, hopDong.TrangThai));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpPost("{id}/confirm-signed")]
    public async Task<IActionResult> XacNhanDaKy(string id)
    {
        try
        {
            var hopDong = await lapHopDongThue.XacNhanKhachDaKy(id);
            return Ok(new { Message = "Lap hop dong thanh cong", MaHD = hopDong.MaHD });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> HuyHopDong(string id)
    {
        try
        {
            await lapHopDongThue.HuyHopDong(id);
            return Ok(new { Message = "Da huy hop dong" });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
    }
}
