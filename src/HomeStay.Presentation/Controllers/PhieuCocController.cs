namespace HomeStay.Presentation.Controllers;

using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.FileStorage;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/deposits")]
public sealed class PhieuCocController(
    LapPhieuCoc lapPhieuCoc,
    TinhTienCoc tinhTienCoc,
    GhiNhanThanhToanCoc ghiNhanThanhToanCoc,
    IChungTuCocStorage chungTuStorage) : ControllerBase
{
    [Authorize(Roles = "Sale")]
    [HttpGet("cho-thanh-toan")]
    public async Task<IActionResult> LayDanhSachChoThanhToan([FromQuery] string? text = null) =>
        Ok((await ghiNhanThanhToanCoc.LayDanhSachChoThanhToan(text)).Select(TaoPhieuChoThanhToanResponse));

    [Authorize(Roles = "Sale")]
    [HttpGet("{id}/ghi-nhan-thanh-toan")]
    public async Task<IActionResult> LayChiTietGhiNhanThanhToan(string id)
    {
        try { return Ok(TaoChiTietGhiNhanResponse(await ghiNhanThanhToanCoc.LayChiTiet(id))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpPost("{id}/ghi-nhan-thanh-toan")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> GuiChungTuThanhToan(
        string id,
        [FromForm] GhiNhanThanhToanCocHttpRequest request,
        CancellationToken cancellationToken)
    {
        if (request.ChungTu is null)
            return BadRequest(new { Message = "Vui lòng tải lên chứng từ thanh toán để tiếp tục." });

        try
        {
            await using var noiDung = request.ChungTu.OpenReadStream();
            var phieu = await ghiNhanThanhToanCoc.GuiChungTuThanhToan(
                id,
                request.PhuongThucThanhToan,
                new TepChungTuCoc(request.ChungTu.FileName, request.ChungTu.Length, noiDung),
                cancellationToken);
            return Ok(TaoChiTietGhiNhanResponse(phieu));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidDataException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale,QuanLy")]
    [HttpGet("chung-tu/{tenTep}")]
    public async Task<IActionResult> DocChungTu(string tenTep, CancellationToken cancellationToken)
    {
        var noiDung = await chungTuStorage.Doc(tenTep, cancellationToken);
        return noiDung is null
            ? NotFound(new { Message = "Không tìm thấy chứng từ thanh toán." })
            : File(noiDung.DuLieu, noiDung.ContentType);
    }

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

    private static PhieuCocChoThanhToanHttpResponse TaoPhieuChoThanhToanResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.MaPhong, phieu.Phong.SoPhong,
        phieu.Phong.ToaNha, phieu.TongTien, phieu.HanThanhToan);

    private static ChiTietGhiNhanThanhToanCocHttpResponse TaoChiTietGhiNhanResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.KhachHang.SDT, phieu.MaPhong,
        phieu.Phong.SoPhong, phieu.Phong.ToaNha, phieu.HinhThucThue, phieu.SoGiuongThue,
        phieu.TongTien, phieu.HanThanhToan, phieu.TrangThai, phieu.PhuongThucThanhToan,
        phieu.AnhMinhChung);
}
