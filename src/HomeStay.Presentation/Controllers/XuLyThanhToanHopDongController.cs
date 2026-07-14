namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/contract-payments")]
[Authorize(Roles = "KeToan")]
public sealed class XuLyThanhToanHopDongController(
    XuLyThanhToanHopDong xuLyThanhToanHopDong,
    IChungTuTaiChinhStorage chungTuStorage,
    ILogger<XuLyThanhToanHopDongController> logger) : ControllerBase
{
    [HttpGet("queue")]
    public async Task<IActionResult> LayDSChoThanhToan()
    {
        try
        {
            var ds = await xuLyThanhToanHopDong.LayDSChoThanhToan();
            return Ok(ds.Select(x => new HopDongChoThanhToanHttpResponse(
                x.MaHD,
                x.TenKhachHang,
                x.SoPhong,
                x.ToaNha,
                x.GiaThue,
                x.KyThanhToan,
                x.TongTienCanThu)));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách hợp đồng chờ thanh toán");
            return StatusCode(500, new { Message = "Không thể tải danh sách hợp đồng chờ thanh toán lúc này." });
        }
    }

    [HttpGet("{maHD}")]
    public async Task<IActionResult> LayChiTietThanhToan(string maHD)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(maHD))
                throw new ArgumentException("Mã hợp đồng không được để trống.");

            var ct = await xuLyThanhToanHopDong.LayChiTietThanhToan(maHD.Trim());
            return Ok(new ChiTietThanhToanHopDongHttpResponse(
                ct.MaHD,
                ct.TenKhachHang,
                ct.SoPhong,
                ct.ToaNha,
                ct.GiaThue,
                ct.KyThanhToan,
                ct.TienThueKyDau,
                ct.TienDichVu,
                ct.TongCong,
                ct.KhoanThus.Select(k => new KhoanThuHttpResponse(
                    k.TenKhoanThu,
                    k.SoLuongKy,
                    k.DonGia,
                    k.ThanhTien)).ToList()));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết thanh toán hợp đồng {MaHD}", maHD);
            return StatusCode(500, new { Message = "Không thể tải chi tiết thanh toán lúc này." });
        }
    }

    [HttpPost("collect")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> TienHanhThuTien([FromForm] TienHanhThuTienHttpRequest request, CancellationToken cancellationToken)
    {
        var maNV = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNV))
            return Unauthorized(new { Message = "Không xác định được Kế toán đang đăng nhập." });

        if (request is null || string.IsNullOrWhiteSpace(request.MaHD))
            return BadRequest(new { Message = "Mã hợp đồng không được để trống." });

        if (string.IsNullOrWhiteSpace(request.PhuongThucThanhToan))
            return BadRequest(new { Message = "Phương thức thanh toán không được để trống." });

        string? minhChung = null;
        var daLuu = false;
        try
        {
            if (request.ChungTu is null)
                return BadRequest(new { Message = "Phải tải lên chứng từ xác nhận đã thu tiền." });
            await using var noiDung = request.ChungTu.OpenReadStream();
            minhChung = await chungTuStorage.Luu("thu",
                new TepChungTuTaiChinh(request.ChungTu.FileName, request.ChungTu.Length, noiDung), cancellationToken);
            var pt = await xuLyThanhToanHopDong.TienHanhThuTien(
                request.MaHD.Trim(),
                request.PhuongThucThanhToan,
                minhChung,
                maNV);
            daLuu = true;

            return Ok(new TienHanhThuTienHttpResponse(
                pt.MaPT,
                pt.SoTienThu,
                pt.PhuongThucThanhToan ?? request.PhuongThucThanhToan,
                pt.ThoiGian));
        }
        catch (InvalidDataException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Conflict khi thu tiền hợp đồng {MaHD}: {Message}", request.MaHD, ex.Message);
            return Conflict(new { Message = ex.Message });
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627 or 1205)
        {
            return Conflict(new { Message = "Giao dịch đã được xử lý bởi yêu cầu khác. Vui lòng tải lại." });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể xử lý thanh toán hợp đồng {MaHD}", request.MaHD);
            return StatusCode(500, new { Message = "Không thể xử lý thanh toán lúc này." });
        }
        finally
        {
            if (minhChung is not null && !daLuu)
                await chungTuStorage.Xoa(minhChung, cancellationToken);
        }
    }
}
