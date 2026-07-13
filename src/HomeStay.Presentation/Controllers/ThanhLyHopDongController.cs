namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/terminations")]
[Authorize(Roles = "QuanLy")]
public sealed class ThanhLyHopDongController(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    DichVuThongBao dichVuThongBao,
    ILogger<ThanhLyHopDongController> logger) : ControllerBase
{
    private const string MessageA5 =
        "Vui lòng yêu cầu khách hàng thanh toán dứt điểm công nợ trước khi thanh lý";

    [HttpGet("cho-thanh-ly")]
    public async Task<IActionResult> LayDanhSachChoThanhLy([FromQuery] string? text = null)
    {
        try
        {
            using var phien = taoPhienDuLieu();
            var danhSach = await HopDong.LayDanhSachChoThanhLy(text);
            return Ok(danhSach.Select(x =>
            {
                var pds = new PhieuDoiSoat
                {
                    MaPDS = x.MaPDS,
                    TienThuThem = x.TienThuThem,
                    TrangThai = x.TrangThaiPDS,
                };
                return new HopDongChoThanhLyHttpResponse(
                    x.MaHD,
                    x.TenKhachHang,
                    x.SDT,
                    x.SoPhong,
                    x.ToaNha,
                    x.NgayBatDau,
                    x.NgayKetThuc,
                    x.TienCoc,
                    x.MaPDS,
                    x.TienHoan,
                    x.TienThuThem,
                    x.TongKhauTru,
                    x.TrangThaiPDS,
                    PhieuDoiSoat.KiemTraCongNo(pds));
            }));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách hợp đồng chờ thanh lý");
            return StatusCode(500, new { Message = "Không thể tải danh sách hợp đồng chờ thanh lý lúc này." });
        }
    }

    [HttpGet("{maHD}")]
    public async Task<IActionResult> LayChiTietThanhLy(string maHD)
    {
        try
        {
            using var phien = taoPhienDuLieu();

            if (string.IsNullOrWhiteSpace(maHD))
                throw new ArgumentException("Mã hợp đồng không được để trống.");

            var hopDong = await HopDong.LayThongTinHopDong(maHD.Trim())
                ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng.");

            if (!string.Equals(hopDong.TrangThai, "DangHieuLuc", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Hợp đồng không ở trạng thái Đang hiệu lực để thanh lý.");

            var pds = await PhieuDoiSoat.LayThongTinDoiSoat(hopDong.MaHD)
                ?? throw new InvalidOperationException("Hợp đồng chưa có phiếu đối soát. Vui lòng yêu cầu Kế toán lập phiếu đối soát trước.");

            var coTheThanhLy = PhieuDoiSoat.KiemTraCongNo(pds);
            var giuongs = hopDong.ThanhViens.Select(tv => new GiuongThanhLyHttpResponse(
                tv.MaGiuong,
                tv.Giuong?.SoGiuong ?? tv.MaGiuong,
                tv.TrangThaiThue)).ToList();

            return Ok(new ChiTietThanhLyHopDongHttpResponse(
                hopDong.MaHD,
                hopDong.TrangThai,
                hopDong.KhachHang?.HoTen ?? string.Empty,
                hopDong.KhachHang?.SDT,
                hopDong.Phong?.SoPhong ?? string.Empty,
                hopDong.Phong?.ToaNha,
                hopDong.NgayBatDau,
                hopDong.NgayKetThuc,
                hopDong.TienCoc,
                pds.MaPDS,
                pds.NgayDoiSoat,
                pds.TyLeHoanCoc,
                pds.TongKhauTru,
                pds.TienHoan,
                pds.TienThuThem,
                pds.TrangThai,
                coTheThanhLy,
                coTheThanhLy ? null : MessageA5,
                giuongs));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết thanh lý hợp đồng {MaHD}", maHD);
            return StatusCode(500, new { Message = "Không thể tải chi tiết hợp đồng lúc này." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> ThanhLyHopDong([FromBody] ThanhLyHopDongHttpRequest request)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Quản lý đang đăng nhập." });

        if (request is null || string.IsNullOrWhiteSpace(request.MaHD))
            return BadRequest(new { Message = "Mã hợp đồng không được để trống." });

        if (request.Confirmations is null
            || !request.Confirmations.CustomerAgreed
            || !request.Confirmations.LiquidationSigned
            || !request.Confirmations.KeysRecovered)
        {
            return BadRequest(new { Message = "Cần xác nhận đủ 3 mục trước khi thanh lý." });
        }

        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var maHD = request.MaHD.Trim();
            var now = timeProvider.GetLocalNow().DateTime;

            var hopDong = await HopDong.LayThongTinHopDong(maHD)
                ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng.");
            hopDong.KiemTraDangHieuLuc();

            var pds = await PhieuDoiSoat.LayThongTinDoiSoat(maHD)
                ?? throw new InvalidOperationException("Hợp đồng chưa có phiếu đối soát. Vui lòng yêu cầu Kế toán lập phiếu đối soát trước.");

            if (!PhieuDoiSoat.KiemTraCongNo(pds))
                throw new InvalidOperationException(MessageA5);

            await HopDong.ThanhLyHopDong(maHD, now, maNV, request.GhiChu);

            var thanhViens = hopDong.ThanhViens.Count > 0
                ? hopDong.ThanhViens
                : (await ThanhVienHopDong.LayDanhSachGiuong(maHD)).ToList();

            if (thanhViens.Count > 0)
            {
                await ThanhVienHopDong.CapNhatTrangThaiDaTra(maHD, now);

                var dsMaGiuong = thanhViens
                    .Select(x => x.MaGiuong)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (dsMaGiuong.Count > 0)
                    await Giuong.CapNhatDanhSachTrong(dsMaGiuong);
            }

            if (pds.TienHoan > 0)
            {
                await dichVuThongBao.GuiThongBaoKeToan(
                    tieuDe: "Yêu cầu hoàn cọc sau thanh lý",
                    noiDung: $"Hợp đồng {maHD} đã thanh lý. Phiếu đối soát {pds.MaPDS} còn {pds.TienHoan:N0} VNĐ cần hoàn cọc.",
                    lienKet: "/accountant/refunds",
                    maNVGui: maNV,
                    maThamChieu: pds.MaPDS);
            }

            phien.Commit();

            return Ok(new ThanhLyHopDongHttpResponse(
                maHD,
                "DaThanhLy",
                now,
                pds.MaPDS,
                pds.TienHoan,
                pds.TienThuThem));
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
            logger.LogError(ex, "Không thể thanh lý hợp đồng {MaHD}", request.MaHD);
            return StatusCode(500, new { Message = "Không thể thanh lý hợp đồng lúc này." });
        }
    }
}
