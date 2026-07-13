using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;

namespace HomeStay.Presentation.Controllers;

[ApiController]
[Route("api/payments")]
public class PhieuThuController : ControllerBase
{
    private readonly ThanhToanTraPhong _thanhToanTraPhong;

    public PhieuThuController(ThanhToanTraPhong thanhToanTraPhong)
    {
        _thanhToanTraPhong = thanhToanTraPhong;
    }

    [HttpGet("pds-cho-thu")]
    public async Task<IActionResult> LayDSPhieuDoiSoatDaChot()
    {
        var results = await _thanhToanTraPhong.LayDSPhieuDoiSoatDaChot();
        return Ok(results);
    }

    [HttpGet("pds-details/{maPDS}")]
    public async Task<IActionResult> LayChiTietPhieuDoiSoat(string maPDS)
    {
        try
        {
            var detail = await _thanhToanTraPhong.LayChiTietPhieuDoiSoat(maPDS);
            return Ok(detail);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("phieu-thu")]
    public async Task<IActionResult> TaoPhieuThu([FromBody] TaoPhieuThuHttpRequest request)
    {
        // For testing, NV02 is the login accountant ID
        const string maNV = "NV02";
        try
        {
            var phieuThu = await _thanhToanTraPhong.TienHanhThuTien(
                request.MaPDS,
                request.SoTienThu,
                request.PhuongThucThanhToan,
                request.AnhMinhChung,
                maNV
            );
            return Ok(phieuThu);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
