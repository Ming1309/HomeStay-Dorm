namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/contracts")]
public sealed class HopDongController(TraCuuHopDong traCuuHopDong) : ControllerBase
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
}
