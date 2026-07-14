namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

// UC 1.4.25 - Quan ly phong / giuong (chi vai tro QuanTri).
[ApiController]
[Route("api/admin/rooms-beds")]
[Authorize(Roles = "QuanTri")]
public sealed class QuanLyPhongGiuongController(
    QuanLyPhongGiuong quanLy,
    ILogger<QuanLyPhongGiuongController> logger) : ControllerBase
{
    [HttpGet("room-types")]
    public async Task<IActionResult> LayDanhSachLoaiPhong()
    {
        try
        {
            return Ok(await quanLy.LayDanhSachLoaiPhong());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách loại phòng.");
            return StatusCode(500, new { message = "Không thể tải danh sách loại phòng lúc này." });
        }
    }

    [HttpGet("branches")]
    public async Task<IActionResult> LayDanhSachChiNhanh()
    {
        try
        {
            return Ok(await quanLy.LayDanhSachChiNhanh());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách chi nhánh.");
            return StatusCode(500, new { message = "Không thể tải danh sách chi nhánh lúc này." });
        }
    }

    // ---- Phong ----

    [HttpGet("rooms")]
    public async Task<IActionResult> LayDanhSachPhong([FromQuery] string? text = null,
        [FromQuery] string? maCN = null, [FromQuery] string? toaNha = null,
        [FromQuery] string? trangThai = null)
    {
        try
        {
            var phongs = await quanLy.LayDanhSachPhong(text, maCN, toaNha, trangThai);
            return Ok(phongs.Select(TaoPhongResponse));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách phòng.");
            return StatusCode(500, new { message = "Không thể tải danh sách phòng lúc này." });
        }
    }

    [HttpGet("rooms/{id}")]
    public async Task<IActionResult> LayChiTietPhong(string id)
    {
        try
        {
            var phong = await quanLy.LayChiTietPhong(id);
            return phong is null ? NotFound(new { message = "Không tìm thấy phòng." })
                : Ok(TaoPhongResponse(phong));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết phòng {MaPhong}.", id);
            return StatusCode(500, new { message = "Không thể tải chi tiết phòng lúc này." });
        }
    }

    [HttpPost("rooms")]
    public async Task<IActionResult> ThemPhong(TaoPhongHttpRequest request)
    {
        try
        {
            var phong = await quanLy.ThemPhong(MapPhong(request.SoPhong, request.ToaNha, request.Tang,
                request.GioiTinhChoPhep, "Trong", request.MaLP, request.MaCN));
            var chiTiet = await quanLy.LayChiTietPhong(phong.MaPhong);
            return Ok(TaoPhongResponse(chiTiet ?? phong));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Dữ liệu phòng vi phạm ràng buộc hệ thống.", "Không thể tạo phòng lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tạo phòng.");
            return StatusCode(500, new { message = "Không thể tạo phòng lúc này." });
        }
    }

    [HttpPut("rooms/{id}")]
    public async Task<IActionResult> CapNhatPhong(string id, CapNhatPhongHttpRequest request)
    {
        try
        {
            var phong = await quanLy.CapNhatPhong(id, MapPhong(request.SoPhong, request.ToaNha,
                request.Tang, request.GioiTinhChoPhep, request.TrangThai, request.MaLP, request.MaCN));
            return Ok(TaoPhongResponse(phong));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Dữ liệu phòng vi phạm ràng buộc hệ thống.", "Không thể cập nhật phòng lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể cập nhật phòng {MaPhong}.", id);
            return StatusCode(500, new { message = "Không thể cập nhật phòng lúc này." });
        }
    }

    [HttpDelete("rooms/{id}")]
    public async Task<IActionResult> XoaPhong(string id)
    {
        try
        {
            await quanLy.XoaPhong(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.", "Không thể xóa phòng lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể xóa phòng {MaPhong}.", id);
            return StatusCode(500, new { message = "Không thể xóa phòng lúc này." });
        }
    }

    // ---- Giuong ----

    [HttpGet("beds")]
    public async Task<IActionResult> LayDanhSachGiuong([FromQuery] string? text = null,
        [FromQuery] string? maPhong = null, [FromQuery] string? trangThai = null)
    {
        try
        {
            var giuongs = await quanLy.LayDanhSachGiuong(text, maPhong, trangThai);
            return Ok(giuongs.Select(TaoGiuongResponse));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải danh sách giường.");
            return StatusCode(500, new { message = "Không thể tải danh sách giường lúc này." });
        }
    }

    [HttpGet("beds/{id}")]
    public async Task<IActionResult> LayChiTietGiuong(string id)
    {
        try
        {
            var giuong = await quanLy.LayChiTietGiuong(id);
            return giuong is null ? NotFound(new { message = "Không tìm thấy giường." })
                : Ok(TaoGiuongResponse(giuong));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tải chi tiết giường {MaGiuong}.", id);
            return StatusCode(500, new { message = "Không thể tải chi tiết giường lúc này." });
        }
    }

    [HttpPost("beds")]
    public async Task<IActionResult> ThemGiuong(TaoGiuongHttpRequest request)
    {
        try
        {
            var giuong = await quanLy.ThemGiuong(new Giuong
            {
                SoGiuong = request.SoGiuong,
                TrangThai = "Trong",
                MaPhong = request.MaPhong,
            });
            return Ok(TaoGiuongResponse(giuong));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Dữ liệu giường vi phạm ràng buộc hệ thống.", "Không thể tạo giường lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể tạo giường.");
            return StatusCode(500, new { message = "Không thể tạo giường lúc này." });
        }
    }

    [HttpPut("beds/{id}")]
    public async Task<IActionResult> CapNhatGiuong(string id, CapNhatGiuongHttpRequest request)
    {
        try
        {
            var giuong = await quanLy.CapNhatGiuong(id, new Giuong
            {
                SoGiuong = request.SoGiuong,
                TrangThai = request.TrangThai,
                MaPhong = request.MaPhong,
            });
            return Ok(TaoGiuongResponse(giuong));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Dữ liệu giường vi phạm ràng buộc hệ thống.", "Không thể cập nhật giường lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể cập nhật giường {MaGiuong}.", id);
            return StatusCode(500, new { message = "Không thể cập nhật giường lúc này." });
        }
    }

    [HttpDelete("beds/{id}")]
    public async Task<IActionResult> XoaGiuong(string id)
    {
        try
        {
            await quanLy.XoaGiuong(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (SqlException ex) { return XuLyLoiSql(ex, "Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.", "Không thể xóa giường lúc này."); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Không thể xóa giường {MaGiuong}.", id);
            return StatusCode(500, new { message = "Không thể xóa giường lúc này." });
        }
    }

    // Chi map loi rang buoc SQL (2601/2627 trung khoa, 547 khoa ngoai/CHECK) thanh 409.
    // Cac loi SQL khac duoc ghi log va tra 500 chung.
    private IActionResult XuLyLoiSql(SqlException ex, string thongDiepXungDot, string thongDiep500)
    {
        if (ex.Number is 2601 or 2627 or 547)
            return Conflict(new { message = thongDiepXungDot });
        logger.LogError(ex, "Lỗi SQL không mong đợi (Number={Number}).", ex.Number);
        return StatusCode(500, new { message = thongDiep500 });
    }

    private static Phong MapPhong(string soPhong, string? toaNha, string? tang,
        string? gioiTinhChoPhep, string trangThai, string maLP, string maCN) => new()
    {
        SoPhong = soPhong,
        ToaNha = toaNha,
        Tang = tang,
        GioiTinhChoPhep = gioiTinhChoPhep,
        TrangThai = trangThai,
        MaLP = maLP,
        MaCN = maCN,
    };

    private static PhongHttpResponse TaoPhongResponse(Phong p) => new(
        p.MaPhong, p.SoPhong, p.ToaNha, p.Tang, p.GioiTinhChoPhep, p.TrangThai,
        p.MaLP, p.LoaiPhong.TenLoaiPhong, p.LoaiPhong.SucChua, p.LoaiPhong.GiaThue,
        p.MaCN, p.TenChiNhanh, p.Giuongs.Count, p.SoGiuongTrong);

    private static GiuongHttpResponse TaoGiuongResponse(Giuong g) => new(
        g.MaGiuong, g.SoGiuong, g.TrangThai, g.MaPhong, g.SoPhong, g.ToaNha);
}
