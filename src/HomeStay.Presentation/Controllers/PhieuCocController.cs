namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
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
    XacNhanKhoanTienCoc xacNhanKhoanTienCoc,
    XetDuyetHoSo xetDuyetHoSo,
    TraCuuPhieuCoc traCuuPhieuCoc,
    HuyPhieuCoc huyPhieuCoc,
    IChungTuCocStorage chungTuStorage) : ControllerBase
{
    [Authorize(Roles = "Sale,QuanLy,KeToan")]
    [HttpGet("lookup")]
    public async Task<IActionResult> TraCuu(
        [FromQuery] string? maPhieuCoc = null,
        [FromQuery] string? sdt = null,
        [FromQuery] string? email = null,
        [FromQuery] string? soGiayTo = null)
    {
        try
        {
            return Ok((await traCuuPhieuCoc.TimKiem(maPhieuCoc, sdt, email, soGiayTo, User.FindFirstValue("MaNV")))
                .Select(TaoPhieuTraCuuResponse));
        }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale,QuanLy,KeToan")]
    [HttpGet("{id}/lookup")]
    public async Task<IActionResult> LayChiTietTraCuu(string id)
    {
        try { return Ok(TaoChiTietTraCuuResponse(await traCuuPhieuCoc.LayChiTiet(id, User.FindFirstValue("MaNV")))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpGet("cancellable")]
    public async Task<IActionResult> LayDanhSachCoTheHuy([FromQuery] string? text = null) =>
        Ok((await traCuuPhieuCoc.LayDanhSachCoTheHuy(text, User.FindFirstValue("MaNV"))).Select(TaoPhieuTraCuuResponse));

    [Authorize(Roles = "Sale")]
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Huy(string id)
    {
        var maNhanVien = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            return Unauthorized(new { Message = "Không xác định được Nhân viên Sale đang đăng nhập." });
        try { return Ok(TaoChiTietTraCuuResponse(await huyPhieuCoc.Huy(id, maNhanVien))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "KeToan")]
    [HttpGet("cancelled-awaiting-reconciliation")]
    public async Task<IActionResult> LayDanhSachDaHuyChoDoiSoat() =>
        Ok((await traCuuPhieuCoc.LayDanhSachDaHuyChoDoiSoat(User.FindFirstValue("MaNV"))).Select(TaoPhieuTraCuuResponse));

    [Authorize(Roles = "QuanLy")]
    [HttpGet("cho-doi-chieu")]
    public async Task<IActionResult> LayDanhSachChoDoiChieu([FromQuery] string? text = null) =>
        Ok((await xacNhanKhoanTienCoc.LayDanhSachChoDoiChieu(text, User.FindFirstValue("MaNV"))).Select(TaoPhieuChoDoiChieuResponse));

    [Authorize(Roles = "QuanLy")]
    [HttpGet("{id}/xac-nhan-tien-coc")]
    public async Task<IActionResult> LayChiTietXacNhanTienCoc(string id)
    {
        try { return Ok(TaoChiTietXacNhanResponse(await xacNhanKhoanTienCoc.LayChiTiet(id, User.FindFirstValue("MaNV")))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("{id}/xac-nhan-tien-coc")]
    public async Task<IActionResult> XacNhanTienCoc(string id)
    {
        var maNhanVien = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            return Unauthorized(new { Message = "Không xác định được Quản lý đang đăng nhập." });
        try
        {
            var ketQua = await xacNhanKhoanTienCoc.XacNhanHopLe(id, maNhanVien);
            return Ok(new KetQuaXacNhanKhoanTienCocHttpResponse(
                TaoChiTietXacNhanResponse(ketQua.PhieuCoc), ketQua.PhieuThu.MaPT,
                ketQua.PhieuThu.SoTienThu, ketQua.PhieuThu.ThoiGian, maNhanVien));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("{id}/yeu-cau-bo-sung")]
    public async Task<IActionResult> YeuCauBoSung(string id, [FromBody] YeuCauBoSungChungTuHttpRequest request)
    {
        try { return Ok(TaoChiTietXacNhanResponse(await xacNhanKhoanTienCoc.YeuCauBoSung(id, request.LyDo, User.FindFirstValue("MaNV")))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpGet("cho-duyet")]
    public async Task<IActionResult> LayDanhSachChoDuyet([FromQuery] string? text = null) =>
        Ok((await xetDuyetHoSo.LayDanhSachChoDuyet(text)).Select(TaoPhieuChoDuyetResponse));

    [Authorize(Roles = "QuanLy")]
    [HttpGet("{id}/xet-duyet")]
    public async Task<IActionResult> LayChiTietXetDuyet(string id)
    {
        try { return Ok(TaoChiTietXetDuyetResponse(await xetDuyetHoSo.LayChiTiet(id))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("{id}/xet-duyet/duyet-toan-bo")]
    public async Task<IActionResult> DuyetToanBo(string id)
    {
        try { return Ok(TaoChiTietXetDuyetResponse(await xetDuyetHoSo.DuyetToanBo(id, User.FindFirstValue("MaNV")))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("{id}/xet-duyet/tu-choi-thanh-vien")]
    public async Task<IActionResult> TuChoiThanhVien(string id, [FromBody] TuChoiThanhVienHttpRequest request)
    {
        try
        {
            await xetDuyetHoSo.TuChoiThanhVien(id, request.MaKH);
            return Ok(new { Message = "Đã từ chối thành viên." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("{id}/xet-duyet/hoan-tac-thanh-vien")]
    public async Task<IActionResult> HoanTacThanhVien(string id, [FromBody] TuChoiThanhVienHttpRequest request)
    {
        try
        {
            await xetDuyetHoSo.HoanTacThanhVien(id, request.MaKH);
            var updated = await xetDuyetHoSo.LayChiTiet(id);
            return Ok(TaoChiTietXetDuyetResponse(updated));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("{id}/xet-duyet/duyet-con-lai")]
    public async Task<IActionResult> DuyetThanhVienConLai(string id)
    {
        try { return Ok(TaoChiTietXetDuyetResponse(await xetDuyetHoSo.DuyetThanhVienConLai(id, User.FindFirstValue("MaNV")))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "QuanLy")]
    [HttpPost("{id}/xet-duyet/tu-choi-ho-so")]
    public async Task<IActionResult> TuChoiHoSo(string id)
    {
        try
        {
            await xetDuyetHoSo.TuChoiHoSo(id, User.FindFirstValue("MaNV"));
            return Ok(new { Message = "Đã hủy hồ sơ." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpGet("cho-thanh-toan")]
    public async Task<IActionResult> LayDanhSachChoThanhToan([FromQuery] string? text = null) =>
        Ok((await ghiNhanThanhToanCoc.LayDanhSachChoThanhToan(text, User.FindFirstValue("MaNV"))).Select(TaoPhieuChoThanhToanResponse));

    [Authorize(Roles = "Sale")]
    [HttpGet("{id}/ghi-nhan-thanh-toan")]
    public async Task<IActionResult> LayChiTietGhiNhanThanhToan(string id)
    {
        try { return Ok(TaoChiTietGhiNhanResponse(await ghiNhanThanhToanCoc.LayChiTiet(id, User.FindFirstValue("MaNV")))); }
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
                User.FindFirstValue("MaNV"),
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
        if (!await traCuuPhieuCoc.DuocDocChungTu(tenTep, User.FindFirstValue("MaNV")))
            return NotFound(new { Message = "Không tìm thấy chứng từ thanh toán." });
        var noiDung = await chungTuStorage.Doc(tenTep, cancellationToken);
        return noiDung is null
            ? NotFound(new { Message = "Không tìm thấy chứng từ thanh toán." })
            : File(noiDung.DuLieu, noiDung.ContentType);
    }

    [Authorize(Roles = "KeToan")]
    [HttpGet("initial")]
    public async Task<IActionResult> LayDanhSachKhoiTao([FromQuery] string? text = null) =>
        Ok((await tinhTienCoc.LayDanhSachKhoiTao(text, User.FindFirstValue("MaNV"))).Select(TaoDanhSachResponse));

    [Authorize(Roles = "KeToan")]
    [HttpGet("{id}")]
    public async Task<IActionResult> LayChiTietTinhTien(string id)
    {
        try { return Ok(TaoChiTietResponse(await tinhTienCoc.LayChiTietVaTinhTien(id, User.FindFirstValue("MaNV")))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "KeToan")]
    [HttpPost("{id}/xac-nhan-tinh-tien")]
    public async Task<IActionResult> XacNhanTinhTien(string id)
    {
        try { return Ok(TaoChiTietResponse(await tinhTienCoc.XacNhanTinhTien(id, User.FindFirstValue("MaNV")))); }
        catch (KeyNotFoundException ex) { return NotFound(new { Message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { Message = ex.Message }); }
    }

    [Authorize(Roles = "Sale")]
    [HttpPost]
    public async Task<IActionResult> TaoPhieuCoc([FromBody] TaoPhieuCocHttpRequest request)
    {
        var maNhanVien = User.FindFirstValue("MaNV");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            return Unauthorized(new { Message = "Không xác định được Nhân viên Sale đang đăng nhập." });

        try
        {
            var phieuCoc = await lapPhieuCoc.TaoPhieuCoc(
                request.MaLichHen,
                request.KhachHang,
                request.MaPhong,
                request.DanhSachGiuong,
                request.HinhThucThue,
                maNhanVien);
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
        phieu.Phong.ToaNha, phieu.TongTien, phieu.HanThanhToan, phieu.LyDoYeuCauBoSung);

    private static ChiTietGhiNhanThanhToanCocHttpResponse TaoChiTietGhiNhanResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.KhachHang.SDT, phieu.MaPhong,
        phieu.Phong.SoPhong, phieu.Phong.ToaNha, phieu.HinhThucThue, phieu.SoGiuongThue,
        phieu.TongTien, phieu.HanThanhToan, phieu.TrangThai, phieu.PhuongThucThanhToan,
        phieu.AnhMinhChung, phieu.LyDoYeuCauBoSung);

    private static PhieuCocChoDoiChieuHttpResponse TaoPhieuChoDoiChieuResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.Phong.SoPhong, phieu.Phong.ToaNha,
        phieu.TongTien, phieu.PhuongThucThanhToan, phieu.AnhMinhChung);

    private static ChiTietXacNhanKhoanTienCocHttpResponse TaoChiTietXacNhanResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.KhachHang.SDT, phieu.MaPhong,
        phieu.Phong.SoPhong, phieu.Phong.ToaNha, phieu.HinhThucThue, phieu.SoGiuongThue,
        phieu.TongTien, phieu.TrangThai, phieu.PhuongThucThanhToan, phieu.AnhMinhChung,
        phieu.MaNV, phieu.Giuongs.Select(g => new GiuongDoiChieuHttpResponse(
            g.MaGiuong, g.SoGiuong, g.TrangThai)).ToList());

    private static PhieuCocChoDuyetHttpResponse TaoPhieuChoDuyetResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.MaPhong,
        phieu.Phong.SoPhong, phieu.Phong.ToaNha, phieu.HinhThucThue,
        phieu.SoGiuongThue, phieu.TongTien, phieu.ThoiDiemCoc);

    private static ChiTietXetDuyetHttpResponse TaoChiTietXetDuyetResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.KhachHang.SDT,
        phieu.MaPhong, phieu.Phong.SoPhong, phieu.Phong.ToaNha,
        phieu.HinhThucThue, phieu.SoGiuongThue, phieu.TongTien,
        phieu.TrangThai, phieu.MaNV,
        phieu.Giuongs.Select(g => new GiuongDoiChieuHttpResponse(
            g.MaGiuong, g.SoGiuong, g.TrangThai)).ToList(),
        phieu.ThanhViens.Select(tv => new ThanhVienDuyetHttpResponse(
            tv.MaKH,
            tv.KhachHang?.HoTen ?? "",
            tv.KhachHang?.NgaySinh,
            tv.KhachHang?.GioiTinh,
            tv.KhachHang?.QuocTich,
            tv.KhachHang?.LoaiGiayTo,
            tv.KhachHang?.SoGiayTo,
            tv.KhachHang?.SDT,
            tv.KhachHang?.Email,
            tv.KhachHang?.DiaChiThuongTru,
            tv.VaiTro, tv.TrangThaiDuyet)).ToList());

    private static PhieuCocTraCuuHttpResponse TaoPhieuTraCuuResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.KhachHang.SDT, phieu.KhachHang.Email,
        phieu.KhachHang.SoGiayTo, phieu.MaPhong, phieu.Phong.SoPhong, phieu.Phong.ToaNha,
        phieu.HinhThucThue, phieu.SoGiuongThue, phieu.TongTien, phieu.ThoiDiemCoc,
        phieu.HanThanhToan, phieu.TrangThai, phieu.DaDongTien, phieu.ThoiDiemHuy, phieu.MaNVHuy);

    private static ChiTietPhieuCocTraCuuHttpResponse TaoChiTietTraCuuResponse(PhieuCoc phieu) => new(
        phieu.MaPhieuCoc, phieu.KhachHang.HoTen, phieu.KhachHang.SDT, phieu.KhachHang.Email,
        phieu.KhachHang.LoaiGiayTo, phieu.KhachHang.SoGiayTo, phieu.MaPhong, phieu.Phong.SoPhong,
        phieu.Phong.ToaNha, phieu.HinhThucThue, phieu.SoGiuongThue, phieu.TongTien,
        phieu.ThoiDiemCoc, phieu.HanThanhToan, phieu.TrangThai, phieu.DaDongTien,
        phieu.ThoiDiemHuy, phieu.MaNVHuy,
        phieu.Giuongs.Select(g => new GiuongTraCuuHttpResponse(g.MaGiuong, g.SoGiuong, g.TrangThai)).ToList());
}
