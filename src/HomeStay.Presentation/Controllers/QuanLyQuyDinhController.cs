namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.FileStorage;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

// UC 1.4.29 - Quan ly quy dinh luu tru.
[ApiController]
[Route("api/admin/regulations")]
public sealed class QuanLyQuyDinhController(
    QuanLyQuyDinh quanLy,
    ILogger<QuanLyQuyDinhController> logger) : ControllerBase
{
    [Authorize(Roles = "QuanTri")]
    [HttpGet]
    public async Task<IActionResult> LayDanhSach()
    {
        try
        {
            var danhSach = await quanLy.LayDanhSach();
            return Ok(danhSach.Select(TaoResponse));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách quy định.");
            return StatusCode(500, new { message = "Không thể tải danh sách quy định lúc này." });
        }
    }

    [Authorize(Roles = "QuanTri")]
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> Them(
        [FromForm] TaoQuyDinhHttpRequest request, CancellationToken cancellationToken)
    {
        if (request.File is null)
            return BadRequest(new { message = "Vui lòng tải lên văn bản PDF." });

        try
        {
            await using var noiDung = request.File.OpenReadStream();
            var quyDinh = await quanLy.Them(
                Map(request.TenQD, request.LoaiQD, request.NgayApDung, request.NgayKetThuc),
                new TepQuyDinh(request.File.FileName, request.File.Length, noiDung),
                cancellationToken);
            return Ok(TaoResponse(quyDinh));
        }
        catch (InvalidDataException ex) { return BadRequest(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex)
        {
            logger.LogError(ex, "Không thể tạo quy định.");
            return StatusCode(500, new { message = "Không thể tạo quy định lúc này." });
        }
    }

    [Authorize(Roles = "QuanTri")]
    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> CapNhat(
        string id, [FromForm] CapNhatQuyDinhHttpRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            TepQuyDinh? tep = null;
            Stream? noiDung = null;
            if (request.File is not null)
            {
                noiDung = request.File.OpenReadStream();
                tep = new TepQuyDinh(request.File.FileName, request.File.Length, noiDung);
            }

            try
            {
                var quyDinh = await quanLy.CapNhat(
                    id, Map(request.TenQD, request.LoaiQD, request.NgayApDung,
                        request.NgayKetThuc), tep, cancellationToken);
                return Ok(TaoResponse(quyDinh));
            }
            finally
            {
                if (noiDung is not null) await noiDung.DisposeAsync();
            }
        }
        catch (InvalidDataException ex) { return BadRequest(new { message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex)
        {
            logger.LogError(ex, "Không thể cập nhật quy định {MaQD}.", id);
            return StatusCode(500, new { message = "Không thể cập nhật quy định lúc này." });
        }
    }

    [Authorize(Roles = "QuanTri")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Xoa(string id, CancellationToken cancellationToken)
    {
        try
        {
            await quanLy.Xoa(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex)
        {
            logger.LogError(ex, "Không thể xóa quy định {MaQD}.", id);
            return Conflict(new { message = "Không thể xóa quy định đang được áp dụng trong hệ thống." });
        }
    }

    [Authorize]
    [HttpGet("documents/{tenTep}")]
    public async Task<IActionResult> DocVanBan(
        string tenTep, CancellationToken cancellationToken)
    {
        var noiDung = await quanLy.DocVanBan(tenTep, cancellationToken);
        return noiDung is null
            ? NotFound(new { message = "Không tìm thấy văn bản quy định." })
            : File(noiDung.DuLieu, noiDung.ContentType);
    }

    private QuyDinhHttpResponse TaoResponse(QuyDinh quyDinh) => new(
        quyDinh.MaQD,
        quyDinh.TenQD,
        quyDinh.LoaiQD,
        quyDinh.DuongDanFile,
        quyDinh.NgayApDung,
        quyDinh.NgayKetThuc,
        quyDinh.TinhTrangThai(quanLy.HomNay));

    private static QuyDinh Map(
        string tenQD, string loaiQD, DateOnly ngayApDung, DateOnly? ngayKetThuc) => new()
    {
        TenQD = tenQD,
        LoaiQD = loaiQD,
        NgayApDung = ngayApDung,
        NgayKetThuc = ngayKetThuc,
    };
}
