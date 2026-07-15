namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.FileStorage;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/asset-recovery")]
public sealed class BienBanGiaoNhanController(
    LapBienBanThuHoiTaiSan lapBienBanThuHoi,
    IMinhChungThuHoiStorage minhChungStorage,
    KiemTraQuyenChungTu kiemTraQuyen) : ControllerBase
{
    [Authorize(Roles = "QuanLy")]
    [HttpGet("contracts")]
    public async Task<IActionResult> LayDanhSach([FromQuery] string? tuKhoa = null)
    {
        try
        {
            var danhSach = await lapBienBanThuHoi.LayDanhSachHopDongTraPhongHomNay(tuKhoa);
            return Ok(danhSach.Select(x => new AssetRecoveryListItemHttpResponse(
                x.MaHD,
                x.TenKhachHang,
                x.SoPhong,
                x.ToaNha,
                x.NgayTraPhong,
                x.GioTraPhong.ToString(@"hh\:mm"),
                x.MaLH)));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpGet("contracts/{id}")]
    public async Task<IActionResult> LayChiTiet(string id)
    {
        try
        {
            var chiTiet = await lapBienBanThuHoi.LayChiTietHopDongThuHoi(id);
            return Ok(new AssetRecoveryDetailHttpResponse(
                chiTiet.MaHD,
                chiTiet.TenKhachHang,
                chiTiet.SoPhong,
                chiTiet.ToaNha,
                chiTiet.MaPhong,
                chiTiet.TaiSan.Select(ts => new AssetRecoveryAssetHttpResponse(
                    ts.MaTS,
                    ts.TaiSan.TenTaiSan,
                    ts.SoLuongTieuChuan,
                    ts.TaiSan.GiaTri)).ToList()));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("contracts/{id}")]
    public async Task<IActionResult> LapBienBan(string id, [FromBody] LapBienBanThuHoiHttpRequest request)
    {
        var maNhanVien = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            return Unauthorized(new { Message = "Không xác định được Quản lý đang đăng nhập." });

        try
        {
            var assets = (request.Assets ?? []).Select(a => new TaiSanThuHoiInput(
                a.MaTS,
                a.SoLuong,
                a.TinhTrang,
                a.GhiChu,
                a.MinhChung)).ToList();

            var bienBan = await lapBienBanThuHoi.LapBienBan(id, maNhanVien, assets);
            return Ok(new LapBienBanThuHoiHttpResponse(
                bienBan.MaBienBan,
                bienBan.NgayBanGiao,
                bienBan.MaHD,
                bienBan.LoaiBienBan));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("proofs")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadProof(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null)
            return BadRequest(new { Message = "Vui lòng tải lên ảnh minh chứng." });

        try
        {
            await using var noiDung = file.OpenReadStream();
            var duongDan = await minhChungStorage.Luu(
                new TepMinhChungThuHoi(file.FileName, file.Length, noiDung),
                cancellationToken);
            return Ok(new UploadMinhChungThuHoiHttpResponse(duongDan, Path.GetFileName(duongDan)));
        }
        catch (InvalidDataException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy,KeToan")]
    [HttpGet("proofs/{tenTep}")]
    public async Task<IActionResult> DownloadProof(string tenTep, CancellationToken cancellationToken)
    {
        if (!await kiemTraQuyen.DuocDocThuHoi(tenTep, User.FindFirstValue("MaNV")))
            return NotFound(new { Message = "Không tìm thấy ảnh minh chứng." });
        var noiDung = await minhChungStorage.Doc(tenTep, cancellationToken);
        return noiDung is null
            ? NotFound(new { Message = "Không tìm thấy ảnh minh chứng." })
            : File(noiDung.DuLieu, noiDung.ContentType);
    }
}
