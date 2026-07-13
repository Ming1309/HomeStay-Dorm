using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;

namespace HomeStay.Presentation.Controllers;

[ApiController]
[Route("api/refunds")]
public sealed class PhieuHoanCocController : ControllerBase
{
    private readonly LapPhieuHoanCoc _lapPhieuHoanCoc;

    public PhieuHoanCocController(LapPhieuHoanCoc lapPhieuHoanCoc)
    {
        _lapPhieuHoanCoc = lapPhieuHoanCoc;
    }

    [HttpGet("pds-cho-hoan")]
    public async Task<IActionResult> LayDSPhieuDoiSoatCanHoan()
    {
        try
        {
            var results = await _lapPhieuHoanCoc.LayDSPhieuDoiSoatCanHoan();
            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("pds-details/{maPDS}")]
    public async Task<IActionResult> LayChiTietPhieuDoiSoat(string maPDS)
    {
        try
        {
            var details = await _lapPhieuHoanCoc.LayChiTietPhieuDoiSoatDto(maPDS);
            if (details == null) return NotFound("Không tìm thấy thông tin chi tiết phiếu đối soát.");

            return Ok(details);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("phieu-hoan-coc")]
    public async Task<IActionResult> TaoPhieuHoanCoc([FromBody] TaoPhieuHoanCocHttpRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            // NV02 làm kế toán mặc định
            var phieuHoanCoc = await _lapPhieuHoanCoc.ThucHienHoanCoc(
                request.MaPDS,
                request.SoTienHoan,
                request.PhuongThucHoan,
                request.ThongTinNhanTien,
                "NV02"
            );
            return Ok(new
            {
                Code = phieuHoanCoc.MaPHC,
                CustomerName = "", // Sẽ được điền ở Client dựa trên chi tiết
                Amount = phieuHoanCoc.SoTienHoan,
                Method = phieuHoanCoc.PhuongThucHoan == "Cash" ? "cash" : "bank-transfer",
                Date = phieuHoanCoc.ThoiGian.ToString("yyyy-MM-dd"),
                Executor = "Nguyễn Thị Thu — Kế toán"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("phieu-hoan/{maPHC}")]
    public async Task<IActionResult> LayThongTinPhieuHoan(string maPHC)
    {
        var phc = await PhieuHoanCoc.LayThongTinPhieuHoanCoc(maPHC);
        if (phc == null) return NotFound("Không tìm thấy phiếu hoàn cọc.");

        return Ok(phc);
    }
}
