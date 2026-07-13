namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/compensation")]
[Authorize(Roles = "KeToan")]
public sealed class HoaDonBoiThuongController(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    ILogger<HoaDonBoiThuongController> logger) : ControllerBase
{
    [HttpGet("bien-ban-chua-xu-ly")]
    public async Task<IActionResult> LayDSBienBanChuaXuLy([FromQuery] string? text = null)
    {
        try
        {
            using var phien = taoPhienDuLieu();
            var danhSach = await BienBanGiaoNhan.LayDSBienBanThuHoiChuaXuLy(text);
            return Ok(danhSach.Select(x => new BienBanThuHoiChuaXuLyHttpResponse(
                x.MaBienBan,
                x.NgayBanGiao,
                x.MaHD,
                x.TenKhachHang ?? string.Empty,
                x.SoPhong ?? string.Empty,
                x.ToaNha,
                x.TenNguoiLap)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách biên bản thu hồi chưa xử lý");
            return StatusCode(500, new { Message = "Không thể tải danh sách biên bản lúc này." });
        }
    }

    [HttpGet("bien-ban/{maBienBan}")]
    public async Task<IActionResult> LayChiTietBienBan(string maBienBan)
    {
        try
        {
            using var phien = taoPhienDuLieu();
            var bienBan = await BienBanGiaoNhan.LayChiTietBienBan(maBienBan)
                ?? throw new KeyNotFoundException("Không tìm thấy biên bản thu hồi.");

            if (!string.Equals(bienBan.LoaiBienBan, "ThuHoi", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Biên bản không phải loại thu hồi.");

            var dsHuHong = await ChiTietGiaoNhan.LayDSTaiSanHuHongTheoBienBan(maBienBan);

            // Sequence: gọi TaiSan.layThongTinTaiSan cho từng MaTS
            var taiSanResponses = new List<TaiSanHuHongHttpResponse>();
            foreach (var item in dsHuHong)
            {
                var ts = await TaiSan.LayThongTinTaiSan(item.MaTS);
                taiSanResponses.Add(new TaiSanHuHongHttpResponse(
                    item.MaTS,
                    ts?.TenTaiSan ?? item.TenTaiSan ?? item.MaTS,
                    item.TinhTrang,
                    item.SoLuong,
                    item.GhiChu,
                    item.MinhChung,
                    ts?.GiaTri ?? item.GiaTriGoiY));
            }

            return Ok(new ChiTietBienBanThuHoiHttpResponse(
                bienBan.MaBienBan,
                bienBan.NgayBanGiao,
                bienBan.MaHD,
                bienBan.TenKhachHang ?? string.Empty,
                bienBan.SoPhong ?? string.Empty,
                bienBan.ToaNha,
                bienBan.TenNguoiLap,
                bienBan.MaNV,
                taiSanResponses));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết biên bản {MaBienBan}", maBienBan);
            return StatusCode(500, new { Message = "Không thể tải chi tiết biên bản lúc này." });
        }
    }

    [HttpPost("hoa-don")]
    public async Task<IActionResult> LapHoaDonBoiThuong([FromBody] LapHoaDonBoiThuongHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        if (request is null || string.IsNullOrWhiteSpace(request.MaBienBan))
            return BadRequest(new { Message = "Mã biên bản không được để trống." });

        if (request.ChiTiet is null || request.ChiTiet.Count == 0)
            return BadRequest(new { Message = "Vui lòng nhập số tiền phạt hợp lệ" });

        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            // 4.1 kiemTraTinhHopLe(dsSoTien)
            var dsSoTien = request.ChiTiet.Select(x => x.DonGia).ToList();
            HoaDon.KiemTraTinhHopLe(dsSoTien);

            foreach (var line in request.ChiTiet)
            {
                if (string.IsNullOrWhiteSpace(line.MaTS) || line.SoLuong <= 0)
                    throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");
            }

            // 4.2–4.3 layThongTinNhanVien
            var nhanVien = await NhanVien.LayThongTinNhanVien(maNV)
                ?? throw new KeyNotFoundException("Không tìm thấy thông tin kế toán đang đăng nhập.");

            var tongTien = request.ChiTiet.Sum(x => x.SoLuong * x.DonGia);
            var now = timeProvider.GetLocalNow().DateTime;
            var maBienBan = request.MaBienBan.Trim();

            // 4.4–4.5 taoHoaDonBoiThuong + insertHoaDon
            var hoaDon = await HoaDon.TaoHoaDonBoiThuong(
                maBienBan,
                tongTien,
                nhanVien.MaNV,
                now,
                request.GhiChu);

            // 4.6–4.7 taoChiTietHoaDon
            var dsChiTiet = request.ChiTiet.Select(x => new ChiTietHoaDon
            {
                MaTS = x.MaTS.Trim(),
                SoLuong = x.SoLuong,
                DonGia = x.DonGia,
            }).ToList();

            await ChiTietHoaDon.TaoChiTietHoaDon(hoaDon.MaHoaDon, dsChiTiet);

            var bienBan = await BienBanGiaoNhan.LayChiTietBienBan(maBienBan);

            phien.Commit();

            return Ok(new LapHoaDonBoiThuongHttpResponse(
                hoaDon.MaHoaDon,
                hoaDon.TongTien,
                hoaDon.TrangThai,
                maBienBan,
                hoaDon.MaHD,
                bienBan?.TenKhachHang ?? string.Empty));
        }
        catch (ArgumentException ex)
        {
            phien.Rollback();
            return BadRequest(new { Message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            phien.Rollback();
            return NotFound(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            phien.Rollback();
            return Conflict(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            phien.Rollback();
            logger.LogError(ex, "Không thể lập hóa đơn bồi thường cho biên bản {MaBienBan}", request.MaBienBan);
            return StatusCode(500, new { Message = "Không thể lập hóa đơn bồi thường lúc này." });
        }
    }
}
